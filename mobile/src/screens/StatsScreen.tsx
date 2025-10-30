import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getHeatmap, getStreaks, HeatmapData, StreakData } from '../services/api';

export const StatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [streaksData, setStreaksData] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [heatmap, streaks] = await Promise.all([
        getHeatmap(60),
        getStreaks(),
      ]);
      setHeatmapData(heatmap);
      setStreaksData(streaks);
    } catch (error) {
      Alert.alert('Error', 'Failed to load statistics');
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getColorForCount = (count: number): string => {
    if (count === 0) return '#ebedf0';
    if (count === 1) return '#c6e48b';
    if (count === 2) return '#7bc96f';
    if (count === 3) return '#239a3b';
    return '#196127';
  };

  const renderHeatmap = () => {
    // Group heatmap data into weeks (7 days each) - starting from Sunday
    const weeks: HeatmapData[][] = [];
    let currentWeek: HeatmapData[] = [];

    // Pad the beginning if needed
    if (heatmapData.length > 0) {
      const firstDate = new Date(heatmapData[0].date);
      const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday

      // Add empty days at the beginning to align with Sunday
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', count: -1 } as any);
      }
    }

    heatmapData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Push any remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: -1 } as any);
      }
      weeks.push([...currentWeek]);
    }

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const months: { name: string; position: number }[] = [];
    
    // Calculate month positions
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        if (day.date && day.count !== -1) {
          const date = new Date(day.date);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          const dayOfMonth = date.getDate();
          
          // Mark first day of month
          if (dayOfMonth === 1 || (weekIndex === 0 && dayIndex === 0)) {
            if (!months.find(m => m.position === weekIndex)) {
              months.push({ name: monthName, position: weekIndex });
            }
          }
        }
      });
    });

    return (
      <View style={styles.heatmapContainer}>
        <Text style={styles.sectionTitle}>Activity Heatmap (Last 60 Days)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Month labels */}
            <View style={styles.monthLabels}>
              {months.map((month, index) => (
                <Text
                  key={index}
                  style={[
                    styles.monthLabel,
                    { left: month.position * 20 + 28 },
                  ]}
                >
                  {month.name}
                </Text>
              ))}
            </View>

            <View style={styles.heatmap}>
              {/* Day labels */}
              <View style={styles.dayLabels}>
                {weekDays.map((day, index) => (
                  <Text key={index} style={styles.dayLabel}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Heatmap grid */}
              <View style={styles.heatmapGrid}>
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.heatmapColumn}>
                    {week.map((day, dayIndex) => {
                      if (day.count === -1) {
                        return <View key={dayIndex} style={styles.heatmapCell} />;
                      }

                      return (
                        <View
                          key={dayIndex}
                          style={[
                            styles.heatmapCell,
                            styles.heatmapCellFilled,
                            { backgroundColor: getColorForCount(day.count) },
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          {[0, 1, 2, 3, 4].map((count) => (
            <View
              key={count}
              style={[
                styles.legendCell,
                { backgroundColor: getColorForCount(count) },
              ]}
            />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };

  const renderStreaks = () => {
    if (streaksData.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No habits yet. Add habits to track your streaks!
        </Text>
      );
    }

    return (
      <View style={styles.streaksContainer}>
        <Text style={styles.sectionTitle}>Current Streaks</Text>
        {streaksData.map((streak) => (
          <View key={streak.habitId} style={styles.streakItem}>
            <Text style={styles.streakName}>{streak.name}</Text>
            <View style={styles.streakRight}>
              <View style={styles.streakBadge}>
                <Text style={styles.streakNumber}>{streak.streak}</Text>
                <Text style={styles.streakLabel}>
                  {streak.streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
              <View style={styles.fireContainer}>
                {streak.streak > 0 && (
                  <Text style={styles.fireEmoji}>
                    {streak.streak >= 7 ? '🔥' : '✨'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5DADE2" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#5DADE2"
          colors={["#5DADE2"]}
        />
      }
    >
      <Text style={styles.title}>Statistics</Text>

      {renderStreaks()}
      {renderHeatmap()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 10 : 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  streaksContainer: {
    marginBottom: 30,
  },
  streakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    minHeight: 68,
  },
  streakName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  streakRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 90,
    justifyContent: 'center',
  },
  streakNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  streakLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fireContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginVertical: 20,
  },
  heatmapContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  monthLabels: {
    flexDirection: 'row',
    height: 20,
    marginBottom: 5,
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  heatmap: {
    flexDirection: 'row',
  },
  dayLabels: {
    justifyContent: 'space-around',
    marginRight: 6,
    paddingTop: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: '#999',
    height: 16,
    lineHeight: 16,
    fontWeight: '500',
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapColumn: {
    gap: 4,
  },
  heatmapCell: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  heatmapCellFilled: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 4,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  legendText: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 6,
  },
});

