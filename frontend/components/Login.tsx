import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";



type LoginProps = {
  setShowLogin: (show: boolean) => void;
  setCurrentUsername: (username: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;// consider using AsyncStorage in RN
};

export default function Login({ setShowLogin, setCurrentUsername,setIsAuthenticated}: LoginProps) {
  const [error, setError] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const user = {
      username,
      password,
    };
  
    try {
      const res = await axios.post("http://192.168.8.76:8800/api/users/login", user);
      console.log("Login successful:", res.data);  // Log successful response
      setCurrentUsername(res.data.username);
      setIsAuthenticated(true);
      await AsyncStorage.setItem("user", res.data.username);
      setSuccess(true);
      setShowLogin(false);
      
    } catch (err) {
      console.log("Login error:", err); // Log error response
      setError(true);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.logo}>
        <MaterialIcons name="room" size={24} color="teal" style={{ marginRight: 5 }} />
        <Text style={styles.logoText}>Login</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          placeholder="Username"
          autoFocus
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        {success && (
          <Text style={styles.success}>
            Successful. You can login now!
          </Text>
        )}
        {error && (
          <Text style={styles.failure}>
            Something went wrong!
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.cancel} onPress={() => setShowLogin(false)}>
        <MaterialIcons name="cancel" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    width: 300,
    height: 200,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    position: "absolute",
    top: 255,
    bottom: 0,
    left: 35,
    right: 0,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  success: {
    fontSize: 12,
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "teal",
    fontWeight: "700",
  },
  form: {
    // additional styling for the form container if needed
  },
  input: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginBtn: {
    padding: 5,
    backgroundColor: "teal",
    borderRadius: 5,
    alignItems: "center",
  },
  loginBtnText: {
    color: "white",
  },
  failure: {
    fontSize: 12,
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  cancel: {
    position: "absolute",
    top: 3,
    right: 3,
  },
});
