import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getHeatmap, getStreaks, HeatmapData, StreakData } from '../services/api';

export const StatsScreen: React.FC = () => {
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
    // Group heatmap data into weeks (7 days each)
    const weeks: HeatmapData[][] = [];
    let currentWeek: HeatmapData[] = [];

    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <View style={styles.heatmapContainer}>
        <Text style={styles.sectionTitle}>Activity Heatmap (Last 60 Days)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.heatmap}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapColumn}>
                {week.map((day, dayIndex) => {
                  const date = new Date(day.date);
                  const dayLabel = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <View key={dayIndex} style={styles.heatmapCellWrapper}>
                      <View
                        style={[
                          styles.heatmapCell,
                          { backgroundColor: getColorForCount(day.count) },
                        ]}
                      />
                      {dayIndex === 0 && weekIndex % 4 === 0 && (
                        <Text style={styles.heatmapDateLabel}>{dayLabel}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
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
            <View style={styles.streakInfo}>
              <Text style={styles.streakName}>{streak.name}</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakNumber}>{streak.streak}</Text>
                <Text style={styles.streakLabel}>
                  {streak.streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
            {streak.streak > 0 && (
              <View style={styles.fireContainer}>
                <Text style={styles.fireEmoji}>
                  {streak.streak >= 7 ? '🔥' : '✨'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  streaksContainer: {
    marginBottom: 30,
  },
  streakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  streakBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  streakNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  streakLabel: {
    color: '#fff',
    fontSize: 14,
  },
  fireContainer: {
    width: 30,
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginVertical: 20,
  },
  heatmapContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heatmap: {
    flexDirection: 'row',
    gap: 3,
  },
  heatmapColumn: {
    gap: 3,
  },
  heatmapCellWrapper: {
    position: 'relative',
  },
  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatmapDateLabel: {
    fontSize: 8,
    color: '#666',
    position: 'absolute',
    left: 15,
    top: 0,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 3,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 5,
  },
});

