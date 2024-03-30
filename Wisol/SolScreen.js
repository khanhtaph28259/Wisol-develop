import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SolScreen = ({ route }) => {
  // Lấy số dư SOL từ đối tượng route
  const { solBalance } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>Số dư SOL: {solBalance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balance: {
    fontSize: 24,
  },
});

export default SolScreen;
