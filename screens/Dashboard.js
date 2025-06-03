import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Dashboard({ navigation, userName }) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {userName || 'User'} 👋</Text>
      <Text style={styles.subtitle}>Choose your vibe for today 🌈</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Journal')}>
        <Text style={styles.buttonText}>📓 Daily Journaling</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MoodTracker')}>
        <Text style={styles.buttonText}>😊 Mood Tracker</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Productivity')}>
        <Text style={styles.buttonText}>📈 Productivity Corner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#ff69b4', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 30 },
  button: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
