import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JournalScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [entry, setEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState({});
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  useEffect(() => {
    loadJournal();
  }, [selectedDate]);

  const saveJournal = async () => {
    if (!selectedDate) return;
    try {
      const updatedEntries = { ...savedEntries, [selectedDate]: entry };
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setSavedEntries(updatedEntries);
      setEntry(entry);
      setSavedMessageVisible(true);
      setTimeout(() => setSavedMessageVisible(false), 2000);
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
    } catch (error) {
      console.error("Failed to delete entry", error);
    }
  };

  const groupByMonth = () => {
    const grouped = {};
    for (const date in savedEntries) {
      const monthName = new Date(date).toLocaleString('default', { month: 'long' });
      if (!grouped[monthName]) {
        grouped[monthName] = [];
      }
      grouped[monthName].push({ date, text: savedEntries[date] });
    }
    return grouped;
  };

  const renderGroupedJournals = () => {
    const grouped = groupByMonth();
    return Object.keys(grouped).map((month) => (
      <View key={month}>
        <Text style={styles.monthHeader}>📅 {month}</Text>
        {grouped[month].map(({ date, text }) => (
          <View key={date} style={styles.journalCard}>
            <View style={styles.journalHeader}>
              <Text style={styles.journalDate}>{date}</Text>
              <TouchableOpacity onPress={() => deleteEntry(date)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.journalText}>{text}</Text>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container}>
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
      />

      {selectedDate ? <Text style={styles.dateText}>Journal for: {selectedDate}</Text> : null}

      {savedMessageVisible && (
        <View style={styles.popUp}>
          <Text style={styles.popUpText}>✅ Saved!</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Write your thoughts here..."
        multiline
        value={entry}
        onChangeText={setEntry}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
        <Text style={styles.saveText}>💾 Save Journal</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>🗂️ Previous Journals</Text>
      {Object.keys(savedEntries).length > 0 ? renderGroupedJournals() : (
        <Text style={styles.noJournals}>No past journals yet!</Text>
      )}

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => setEntry('')}>
          <Text style={styles.bottomBtnText}>🧹 Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBtn} onPress={loadJournal}>
          <Text style={styles.bottomBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.bottomBtnText}>🏠 Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffafc', padding: 20 },
  header: { fontSize: 24, color: '#ff69b4', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  dateText: { fontSize: 16, color: '#555', marginVertical: 10, textAlign: 'center' },
  input: {
    minHeight: 150,
    backgroundColor: '#ffe4e1',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#ffb6c1',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  popUp: {
    position: 'absolute',
    top: 360,
    left: '35%',
    backgroundColor: '#d1ffd6',
    padding: 8,
    borderRadius: 10,
    zIndex: 10,
  },
  popUpText: {
    color: '#228b22',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#ff69b4' },
  monthHeader: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 5 },
  journalCard: {
    backgroundColor: '#ffeef1',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  journalDate: { fontWeight: 'bold', color: '#ff69b4' },
  deleteBtn: { fontSize: 16 },
  journalText: { fontSize: 15, color: '#333' },
  noJournals: { textAlign: 'center', fontStyle: 'italic', color: '#aaa' },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 40,
  },
  bottomBtn: {
    backgroundColor: '#ffd1dc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  bottomBtnText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
