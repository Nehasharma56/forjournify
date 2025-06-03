import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function LoginScreen({ navigation, onSetUserName }) {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim() !== '') {
      onSetUserName(name.trim());
      navigation.replace('Dashboard'); // Use replace to avoid going back to login
    } else {
      alert('Please enter your name!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome to Journify 💖</Text>
      <Text style={styles.subtitle}>Your personal mood and productivity companion!</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoFocus={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>✨ Let's Go!</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fffafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ff69b4', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 30, textAlign: 'center' },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: { backgroundColor: '#ffb6c1', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
