import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Image,TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginWalletScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [solBalance, setSolBalance] = useState(null);

  const handleLogin = async () => {
    let url_api = "http://192.161.176.103:3000/login";
    fetch(url_api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    })
    .then ((res)=>{
      return res.json();
    })
    .then(async(res_login)=>{
      if(res_login.message === "Đăng nhập thành công") {
        await AsyncStorage.setItem('loginInfo', JSON.stringify(res_login.user));
        navigation.navigate('TabNavigator'); // Chuyển hướng đến màn hình TabNavigator khi đăng nhập thành công
      } else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  };
  
  const handleSignUp = () => {
    console.log('Đăng ký');
    navigation.navigate('SignUp');
  };
 

  return (
    <View style={styles.container}>
      <Image
        style={styles.icon}
        source={require('./logo1.png')}
      />
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        placeholderTextColor="white" 
        tex
        onChangeText={(txt) => setUsername(txt)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="white" 
        onChangeText={(txt) => setPassword(txt)}
        value={password}
        secureTextEntry={true}
      />
   
      <Text style={styles.button} onPress={handleLogin} >Đăng Nhập</Text>
      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.signUp}>Bạn chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#663399',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    color: 'white',
    padding:10
  },
  button: {
    width: '50%',
    paddingVertical: 10,
    borderRadius: 8,
    color: 'red',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  signUp: {
    marginTop: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default LoginWalletScreen;
