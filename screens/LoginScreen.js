import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const NUM_BUBBLES = 24;
const BUBBLE_COLORS = ['#ffb6c1', '#ffe4e1', '#ffc0cb', '#f8bbd0', '#fce4ec', '#f9d5e5'];

export default function LoginScreen({ navigation, onSetUserName }) {
  const [name, setName] = useState('');
  const [bubbleAnims, setBubbleAnims] = useState([]);

  const bubbles = Array(NUM_BUBBLES)
    .fill()
    .map(() => ({
      size: Math.random() * 80 + 30,
      left: Math.random() * width,
      top: Math.random() * height,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    }));

  useEffect(() => {
    const anims = bubbles.map(() => new Animated.Value(0));
    setBubbleAnims(anims);

    anims.forEach((anim, i) => {
      const float = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -15,
            duration: 3000 + i * 10,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 15,
            duration: 3000 + i * 10,
            useNativeDriver: true,
          }),
        ]).start(() => float());
      };
      float();
    });
  }, []);

  const handleStart = () => {
    if (name.trim()) {
      onSetUserName(name.trim());
      navigation.replace('Dashboard');
    } else {
      alert('Please enter your name!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {bubbleAnims.length === NUM_BUBBLES &&
        bubbles.map((bubble, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              {
                width: bubble.size,
                height: bubble.size,
                left: bubble.left,
                top: bubble.top,
                backgroundColor: bubble.color,
                transform: [{ translateY: bubbleAnims[i] }],
              },
            ]}
          />
        ))}

      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Journify 💖</Text>
        <Text style={styles.subtitle}>your mood & productivity buddy</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>✨ Let’s Go!</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 30,
    paddingTop: 50,
    borderRadius: 24,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    width: '85%',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#ffe4ec',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ffb6c1',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
