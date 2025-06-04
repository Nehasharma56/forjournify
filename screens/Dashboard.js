import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Dashboard({ navigation, userName }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: Math.random() * 60 + 30,
      opacity: 0.15 + Math.random() * 0.3,
    }));
    setBubbles(generated);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background bubbles */}
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

      {/* Glowing Greeting Box */}
      <View style={styles.greetingBox}>
        <Text style={styles.greeting}>HI, {userName?.toUpperCase() || 'USER'} 👋</Text>
        <Text style={styles.subtitle}>Your cozy space for mindful days ✨</Text>
      </View>

      {/* Feature Buttons */}
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
    flex: 1,
    backgroundColor: '#ffe9f0', // light pink background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#ff69b4',
    zIndex: -1,
  },
  greetingBox: {
    backgroundColor: '#fff',
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 35,
    marginBottom: 40,
    alignItems: 'center',

    // Glowing shadow
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff1493',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginVertical: 12,
    width: '100%',
    alignItems: 'center',

    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8, // Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
