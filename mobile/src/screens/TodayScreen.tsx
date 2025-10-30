import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  getHabits,
  createHabit,
  deleteHabit,
  getTodayEntries,
  createEntry,
  deleteEntry,
  Habit,
} from '../services/api';

const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const TodayScreen: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [habitName, setHabitName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [habitsData, todayEntries] = await Promise.all([
        getHabits(),
        getTodayEntries(),
      ]);
      setHabits(habitsData);
      setCompletedHabits(new Set(todayEntries));
    } catch (error) {
      Alert.alert('Error', 'Failed to load habits. Please try again.');
      console.error('Error loading data:', error);
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

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (habits.length >= 4) {
      Alert.alert('Limit Reached', 'You can only have 4 habits at a time');
      return;
    }

    setLoading(true);
    try {
      await createHabit(habitName.trim());
      setHabitName('');
      await loadData();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create habit'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (id: string, name: string) => {
    Alert.alert('Delete Habit', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(id);
            await loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  const handleToggleHabit = async (habitId: string) => {
    const today = getTodayDate();
    const isCompleted = completedHabits.has(habitId);

    try {
      if (isCompleted) {
        await deleteEntry(habitId, today);
        setCompletedHabits((prev) => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
      } else {
        await createEntry(habitId, today);
        setCompletedHabits((prev) => new Set(prev).add(habitId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
      console.error('Error toggling habit:', error);
    }
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isCompleted = completedHabits.has(item._id);

    return (
      <View style={styles.habitItem}>
        <TouchableOpacity
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          onPress={() => handleToggleHabit(item._id)}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
          {item.name}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteHabit(item._id, item.name)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const canAddHabit = habits.length < 4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Habits</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</Text>

      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No habits yet. Add your first habit below!
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {canAddHabit && (
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter habit name"
            value={habitName}
            onChangeText={setHabitName}
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={handleAddHabit}
          />
          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddHabit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!canAddHabit && (
        <View style={styles.limitMessage}>
          <Text style={styles.limitMessageText}>
            Maximum of 4 habits reached
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  habitItem: {
    flexDirection: 'row',
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
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    borderRadius: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  addContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  limitMessage: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  limitMessageText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
});

