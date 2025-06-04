import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

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
  const [streak, setStreak] = useState(0);
  const [moodCount, setMoodCount] = useState({});

  useEffect(() => {
    loadMoods();
  }, []);

  useEffect(() => {
    calculateStreak();
    countMoods();
  }, [moodData]);

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

  const deleteMood = async (date) => {
    const updated = { ...moodData };
    delete updated[date];
    setMoodData(updated);
    await AsyncStorage.setItem('moodEntries', JSON.stringify(updated));
  };

  const calculateStreak = () => {
    const dates = Object.keys(moodData).sort().reverse();
    let streakCount = 0;
    let today = new Date();

    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      if (date.toDateString() === today.toDateString()) {
        streakCount++;
        today.setDate(today.getDate() - 1);
      } else break;
    }

    setStreak(streakCount);
  };

  const countMoods = () => {
    const count = {};
    Object.values(moodData).forEach((m) => {
      count[m] = (count[m] || 0) + 1;
    });
    setMoodCount(count);
  };

  // Convert emojis to scores for sliders (example mapping)
  const moodScores = {
    '😊': 5,
    '🤩': 5,
    '😌': 4,
    '🥱': 1,
    '😢': 2,
    '😡': 1,
  };

  // Get last 7 days data with scores for chart
  const getLast7DaysData = () => {
    const today = new Date();
    const labels = [];
    const scores = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const moodEmoji = moodData[key];
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      scores.push(moodEmoji && moodScores[moodEmoji] ? moodScores[moodEmoji] : 0);
    }

    return { labels, scores };
  };

  const { labels, scores } = getLast7DaysData();

  const markedDates = Object.fromEntries(
    Object.entries(moodData).map(([date]) => [
      date,
      { customStyles: { container: { backgroundColor: '#ffd1dc' }, text: { color: 'black' } }, marked: true, dotColor: '#ff69b4' },
    ])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>😊 Mood Tracker</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ ...markedDates, [selectedDate]: { selected: true, selectedColor: '#ffb6c1' } }}
        markingType="custom"
      />

      {selectedDate ? (
        <>
          <Text style={styles.subtitle}>How do you feel on {selectedDate}?</Text>
          <View style={styles.moodRow}>
            {Object.entries(moods).map(([key, emoji]) => (
              <TouchableOpacity key={key} onPress={() => saveMood(emoji)} style={styles.moodBtn}>
                <Text style={styles.moodText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.currentMood}>Mood: {moodData[selectedDate] || 'None'}</Text>
          {moodData[selectedDate] && (
            <TouchableOpacity onPress={() => deleteMood(selectedDate)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>🗑️ Delete Mood</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.subtitle}>📅 Pick a date to set your mood</Text>
      )}

      <Text style={styles.sectionHeader}>🔥 Current Streak: {streak} day(s)</Text>

      <Text style={styles.sectionHeader}>📊 Mood Summary</Text>
      {Object.entries(moodCount).map(([emoji, count]) => (
        <Text key={emoji} style={styles.summaryText}>
          {emoji} — {count} time(s)
        </Text>
      ))}

      {/* Conditionally render chart only if at least one score > 0 */}
      {scores.some((score) => score > 0) && (
        <>
          <Text style={styles.sectionHeader}>📈 Weekly Mood Trend</Text>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: scores,
                  strokeWidth: 2,
                  color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#fffafc',
              backgroundGradientFrom: '#fffafc',
              backgroundGradientTo: '#ffe4e1',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 20, 147, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#ff69b4',
              },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
            fromZero
          />
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
        <Text style={styles.backText}>🏠 Back</Text>
      </TouchableOpacity>
    </ScrollView>
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
  currentMood: { textAlign: 'center', fontSize: 16, marginTop: 10, color: '#333' },
  deleteBtn: {
    backgroundColor: '#ffcccc',
    marginHorizontal: 100,
    marginTop: 10,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  deleteText: { color: '#aa0000', fontWeight: '600' },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginTop: 20,
    marginBottom: 10,
  },
  summaryText: { fontSize: 15, color: '#444', marginBottom: 3 },
  backBtn: {
    backgroundColor: '#ffd1dc',
    padding: 12,
    marginTop: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  backText: { color: '#333', fontWeight: '600' },
});
