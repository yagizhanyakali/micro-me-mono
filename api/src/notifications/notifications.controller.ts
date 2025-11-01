import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(
    @User() userId: string,
    @Body() registerFcmTokenDto: RegisterFcmTokenDto,
  ) {
    await this.notificationsService.registerFcmToken(
      userId,
      registerFcmTokenDto.fcmToken,
    );
    return { message: 'FCM token registered successfully' };
  }

  @Post('unregister-token')
  async unregisterToken(
    @User() userId: string,
    @Body() registerFcmTokenDto: RegisterFcmTokenDto,
  ) {
    await this.notificationsService.unregisterFcmToken(
      userId,
      registerFcmTokenDto.fcmToken,
    );
    return { message: 'FCM token unregistered successfully' };
  }

  @Post('test-notification')
  async testNotification() {
    await this.notificationsService.triggerNotificationCheck();
    return { message: 'Notification check triggered' };
  }
}

