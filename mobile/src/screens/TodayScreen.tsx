import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, todayEntries] = await Promise.all([
        getHabits(),
        getTodayEntries(),
      ]);

      setHabits(habitsData);
      setCompletedHabits(new Set(todayEntries));
    } catch (error) {
      Alert.alert('Error', 'Failed to load habits. Please try again.');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setLoading(true);
    try {
      await createHabit(newHabitName.trim(), selectedEmoji || undefined);
      setNewHabitName('');
      setSelectedEmoji('');
      setModalVisible(false);
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

  const handleDeleteHabit = async (id: string) => {
    setLoading(true);
    try {
      await deleteHabit(id);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete habit');
    } finally {
      setLoading(false);
    }
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

  const openAddHabitModal = () => {
    setSelectedEmoji('');
    setModalVisible(true);
  };

  const renderHabitSlot = (index: number) => {
    const habit = habits[index];
    const isCompleted = habit ? completedHabits.has(habit._id) : false;

    if (habit) {
      return (
        <View key={index} style={styles.habitSlot}>
          <Text style={styles.habitLabel}>Habit {index + 1}</Text>
          <TouchableOpacity
            style={[
              styles.habitCard,
              isCompleted && styles.habitCardCompleted,
            ]}
            onPress={() => handleToggleHabit(habit._id)}
            onLongPress={() => {
              Alert.alert('Delete Habit', `Delete "${habit.name}"?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => handleDeleteHabit(habit._id),
                },
              ]);
            }}
          >
            <Text style={[styles.habitText, isCompleted && styles.habitTextCompleted]}>
              {habit.name}
            </Text>
            <View style={styles.habitIconContainer}>
              <Text style={styles.habitIcon}>
                {isCompleted ? '✓' : (habit.emoji || '✓')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={index} style={styles.habitSlot}>
        <Text style={styles.habitLabel}>Habit {index + 1}</Text>
        <TouchableOpacity
          style={styles.habitCardEmpty}
          onPress={() => openAddHabitModal()}
        >
          <Text style={styles.habitTextEmpty}>Add a new habit</Text>
          <View style={styles.habitIconContainer}>
            <Text style={styles.addIcon}>⊕</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && habits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5DADE2" />
        <Text style={styles.loadingText}>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5DADE2"
            colors={["#5DADE2"]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Set Your Habits</Text>
          <Text style={styles.subtitle}>
            Define up to four daily habits to track.
          </Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {completedHabits.size} of {habits.length} completed today
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: habits.length > 0 ? `${(completedHabits.size / habits.length) * 100}%` : '0%' },
              ]}
            />
          </View>
        </View>

        <View style={styles.habitsContainer}>
          {[0, 1, 2, 3].map((index) => renderHabitSlot(index))}
        </View>
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Habit</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter habit name"
              placeholderTextColor="#999"
              value={newHabitName}
              onChangeText={setNewHabitName}
              maxLength={100}
              autoFocus
            />

            <Text style={styles.emojiSectionTitle}>Choose an Emoji (optional)</Text>
            <TextInput
              style={styles.emojiInput}
              placeholder="Tap to select"
              placeholderTextColor="#666"
              value={selectedEmoji}
              onChangeText={(text) => {
                // Only keep the first emoji (properly handle multi-byte emojis)
                const firstEmoji = Array.from(text)[0] || '';
                setSelectedEmoji(firstEmoji);
              }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setModalVisible(false);
                  setNewHabitName('');
                  setSelectedEmoji('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButtonSave,
                  loading && styles.modalButtonDisabled,
                ]}
                onPress={handleAddHabit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFA726',
    borderRadius: 4,
  },
  habitsContainer: {
    gap: 24,
  },
  habitSlot: {
    gap: 8,
  },
  habitLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderRadius: 12,
    padding: 18,
    minHeight: 68,
  },
  habitCardCompleted: {
    backgroundColor: '#1e4d2b',
    borderColor: '#4CAF50',
  },
  habitCardEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderRadius: 12,
    padding: 18,
    minHeight: 68,
    borderStyle: 'dashed',
  },
  habitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  habitTextCompleted: {
    color: '#4CAF50',
  },
  habitTextEmpty: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    flex: 1,
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  habitIcon: {
    fontSize: 20,
  },
  addIcon: {
    fontSize: 24,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSave: {
    flex: 1,
    backgroundColor: '#5DADE2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#3a3a3a',
  },
  modalButtonTextSave: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emojiSectionTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    fontWeight: '600',
  },
  emojiInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    minHeight: 68,
  },
});

