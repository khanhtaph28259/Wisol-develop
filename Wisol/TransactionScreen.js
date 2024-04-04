import React, { useState, useEffect, useCallback } from 'react'; // ADD THIS
import { View, Text, StyleSheet, FlatList, Image, Alert} from 'react-native';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 
import { RefreshControl } from 'react-native';

const TransactionScreen = ({ onTransactionComplete }) => {
  const [transactions, setTransactions] = useState([]);
  const [wifiDetails, setWifiDetails] = useState({});
  const [user, setUser] = useState(null); // Thêm trạng thái này
  const [totalSol, setTotalSol] = useState(0); // Thêm trạng thái này
  const [refreshKey, setRefreshKey] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const navigation = useNavigation();

  const fetchTransactions = async () => {
    const userInfo = JSON.parse(await AsyncStorage.getItem('loginInfo'));
    setUser(userInfo);
    fetch(`http://192.161.176.103:3000/transactions/${userInfo._id}`)
      .then(response => response.json())
      .then(data => {
        setTransactions(data);
        data.forEach(transaction => {
          fetch(`http://192.161.176.103:3000/wifis/${transaction.wifiId}`)
            .then(response => response.json())
            .then(wifi => {
              setWifiDetails(prevState => ({ ...prevState, [transaction.wifiId]: wifi }));
            })
            .catch(error => console.error('Error:', error));
        });
      })
      .catch(error => console.error('Error:', error));

    // Fetch total SOL
    fetch(`http://192.161.176.103:3000/users/${userInfo._id}/total-sol`)
      .then(response => response.json())
      .then(data => {
        setTotalSol(data.totalSol);
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    // Lấy avatar từ AsyncStorage khi component được gắn kết
    AsyncStorage.getItem('loginInfo')
      .then(loginInfo => {
        const { avatar } = JSON.parse(loginInfo);
        setAvatar(avatar || 'https://cdn.discordapp.com/attachments/1093418895412576326/1213464645441032192/logo1.png?ex=66114184&is=65fecc84&hm=faeba6457a2964a72e36477e44b9517f09e8cdbaca5baabe3ea2d42e6df0701b&'); // Sử dụng URL hình ảnh mặc định nếu avatar không tồn tại
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  useEffect(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, [onTransactionComplete]);

  const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchTransactions().then(() => {
    setRefreshing(false);
  });
}, []);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất", // Tiêu đề
      "Bạn có muốn đăng xuất không?", // Nội dung
      [
        {
          text: "Không",
          style: "cancel"
        },
        { text: "Có", onPress: () => {
          // Xử lý đăng xuất ở đây, ví dụ:
          AsyncStorage.removeItem('loginInfo'); // Xóa thông tin đăng nhập từ AsyncStorage
          navigation.navigate('LoginWalletScreen'); // Điều hướng về màn hình đăng nhập
        }}
      ]
    );
  };
  
  const handleWithdrawSol = () => {
    // Xử lý rút Sol ở đây
  };

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.userInfo}>
          <Image source={{ uri: user.avatar || 'https://cdn.discordapp.com/attachments/1093418895412576326/1213464645441032192/logo1.png?ex=66114184&is=65fecc84&hm=faeba6457a2964a72e36477e44b9517f09e8cdbaca5baabe3ea2d42e6df0701b&' }} style={styles.avatar} />
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.sol}>Số SOL kiếm được: {totalSol}</Text>
          <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleWithdrawSol}>
        <Text style={styles.buttonText}>Rút Sol về ví</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
        </View>
      )}
      <Text style={styles.heading}>Lịch sử giao dịch</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Tên Wifi: {wifiDetails[item.wifiId]?.name}</Text>
            <Text style={styles.listItemText}>Địa chỉ: {wifiDetails[item.wifiId]?.address}</Text>
            <Text style={styles.listItemText}>Mật Khẩu: {wifiDetails[item.wifiId]?.password}</Text>
            <Text style={styles.listItemText}>Thời gian: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#DF5A5A',
    padding: 10,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    marginHorizontal: 10, 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sol: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  listItemText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default TransactionScreen;