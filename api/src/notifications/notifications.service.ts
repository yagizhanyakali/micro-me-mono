import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Habit } from '../schemas/habit.schema';
import { Entry } from '../schemas/entry.schema';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(Entry.name) private entryModel: Model<Entry>,
  ) {}

  /**
   * Register an FCM token for a user
   */
  async registerFcmToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await this.userModel.findOneAndUpdate(
        { userId },
        {
          $addToSet: { fcmTokens: fcmToken },
          $set: { updatedAt: new Date() },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`FCM token registered for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error registering FCM token: ${error}`);
      throw error;
    }
  }

  /**
   * Unregister an FCM token for a user
   */
  async unregisterFcmToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await this.userModel.findOneAndUpdate(
        { userId },
        {
          $pull: { fcmTokens: fcmToken },
          $set: { updatedAt: new Date() },
        },
      );

      this.logger.log(`FCM token unregistered for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error unregistering FCM token: ${error}`);
      throw error;
    }
  }

  /**
   * Send a notification to specific FCM tokens
   */
  async sendNotification(
    fcmTokens: string[],
    title: string,
    body: string,
  ): Promise<void> {
    if (!fcmTokens || fcmTokens.length === 0) {
      this.logger.warn('No FCM tokens provided for notification');
      return;
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      this.logger.log(
        `Notification sent successfully. Success: ${response.successCount}, Failure: ${response.failureCount}`,
      );

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(fcmTokens[idx]);
            this.logger.warn(`Failed to send to token: ${resp.error?.message}`);
          }
        });

        // Remove invalid tokens from database
        if (invalidTokens.length > 0) {
          await this.removeInvalidTokens(invalidTokens);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending notification: ${error}`);
      throw error;
    }
  }

  /**
   * Remove invalid FCM tokens from all users
   */
  private async removeInvalidTokens(invalidTokens: string[]): Promise<void> {
    try {
      await this.userModel.updateMany(
        { fcmTokens: { $in: invalidTokens } },
        { $pull: { fcmTokens: { $in: invalidTokens } } },
      );
      this.logger.log(`Removed ${invalidTokens.length} invalid tokens`);
    } catch (error) {
      this.logger.error(`Error removing invalid tokens: ${error}`);
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Check for users with incomplete habits and send notifications
   * Runs every day at 8 PM
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'UTC',
  })
  async checkIncompleteHabitsAndNotify(): Promise<void> {
    this.logger.log('Starting incomplete habits check...');

    try {
      const today = this.getTodayDate();

      // Get all users with FCM tokens
      const users = await this.userModel.find({ 
        fcmTokens: { $exists: true, $ne: [] } 
      });

      this.logger.log(`Found ${users.length} users with FCM tokens`);

      for (const user of users) {
        try {
          // Get user's habits
          const habits = await this.habitModel.find({ userId: user.userId });

          if (habits.length === 0) {
            continue; // Skip users with no habits
          }

          // Get today's completed entries for this user
          const todayEntries = await this.entryModel.find({
            userId: user.userId,
            date: today,
          });

          const completedHabitIds = new Set(
            todayEntries.map((entry) => entry.habitId.toString()),
          );

          // Check if all habits are completed
          const incompleteHabits = habits.filter(
            (habit) => !completedHabitIds.has(habit._id.toString()),
          );

          if (incompleteHabits.length > 0) {
            // Send notification
            const title = '⏰ Habit Reminder';
            const body = `You have ${incompleteHabits.length} incomplete habit${incompleteHabits.length > 1 ? 's' : ''} today. Don't break your streak!`;

            await this.sendNotification(user.fcmTokens, title, body);
            this.logger.log(
              `Notification sent to user ${user.userId} - ${incompleteHabits.length} incomplete habits`,
            );
          } else {
            this.logger.log(`User ${user.userId} has completed all habits`);
          }
        } catch (error) {
          this.logger.error(
            `Error checking habits for user ${user.userId}: ${error}`,
          );
          // Continue with next user even if this one fails
        }
      }

      this.logger.log('Incomplete habits check completed');
    } catch (error) {
      this.logger.error(`Error in scheduled notification job: ${error}`);
    }
  }

  /**
   * Manually trigger notification check (for testing)
   */
  async triggerNotificationCheck(): Promise<void> {
    await this.checkIncompleteHabitsAndNotify();
  }
}

