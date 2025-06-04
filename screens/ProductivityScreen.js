import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function ProductivityScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const [habit, setHabit] = useState('');
  const [habits, setHabits] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
    loadHabits();
  }, []);

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  };

  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (task.trim() === '') return;
    const newTasks = [...tasks, { id: Date.now().toString(), text: task, completed: false }];
    saveTasks(newTasks);
    setTask('');
  };

  const toggleComplete = (id) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    Alert.alert('Delete Task?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = tasks.filter(t => t.id !== id);
          saveTasks(filtered);
        }
      }
    ]);
  };

  const loadHabits = async () => {
    const saved = await AsyncStorage.getItem('habits');
    if (saved) setHabits(JSON.parse(saved));
  };

  const saveHabits = async (newHabits) => {
    setHabits(newHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
  };

  const addHabit = () => {
    if (habit.trim() === '') return;
    const newHabit = {
      id: Date.now().toString(),
      text: habit,
      completedDates: [],
    };
    const newHabits = [...habits, newHabit];
    saveHabits(newHabits);
    setHabit('');
  };

  const toggleHabitDate = (habitId, date) => {
    const newHabits = habits.map(h => {
      if (h.id === habitId) {
        const dateStr = format(date, 'yyyy-MM-dd');
        let updatedDates = [...h.completedDates];
        if (updatedDates.includes(dateStr)) {
          updatedDates = updatedDates.filter(d => d !== dateStr);
        } else {
          updatedDates.push(dateStr);
        }
        return { ...h, completedDates: updatedDates };
      }
      return h;
    });
    saveHabits(newHabits);
  };

  const deleteHabit = (habitId) => {
    Alert.alert('Delete Habit?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = habits.filter(h => h.id !== habitId);
          saveHabits(filtered);
        }
      }
    ]);
  };

  const onChangeDate = (event, date) => {
    setShowDatePicker(false);
    if (date && selectedHabitId) {
      toggleHabitDate(selectedHabitId, date);
    }
  };

  const renderHabitCalendar = (habit) => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const completed = habit.completedDates.includes(dayStr);
      days.push(
        <TouchableOpacity
          key={`${habit.id}-${dayStr}`}
          style={[
            styles.dayBox,
            completed ? styles.dayCompleted : styles.dayNotCompleted
          ]}
          onPress={() => {
            setSelectedHabitId(habit.id);
            setSelectedDate(day);
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.dayText}>{format(day, 'EEE')}</Text>
          <Text style={styles.dayDate}>{format(day, 'd')}</Text>
        </TouchableOpacity>
      );
    }
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>{days}</ScrollView>;
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <Ionicons
          name={item.completed ? 'checkbox' : 'square-outline'}
          size={24}
          color="#4caf50"
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.taskText,
          { textDecorationLine: item.completed ? 'line-through' : 'none' }
        ]}
      >
        {item.text}
      </Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Ionicons name="trash" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderHabitItem = ({ item }) => (
    <View style={styles.habitCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.habitText}>{item.text}</Text>
        {renderHabitCalendar(item)}
      </View>
      <TouchableOpacity onPress={() => deleteHabit(item.id)} style={{ paddingLeft: 10 }}>
        <Ionicons name="trash" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const productivityScore = () => {
    if (tasks.length === 0 && habits.length === 0) return 0;
    const taskScore = tasks.length === 0 ? 0 : (tasks.filter(t => t.completed).length / tasks.length);
    let totalHabitScore = 0;
    if (habits.length > 0) {
      habits.forEach(h => {
        let completedCount = 0;
        for (let i = 0; i < 7; i++) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          if (h.completedDates.includes(format(day, 'yyyy-MM-dd'))) {
            completedCount++;
          }
        }
        totalHabitScore += completedCount / 7;
      });
      totalHabitScore = totalHabitScore / habits.length;
    }
    return Math.round((taskScore + totalHabitScore) / 2 * 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Productivity Score</Text>
        <Text style={styles.scoreValue}>{productivityScore()}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 To-Do List</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter a task"
            style={styles.input}
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity onPress={addTask} style={styles.addButton}>
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTaskItem}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Habit Tracker</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Add a new habit"
            style={styles.input}
            value={habit}
            onChangeText={setHabit}
          />
          <TouchableOpacity onPress={addHabit} style={styles.addButton}>
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={renderHabitItem}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce4ec',
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  scoreContainer: {
    backgroundColor: '#ff80ab',
    borderRadius: 20,
    paddingVertical: 30,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  scoreTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreValue: {
    color: 'white',
    fontSize: 46,
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    color: '#c2185b',
  },

  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#f8bbd0',
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff0f5',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#ec407a',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 3,
  },
  addText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8bbd0',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  taskText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: '#880e4f',
  },

  habitCard: {
    flexDirection: 'row',
    backgroundColor: '#e1bee7',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  habitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a148c',
    marginBottom: 6,
  },

  dayBox: {
    width: 52,
    height: 60,
    marginRight: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  dayCompleted: {
    backgroundColor: '#81c784',
  },
  dayNotCompleted: {
    backgroundColor: '#ce93d8',
  },
  dayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayDate: {
    color: 'white',
    fontSize: 14,
    marginTop: 3,
  },
});
