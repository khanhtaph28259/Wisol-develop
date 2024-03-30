import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WifiScreen from './WifiScreen';
import WifiListScreen from './WifiListScreen';
import LoginWalletScreen from './LoginWalletScreen';
import DangKi from './dangKi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletScreen from './WalletScreen';
import { Image } from 'react-native'; // Add this line
import TransactionScreen from './TransactionScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator initialRouteName="WalletScreen" screenOptions={{ headerShown: false }}>
      <Tab.Screen name="WalletScreen" component={WalletScreen}
        options={{
          tabBarIcon: () => (
            <Image
              style={{ width: 35, height: 35 }}
              source={require('./image/Solana.png')}
              resizeMode="stretch"
            />
          ),
        }}
      />

      <Tab.Screen name="Share Wifi" component={WifiScreen}
        options={{
          tabBarIcon: () => (
            <Image
              style={{ width: 30, height: 30 }}
              source={require('./image/wifi-share.png')}
              resizeMode="stretch"
            />
          ),
        }}
      />
      <Tab.Screen name="Menu" component={TransactionScreen}
        options={{
          tabBarIcon: () => (
            <Image
              style={{ width: 30, height: 30 }}
              source={require('./image/wifi-share.png')}
              resizeMode="stretch"
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginInfo = await AsyncStorage.getItem('loginInfo');
      if (loginInfo) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "TabNavigator" : "LoginWalletScreen"}>
        <Stack.Screen name="LoginWalletScreen" component={LoginWalletScreen} />
        <Stack.Screen name="SignUp" component={DangKi} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
