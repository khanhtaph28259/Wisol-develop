import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const doLogin = async () => {
    if (username.length === 0) {
      alert("Chưa nhập tên đăng nhập");
      return;
    }
    if (password.length === 0) {
      alert("Chưa nhập mật khẩu");
      return;
    }
    let url_api = "http://10.24.21.143:3000/login";
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
        props.navigation.navigate('Wallet');
        alert("Đăng nhập thành công");
      } else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  }

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setUsername("");
      setPassword("");
    });

    return unsubscribe;
  }, [props.navigation]);

  const handleSignUp = () => {
    console.log('Đăng ký');
    props.navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Chào mừng bạn tới app Flash shop</Text>
      <Text style={styles.tx1}>Đăng nhập tài khoản của bạn</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên đăng nhập"
        onChangeText={(txt) => setUsername(txt)}
        value={username}
      />
      <TextInput
        secureTextEntry={true}
        style={styles.input}
        placeholder="Nhập mật khẩu"
        onChangeText={(txt) => setPassword(txt)}
        value={password}
      />

      <View style={{ paddingTop: 80 }}>
        <TouchableOpacity style={styles.button} onPress={doLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.signUp}>Bạn chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#DF5A5A',
  },
  welcome: {
    paddingTop: 100,
    textAlign:'center',
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },
  tx1: {
    marginTop: 50,
    marginBottom: 50,
    fontSize:20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 8,
    marginTop:30,
   color:'black',
    borderColor: 'white',
  },
  button: {
    width: 200,
    paddingVertical: 10,
    borderRadius: 8,
    color: 'red',
    left:120,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  buttonText: {
    color: '#DF5A5A',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 12,
    color: 'white',
    marginTop:20,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
  signUp: {
    marginTop: 70,
    color: 'white',
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize:20
  },
});

export default LoginScreen;
