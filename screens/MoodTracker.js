import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';

export default function MoodTracker({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [moodData, setMoodData] = useState({});
  const [tiredness, setTiredness] = useState(3);
  const [happiness, setHappiness] = useState(3);
  const [stress, setStress] = useState(3);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const data = await AsyncStorage.getItem('sliderMoodEntries');
      if (data) {
        setMoodData(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading mood data:', e);
    }
  };

  const saveMood = async () => {
    if (!selectedDate) return;

    const newEntry = { tiredness, happiness, stress };
    const updatedData = { ...moodData, [selectedDate]: newEntry };
    setMoodData(updatedData);

    await AsyncStorage.setItem('sliderMoodEntries', JSON.stringify(updatedData));
    Alert.alert('Saved', 'Mood saved successfully!');
  };

  const deleteMood = async () => {
    if (!selectedDate) return;

    const updated = { ...moodData };
    delete updated[selectedDate];
    setMoodData(updated);

    await AsyncStorage.setItem('sliderMoodEntries', JSON.stringify(updated));
    Alert.alert('Deleted', 'Mood deleted!');
  };

  const getWeekChartData = () => {
    const today = new Date();
    const labels = [];
    const avgScores = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const entry = moodData[key];

      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      if (entry) {
        const avg = (entry.tiredness + entry.happiness + entry.stress) / 3;
        avgScores.push(avg);
      } else {
        avgScores.push(0);
      }
    }

    return { labels, avgScores };
  };

  const { labels, avgScores } = getWeekChartData();

  const markedDates = Object.keys(moodData).reduce((acc, date) => {
    acc[date] = {
      customStyles: {
        container: { backgroundColor: '#ffd1dc' },
        text: { color: 'black' },
      },
      marked: true,
      dotColor: '#ff69b4',
    };
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Mood Tracker</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#ffb6c1' },
        }}
        markingType="custom"
      />

      {selectedDate ? (
        <>
          <Text style={styles.subtitle}>Mood for {selectedDate}</Text>

          <Text style={styles.sliderLabel}>😴 Tiredness: {tiredness}</Text>
          <Slider
            style={{ marginHorizontal: 10 }}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={tiredness}
            onValueChange={setTiredness}
            minimumTrackTintColor="#ff69b4"
            thumbTintColor="#ff69b4"
          />

          <Text style={styles.sliderLabel}>😊 Happiness: {happiness}</Text>
          <Slider
            style={{ marginHorizontal: 10 }}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={happiness}
            onValueChange={setHappiness}
            minimumTrackTintColor="#ffa07a"
            thumbTintColor="#ffa07a"
          />

          <Text style={styles.sliderLabel}>😫 Stress: {stress}</Text>
          <Slider
            style={{ marginHorizontal: 10 }}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={stress}
            onValueChange={setStress}
            minimumTrackTintColor="#9370db"
            thumbTintColor="#9370db"
          />

          <TouchableOpacity onPress={saveMood} style={styles.saveBtn}>
            <Text style={styles.saveText}>💾 Save Mood</Text>
          </TouchableOpacity>

          {moodData[selectedDate] && (
            <TouchableOpacity onPress={deleteMood} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>🗑️ Delete Mood</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.subtitle}>📅 Pick a date to set your mood</Text>
      )}

      {avgScores.some((score) => score > 0) && (
        <>
          <Text style={styles.sectionHeader}>📈 Weekly Mood Trend</Text>
          <LineChart
            data={{
              labels,
              datasets: [{ data: avgScores }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fffafc',
              backgroundGradientFrom: '#fffafc',
              backgroundGradientTo: '#ffe4e1',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
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
        <Text style={styles.backText}>🏠 Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f5',
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#e75480',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'sans-serif-medium',
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 14,
    fontSize: 17,
    color: '#444',
  },
  sliderLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 14,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#baffc9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#2e8b57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveText: {
    color: '#004d00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: '#ffb3ba',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 10,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteText: {
    color: '#800000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c71585',
    marginTop: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#ffd6ec',
    padding: 14,
    marginTop: 24,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#c71585',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  backText: {
    color: '#6a1b4d',
    fontWeight: '600',
    fontSize: 16,
  },
});
