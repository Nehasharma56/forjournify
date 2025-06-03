import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const moods = {
  happy: '😊',
  sad: '😢',
  angry: '😡',
  calm: '😌',
  excited: '🤩',
  tired: '🥱',
};

export default function MoodTracker({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [moodData, setMoodData] = useState({});

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const data = await AsyncStorage.getItem('moodEntries');
      if (data) setMoodData(JSON.parse(data));
    } catch (e) {
      console.error('Failed to load moods:', e);
    }
  };

  const saveMood = async (mood) => {
    const newData = { ...moodData, [selectedDate]: mood };
    setMoodData(newData);
    await AsyncStorage.setItem('moodEntries', JSON.stringify(newData));
  };

  const markedDates = Object.fromEntries(
    Object.entries(moodData).map(([date, mood]) => [
      date,
      { customStyles: { container: { backgroundColor: '#ffd1dc' }, text: { color: 'black' } }, marked: true, dotColor: '#ff69b4' },
    ])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>😊 Mood Tracker</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ ...markedDates, [selectedDate]: { selected: true, selectedColor: '#ffb6c1' } }}
        markingType="custom"
      />
      {selectedDate ? (
        <>
          <Text style={styles.subtitle}>Select mood for {selectedDate}:</Text>
          <View style={styles.moodRow}>
            {Object.entries(moods).map(([key, emoji]) => (
              <TouchableOpacity key={key} onPress={() => saveMood(emoji)} style={styles.moodBtn}>
                <Text style={styles.moodText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.currentMood}>
            Saved Mood: {moodData[selectedDate] || 'None'}
          </Text>
        </>
      ) : (
        <Text style={styles.subtitle}>📅 Pick a date to set your mood</Text>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
        <Text style={styles.backText}>🏠 Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffafc', padding: 20 },
  title: { fontSize: 24, color: '#ff69b4', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginVertical: 10, fontSize: 16, color: '#555' },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 },
  moodBtn: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#ffe4e1',
  },
  moodText: { fontSize: 24 },
  currentMood: { textAlign: 'center', fontSize: 16, marginVertical: 10, color: '#333' },
  backBtn: {
    backgroundColor: '#ffd1dc',
    padding: 12,
    marginTop: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  backText: { color: '#333', fontWeight: '600' },
});
