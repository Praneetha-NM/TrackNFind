import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { MaterialIcons } from '@expo/vector-icons';// For Expo, you could use: import { MaterialIcons } from '@expo/vector-icons';

interface RegisterProps {
  setShowRegister: (show: boolean) => void;
}

export default function Register({ setShowRegister }: RegisterProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const newUser = { username, email, password };
    console.log("New user data:", newUser);
    try {
      await axios.post("http://192.168.8.76:8800/api/users/register", newUser);
      
      setError(false);
      setSuccess(true);
    } catch (err) {
      console.log("Registration Error: ", err);
      setError(true);
    }
  };

  return (
    <View style={styles.registerContainer}>
      <View style={styles.logo}>
        <MaterialIcons name="room" size={24} color="teal" style={styles.logoIcon} />
        <Text style={styles.logoText}>Register</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          autoFocus
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.registerBtn}>
          <Text style={styles.registerBtnText}>Register</Text>
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
      <TouchableOpacity style={styles.registerCancel} onPress={() => setShowRegister(false)}>
        <MaterialIcons name="cancel" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  registerContainer: {
    width: 300,
    height:250,
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
  logo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    marginRight: 5,
  },
  logoText: {
    color: "teal",
    fontWeight: "700",
    fontSize: 18,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  registerBtn: {
    padding: 5,
    backgroundColor: "teal",
    borderRadius: 5,
    alignItems: "center",
  },
  registerBtnText: {
    color: "white",
  },
  success: {
    fontSize: 12,
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
  failure: {
    fontSize: 12,
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  registerCancel: {
    position: "absolute",
    top: 3,
    right: 3,
  },
});
