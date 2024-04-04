import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage

const AddWifiScreen = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [sol, setSol] = useState('');
  const [userId, setUserId] = useState(''); // Thêm trạng thái này

  useEffect(() => {
    // Lấy userId từ AsyncStorage khi component được gắn kết
    AsyncStorage.getItem('loginInfo')
      .then(loginInfo => {
        const { _id } = JSON.parse(loginInfo);
        setUserId(_id);
      })
      .catch(error => console.error(error));
  }, []);

  const handleSaveWifi = () => {
    let wifiData = { name: name, address: address, password: password, sol: sol, userId: userId }; // Thêm userId vào dữ liệu wifi
    let url_api_wifi = 'http://192.161.176.103:3000/api/wifi';
  
    fetch(url_api_wifi, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wifiData)
    }).then((res) => {
        if (res.status == 201)
            alert("Bạn đã thêm thông tin Wifi thành công")
            console.log("thanh cong")
            props.onAddWifiSuccess();
            setName('');
            setAddress('');
            setPassword('');
            setSol('');
    })
        .catch((e) => {
            console.log(e);
        })
    alert('Thông tin Wifi đã được lưu thành công');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Thêm thông tin Wifi</Text>
      <Text style={styles.label}>Tên Wifi:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên Wifi"
          value={name}
          onChangeText={(txt)=>setName(txt)}
        />
      </View>

      <Text style={styles.label}>Địa chỉ:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          value={address}
          onChangeText={(txt)=>setAddress(txt)}
        />
      </View>

      <Text style={styles.label}>Mật khẩu:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={(txt)=>setPassword(txt)}
          secureTextEntry={true}
        />
      </View>

      <Text style={styles.label}>Số SOL:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Số SOL"
          value={sol}
          onChangeText={(txt)=>setSol(txt)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveWifi}>
        <Text style={styles.buttonText}>Hoàn thành</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nameText: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    flex: 1,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },

  button: {
    backgroundColor: '#DF5A5A',
    padding: 10,
    borderRadius: 20,
    marginTop: 70,
    marginBottom:50
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AddWifiScreen;
