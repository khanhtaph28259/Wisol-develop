import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const DangKi = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [address, setAddress] = useState('');
  const [walletId, setWalletId] = useState(''); // Thêm trường này
  const [avatar, setAvatar] = useState(''); // Thêm trường này

  const SaveUser = () => {
    if (username.length === 0) {
      alert("Chưa nhập tên đăng nhập");
      return;
    }
    if (password.length === 0) {
      alert("Chưa nhập mật khẩu");
      return;
    }

    let objUser  = { username: username, password: password, fullname: fullname, address: address, walletId: walletId, avatar: avatar }; // Thêm trường mới vào đây
    let url_api = "http://192.161.176.103:3000/register";

    fetch(url_api, {
        method:'POST',
        headers:{
            Accept: 'application/json',
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify(objUser),
    }).then((res)=>{
        if(res.status == 201) {
          alert("Đăng ký thành công");
          navigation.navigate('LoginWalletScreen', {username, password}); // Sửa props.navigation thành navigation
        }
    })
    .catch((e)=>{
        console.log(e);
    });
  }

  const handleLogin = () => {
    console.log('Đăng nhập');
    navigation.navigate('LoginWalletScreen'); // Sửa props.navigation thành navigation
  };

  return (
    <View style={styles.container} backgroundColor="#DF5A5A">
      <Text style={styles.texthello}>Chào mừng bạn đến với app Wisol</Text>
      <Text style={{ color: 'white', paddingBottom: 50, paddingTop: 30 ,fontSize:20}}>
        Đăng ký tài khoản của bạn
      </Text>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập tên đăng nhập"  value={username} onChangeText={(txt)=>setUsername(txt)} />
      </View>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập mật khẩu" onChangeText={(txt)=>setPassword(txt)} />
      </View>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập họ tên" onChangeText={(txt)=>setFullname(txt)} />
      </View>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập địa chỉ" onChangeText={(txt)=>setAddress(txt)} />
      </View>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập ID Wallet" onChangeText={(txt)=>setWalletId(txt)} />
      </View>
      <View style={styles.inputcontainer}>
        <TextInput style={styles.textInput} placeholder="Nhập Avatar" onChangeText={(txt)=>setAvatar(txt)} />
      </View>
      <TouchableOpacity
      onPress={handleLogin}
        style={{
          
          width: '80%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 50,
          marginVertical: 10,
          
        }}
      >
        <Text style={styles.button} onPress={SaveUser}>Đăng ký</Text>
      </TouchableOpacity>
      <TouchableOpacity  onPress={handleLogin}>
        <Text style={styles.signIn} >Bạn đã có tài khoản?Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
  },
  texthello: {
    paddingTop: 100,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 20,
  },
  inputcontainer: {
    color: 'white',
    position: 'relative',
    marginHorizontal: 30,
    width: '85%',
    padding: 10,
  },
  textInput: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 8,
    color:'black',
    borderColor: 'white',
  },
  bottominput: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
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
  buttonText: {
    color: '#DF5A5A',
    textAlign: 'center',
  },
  signUp: {
    marginTop: 16,
    color: 'white',
    textAlign: 'center',
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
});

export default DangKi;
