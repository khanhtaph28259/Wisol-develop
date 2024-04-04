import React, { useState, useEffect, useCallback } from 'react'; // ADD THIS
import { View, Text, StyleSheet, FlatList, Image, Button, TextInput, RefreshControl } from 'react-native';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddWifiScreen from './WifiScreen';
import "react-native-get-random-values";

const connection = new Connection("https://api.devnet.solana.com");

interface Wifi {
  _id: string;
  name: string;
  address: string;
  sol: number;
}
interface WifiListScreenProps {
  phantomWalletPublicKey: PublicKey | null;
  signAndSendTransaction: Function;
  onTransactionComplete: Function;
}
export default function WifiListScreen({
  signAndSendTransaction,
  phantomWalletPublicKey,
  onTransactionComplete,
}: WifiListScreenProps) {
  const [wifiList, setWifiList] = useState<Wifi[]>([]);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWifiList = useCallback( async () => {
    try {
      const response = await fetch('http://192.161.176.103:3000/wifis');
      const data = await response.json();
      setWifiList(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchWifiList();
  }, [fetchWifiList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWifiList().then(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    });
  }, [fetchWifiList]);
  

  const handleBuy = async (wifi: Wifi) => {
    try {
      if (!phantomWalletPublicKey) {
        console.error('Phantom wallet public key is not available');
        return;
      }
  
      const receiverPublicKey = new PublicKey('H1etyzEMg3N7TNUQNrnFyUoTdSF6TvSXStDRQgXehqAX'); // Replace with the recipient's public key
  
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: phantomWalletPublicKey,
          toPubkey: receiverPublicKey,
          lamports: wifi.sol * Math.pow(10, 9), // Amount of SOL to be sent
        })
      );
  
      // Get recent blockhash
      const blockhash = (await connection.getRecentBlockhash()).blockhash;
  
      // Assign recent blockhash to transaction
      transaction.recentBlockhash = blockhash;
  
      // Use the signAndSendTransaction function to sign and send the transaction
      const signature = await signAndSendTransaction(transaction);
  
      console.log('Transaction signature:', signature);

      // Get user info from AsyncStorage
      const userJson = await AsyncStorage.getItem('loginInfo');
      const userInfo = userJson ? JSON.parse(userJson) : null;


      // Send user info and wifi id to API
      fetch('http://192.161.176.103:3000/transactions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo._id,
          wifiId: wifi._id,
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.message === "Đã thêm giao dịch thành công") {
            alert(`Bạn đã mua Wifi: ${wifi.name}`);
            onTransactionComplete(); // Call the callback
          }
        })
        .catch(error => console.error('Error:', error));
    } catch (error) {
      console.error('Error buying wifi:', error);
    }
  };
  

  const handleSearch = (txt: string) => {
    setSearchAddress(txt);
    if (txt.length > 0) {
      setWifiList(wifiList.filter(wifi => wifi.address.toLowerCase().includes(txt.toLowerCase())));
    } else {
      fetchWifiList();
    }
  };
  

  return (
    <View style={styles.container}>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nhập địa chỉ để tìm kiếm"
        placeholderTextColor='#000'
        value={searchAddress}
        onChangeText={handleSearch} 
      />
    </View>
      <FlatList
        data={wifiList}
        keyExtractor={(item) => item._id}
        numColumns={2}
        refreshControl={ // ADD THIS
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // ADD THIS
        } // ADD THIS
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={require('./logo1.png')} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.listItemText}>Tên Wifi: {item.name}</Text>
              <Text style={styles.listItemText}>Địa chỉ: {item.address}</Text>
              <Text style={styles.listItemText}>Số SOL: {item.sol}</Text>
              <Button title="Mua" onPress={() => handleBuy(item)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color:'#F5FFEE'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    width: '45%',
    margin: '2.5%',
  },
  listItemText: {
    fontSize: 16,
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10, // Thêm padding để tạo không gian xung quanh các phần tử
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 10, // Thêm marginRight để tạo không gian giữa ô nhập và nút
  },
});

