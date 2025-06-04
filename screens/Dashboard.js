import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Dashboard({ navigation, userName }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: Math.random() * 40 + 20,
      opacity: 0.1 + Math.random() * 0.3,
    }));
    setBubbles(generated);
  }, []);

  return (
    <View style={styles.container}>
      {/* BUBBLE BACKGROUND */}
      {bubbles.map((bubble) => (
        <View
          key={bubble.id}
          style={[
            styles.bubble,
            {
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              opacity: bubble.opacity,
            },
          ]}
        />
      ))}

      {/* TEXT + BUTTONS */}
      <Text style={styles.greeting}>HI, {userName?.toUpperCase() || 'USER'} 👋</Text>
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

      {/* Optional Cute Mascot */}
      {/* <Text style={{ fontSize: 40, marginTop: 30 }}>🧸</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#ff69b4',
    zIndex: -1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6, // For Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
