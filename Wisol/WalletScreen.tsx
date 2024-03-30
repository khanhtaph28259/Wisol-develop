import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, View, TextInput, Text, StyleSheet, Image } from "react-native";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
import nacl from "tweetnacl";
import bs58 from "bs58";
import { decryptPayload } from "./utils/decryptPayload";
import { encryptPayload } from "./utils/encryptPayload";
import { buildUrl } from "./utils/buildUrl";
import ActionSheet from "react-native-actions-sheet";
import Button from "./Button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "./constants";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";
import { toastConfig } from "./ToastConfig";
import WifiListScreen from "./WifiListScreen";
const onConnectRedirectLink = Linking.createURL("onConnect");
const onDisconnectRedirectLink = Linking.createURL("onDisconnect");
const onSignAndSendTransactionRedirectLink = Linking.createURL(
  "onSignAndSendTransaction"
);
const connection = new Connection(clusterApiUrl("devnet"));


const WalletScreen = () => {
  const [accountInfo, setAccountInfo] = useState<any>(null); // State để lưu thông tin tài khoản
  const [deeplink, setDeepLink] = useState<string>("");

  const [dappKeyPair] = useState(nacl.box.keyPair());

  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();

  const [session, setSession] = useState<string>();

  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState<PublicKey | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionComplete = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment refreshKey when a transaction completes
  };


  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();
    const listener = Linking.addEventListener("url", handleDeepLink);
    return () => {
      listener.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: Linking.EventType) => setDeepLink(url);

  useEffect(() => {
    setSubmitting(false);
    if (!deeplink) return;

    const url = new URL(deeplink);
    const params = url.searchParams;

    if (params.get("errorCode")) {
      const error = Object.fromEntries([...params]);
      const message =
        error?.errorMessage ??
        JSON.stringify(Object.fromEntries([...params]), null, 2);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });
      console.log("error: ", message);
      return;
    }

    if (/onConnect/.test(url.pathname)) {
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get("phantom_encryption_public_key")!),
        dappKeyPair.secretKey
      );
      const connectData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecretDapp
      );
      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
      console.log(`connected to ${connectData.public_key.toString()}`);

      // Truy vấn thông tin tài khoản
      fetchAccountInfo(new PublicKey(connectData.public_key));
    }

    if (/onDisconnect/.test(url.pathname)) {
      setPhantomWalletPublicKey(null);
      console.log("disconnected");
    }
     // Handle a `signAndSendTransaction` response from Phantom
     if (/onSignAndSendTransaction/.test(url.pathname)) {
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );
      console.log("signAndSendTrasaction: ", signAndSendTransactionData);
      Toast.show({
        type: "success",
        text1: "WiSol",
        text2: signAndSendTransactionData.signature,
      });
    }
  }, [deeplink]);

  const fetchAccountInfo = async (publicKey: PublicKey) => {
    try {
      const info = await connection.getAccountInfo(publicKey);
      setAccountInfo(info);
    } catch (error) {
      console.error("Error fetching account info:", error);
    }
  };

  const connect = async () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "devnet",
      app_url: "http://localhost:3000/",
      redirect_link: onConnectRedirectLink,
    });
    const url = buildUrl("connect", params);
    Linking.openURL(url);
  };

  const disconnect = async () => {
    const payload = {
      session,
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });
    const url = buildUrl("disconnect", params);
    Linking.openURL(url);
  };
  const signAndSendTransaction = async (transaction: Transaction) => {
    if (!phantomWalletPublicKey) return;
    transaction.feePayer = phantomWalletPublicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });
    const url = buildUrl("signAndSendTransaction", params);
    Linking.openURL(url);
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>

          {phantomWalletPublicKey ? (
            <>
              <View style={[styles.row, styles.wallet]}>
                <View style={styles.greenDot} />
                <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
                  {`Wallet Address: ${phantomWalletPublicKey.toString()}`}
                </Text>
              </View>
              <Text style={styles.text}>{`Số Dư: ${accountInfo ? accountInfo.lamports / Math.pow(10, 9) : ''} SOL`}</Text>
              <Button title="Disconnect" onPress={disconnect} />
            </>
          ) : (
            <View style={{ marginTop: 15 }}>
              <Button title="Connect Phantom" onPress={connect} />
            </View>
          )}


        </View>

        <View >
          <WifiListScreen
            signAndSendTransaction={signAndSendTransaction}
            phantomWalletPublicKey={phantomWalletPublicKey}
            onTransactionComplete={handleTransactionComplete}
          />
        </View>

        <Toast config={toastConfig} />
        <StatusBar style="auto" />

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default WalletScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#292D2E'
  },
  greenDot: {
    height: 8,
    width: 8,
    borderRadius: 10,
    marginRight: 5,
    backgroundColor: COLORS.GREEN,
  },
  header: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 200

  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  text: {
    // color: COLORS.DARK_GREY,
    width: "100%",
    textAlign: "center",
    marginBottom: 10,
    color: '#F5FFEE', // Màu chữ tối hơn cho độ tương phản cao
    fontSize: 16,

  },
  wallet: {
    alignItems: "center",
    margin: 10,
    marginBottom: 15,
  },
  image: {
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});



