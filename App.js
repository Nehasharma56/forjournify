import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import JournalScreen from './screens/JournalScreen';
import MoodTracker from './screens/MoodTracker';
import ProductivityScreen from './screens/ProductivityScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userName, setUserName] = useState('');

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onSetUserName={setUserName} />}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {(props) => <Dashboard {...props} userName={userName} />}
        </Stack.Screen>
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="MoodTracker" component={MoodTracker} />
        <Stack.Screen name="Productivity" component={ProductivityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}