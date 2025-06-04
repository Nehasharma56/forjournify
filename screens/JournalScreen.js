import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function JournalScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [entry, setEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState({});
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // fade for popup
  const [expandedDates, setExpandedDates] = useState({}); // track which entries are expanded

  useEffect(() => {
    loadJournal();
  }, [selectedDate]);

  useEffect(() => {
    if (savedMessageVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setSavedMessageVisible(false));
        }, 1800);
      });
    }
  }, [savedMessageVisible]);

  const saveJournal = async () => {
    if (!selectedDate) return;
    try {
      const updatedEntries = { ...savedEntries, [selectedDate]: entry };
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setSavedEntries(updatedEntries);
      setSavedMessageVisible(true);
    } catch (error) {
      console.error("Failed to save journal entry", error);
    }
  };

  const loadJournal = async () => {
    try {
      const data = await AsyncStorage.getItem('journalEntries');
      if (data) {
        const parsed = JSON.parse(data);
        setSavedEntries(parsed);
        if (selectedDate) {
          setEntry(parsed[selectedDate] || '');
        }
      }
    } catch (error) {
      console.error("Failed to load journal entries", error);
    }
  };

  const deleteEntry = async (date) => {
    try {
      const updated = { ...savedEntries };
      delete updated[date];
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updated));
      setSavedEntries(updated);
      if (selectedDate === date) setEntry('');
      // Also remove from expanded state
      setExpandedDates((prev) => {
        const copy = { ...prev };
        delete copy[date];
        return copy;
      });
    } catch (error) {
      console.error("Failed to delete entry", error);
    }
  };

  const groupByMonth = () => {
    const grouped = {};
    for (const date in savedEntries) {
      const monthName = new Date(date).toLocaleString('default', { month: 'long' });
      if (!grouped[monthName]) grouped[monthName] = [];
      grouped[monthName].push({ date, text: savedEntries[date] });
    }
    return grouped;
  };

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const renderGroupedJournals = () => {
    const grouped = groupByMonth();
    return Object.keys(grouped).map((month) => (
      <View key={month} style={{ marginBottom: 15 }}>
        <Text style={styles.monthHeader}>📅 {month}</Text>
        {grouped[month].map(({ date, text }) => (
          <View key={date} style={styles.journalCard}>
            <View style={styles.journalHeader}>
              <TouchableOpacity onPress={() => toggleExpand(date)} style={{ flex: 1 }}>
                <Text style={styles.journalDate}>{date}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteEntry(date)} style={styles.deleteBtn}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {expandedDates[date] && (
              <Text style={styles.journalText}>{text}</Text>
            )}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Background bubbles */}
      {[...Array(20)].map((_, i) => {
        const size = Math.random() * 50 + 20;
        const left = Math.random() * screenWidth;
        const top = Math.random() * screenHeight * 0.6;
        const opacity = 0.08 + Math.random() * 0.12;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              backgroundColor: '#ffc0cb',
              width: size,
              height: size,
              borderRadius: size / 2,
              left,
              top,
              opacity,
              zIndex: -1,
            }}
          />
        );
      })}

      <Text style={styles.header}>📓 Daily Journaling</Text>

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setEntry(savedEntries[day.dateString] || '');
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: '#ffb6c1',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#ffb6c1',
          todayTextColor: '#ff1493',
          arrowColor: '#ff69b4',
          monthTextColor: '#ff69b4',
          textMonthFontWeight: 'bold',
          dayTextColor: '#ff69b4',
          textDayFontWeight: '600',
        }}
        style={styles.calendar}
      />

      {selectedDate ? <Text style={styles.dateText}>Journal for: {selectedDate}</Text> : null}

      {savedMessageVisible && (
        <Animated.View style={[styles.popUp, { opacity: fadeAnim }]}>
          <Text style={styles.popUpText}>✅ Saved!</Text>
        </Animated.View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Write your thoughts here..."
        multiline
        value={entry}
        onChangeText={setEntry}
        placeholderTextColor="#ffaad4"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
        <Text style={styles.saveText}>💾 Save Journal</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>🗂️ Previous Journals</Text>
      {Object.keys(savedEntries).length > 0 ? (
        renderGroupedJournals()
      ) : (
        <Text style={styles.noJournals}>No past journals yet!</Text>
      )}

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => setEntry('')}>
          <Text style={styles.bottomBtnText}>🧹 Clear</Text>
        </TouchableOpacity>

        {/* Removed Refresh button */}

        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.bottomBtnText}>🏠 Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f5', // soft pinkish white
    padding: 20,
  },
  calendar: {
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    color: '#ff1493',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: '#ffb6c1',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    minHeight: 170,
    backgroundColor: '#ffe4e8',
    borderRadius: 25,
    padding: 18,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#ff8fb1',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  saveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.7,
  },
  popUp: {
    position: 'absolute',
    top: 360,
    left: '35%',
    backgroundColor: '#d1ffd6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#22aa22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  popUpText: {
    color: '#228b22',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: '#ff69b4',
    textAlign: 'center',
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b3477d',
    marginTop: 20,
    marginBottom: 8,
  },
  journalCard: {
    backgroundColor: '#ffe8f1',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#ff7eb9',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    alignItems: 'center',
  },
  journalDate: {
    fontWeight: '700',
    color: '#d63b73',
    fontSize: 16,
  },
  deleteBtn: {
    paddingHorizontal: 6,
  },
  journalText: {
    fontSize: 15,
    color: '#4a2a4a',
    lineHeight: 22,
    marginTop: 10,
  },
  noJournals: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#c487a0',
    marginTop: 10,
    fontSize: 14,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 40,
  },
  bottomBtn: {
    backgroundColor: '#ffc6d2',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 7,
  },
  bottomBtnText: {
    fontSize: 15,
    color: '#7f3f61',
    fontWeight: '700',
  },
});
