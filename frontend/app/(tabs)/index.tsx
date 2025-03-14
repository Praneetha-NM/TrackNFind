import React, { useEffect, useState,useRef} from "react";
import { View, Text, StyleSheet, TextInput, Button ,TouchableOpacity,Modal,PermissionsAndroid, Platform,Alert,FlatList,ImageBackground} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE ,MapMarker, Region} from "react-native-maps";
import axios from "axios";
import Register from "../../components/Register";
import Login from "../../components/Login";
import OpenStreetMapAutocomplete from "../../components/OpenStreetMapAutocomplete";
import "./app.css";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';



interface Pin {
  _id: string;
  username: string;
  item: string;
  category: string;
  desc: string;
  imgurl:String;
  contactno: String;
  lat: number;
  lng: number;
}
interface Found {
  _id: string;
  username: string;
  contactno: string;
  imgurl: string;
  item: string;
  category: string;
  desc: string;
  lat: number;
  lng: number;
  lostBy: string;
}
interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}
interface User {
  username: string;
  lat: number;
  lng: number;
}

// Define a Coordinates type
interface Coordinates {
  latitude: number;
  longitude: number;
}

const Index: React.FC = () => {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [newPlace, setNewPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [item, setItem] = useState("");
  const [category,setCategory] =useState("");
  const [desc, setDesc] = useState("");
  const [imgurl,setImgurl]=useState("");
  const [contactno,setContactno]=useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin|null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<{ lat: string; lon: string } | null>(null); // New state for selected place
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state
  const backgroundImage = require('@/components/TrackNFind.png');
  const [foundItems, setFoundItems] = useState<Found[]>([]);
  const [showFoundBoard, setShowFoundBoard] = useState(false);
  const [foundPhoneNumber, setFoundPhoneNumber] = useState("");
  const [foundName, setFoundName] = useState("");
  const [foundImage, setFoundImage] = useState("");
  const [showFoundModal, setShowFoundModal] = useState(false);
  
  const [movedAway, setMovedAway] = useState(false);
  const [region, setRegion] = useState({
    latitude: 11.032852,
    longitude: 77.008879,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    requestNotificationPermissions();
    getUserLocation();
  }, []);
  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert("Permission not granted", "Please enable notifications in settings.");
      }
    }
  };

  // Get user location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
  };

  
  // Call this function to fetch the location
  useEffect(() => {
    const interval = setInterval(() => {
      getUserLocation();
    }, 5000); // Update every 5 seconds
  
    return () => clearInterval(interval);
  }, []);
  const updateUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
  };

  const searchPlaces = async (text: string) => {
    setQuery(text);
  
    if (text.length > 2) {
      console.log("Searching for:", text);
  
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`,
          {
            headers: {
              "User-Agent": navigator.userAgent || "TrackNFind/1.0",
              "Accept": "application/json",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("API Response:", data);
  
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn(`No results found for the query: "${text}". Please try a different search.`);
          setSuggestions([]); // Clear suggestions if no results found
          return; // Early exit
        }
  
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching places:", error);
        Alert.alert("Error", "Unable to fetch places. Please try again.");
      }
    } else {
      // Clear suggestions if input is less than or equal to 2 characters
      setSuggestions([]);
    }
  };
  
  // Debounce effect to prevent excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        searchPlaces(query);
      }
    }, 300); // 300ms debounce
  
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Allow location access for better experience.");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };

    getLocation();
  }, []);

  const handleRegionChange = (newRegion: Region) => {
    if (location) {
      const distanceMoved = Math.sqrt(
        Math.pow(newRegion.latitude - location.coords.latitude, 2) +
        Math.pow(newRegion.longitude - location.coords.longitude, 2)
      );

      setMovedAway(distanceMoved > 0.001); // Adjust threshold for movement
    }
  };

  const returnToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000); // Duration in milliseconds
      setMovedAway(false);
    }
  };
  const handleSelectPlace = (place: Place) => {
    console.log("Selected Place:", place);
    setSelectedPlace({ lat: place.lat, lon: place.lon }); // Set the selected place
    const latitude = parseFloat(place.lat);
    const longitude = parseFloat(place.lon);
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSuggestions([]);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          setCurrentUsername(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      }
    };
    getUser();
  }, []);
  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://192.168.8.76:8800/api/pins");
        setPins(res.data);
        pins.forEach(pin => {
          notifyNearbyUsers(pin.lat, pin.lng);
        });
      } catch (err) {
        console.error(err);
      }
    };
    getPins();
  }, [userLocation]);

  const handleMapPress = (event: any) => {
    
    console.log("Map Pressed!", event.nativeEvent.coordinate);
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewPlace({ lat: latitude, lng: longitude });
    setItem("");
    setCategory("");
    setDesc("");
    setImgurl("");
    setContactno("");
  };

  const handleSubmit = async () => {
    if (!newPlace) return;

    const newPin = {
      username: currentUsername,
      item,
      category,
      desc,
      contactno,
      imgurl,
      lat: newPlace.lat,
      lng: newPlace.lng,
    };

    try {
      const res = await axios.post("http://192.168.8.76:8800/api/pins", newPin);
      setPins([...pins, res.data]);
      notifyNearbyUsers(newPlace.lat,newPlace.lng)
      setNewPlace(null);
    } catch (err: any) {
      console.error("Error saving pin:", err.response?.data || err.message);
    }
  };
  const notifyNearbyUsers = (lat: number, lng: number) => {
    if (!userLocation) return; // Ensure userLocation is available
  
    const distance = haversineDistance(
      { latitude: lat, longitude: lng },
      { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude }
    );
  
    // Check if the user is within 500 meters
    if (currentUsername){
      if (distance <= 500) {
      scheduleNotification(currentUsername);
    }}
  };
  
  const haversineDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c * 1000; // Convert to meters
  };
  
  const scheduleNotification = async (username: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Hey ${username}!`,
        body: 'An item has been marked lost nearby. Please look around!',
      },
      trigger: null, // Immediate notification
    });
  };
  const markAsFound = async (pin: Pin) => {
    try {
      setSelectedPin(pin); // Set the selected pin to show in the modal
      setShowFoundModal(true); // Open the modal for user input
    } catch (err) {
      console.error("Error marking item as found:", err);
      Alert.alert("Error", "Could not mark item as found. Please try again.");
    }
  };
  const handleFoundSubmit = async (selectedPin:Pin) => {
    const foundData = {
      username: foundName,
      contactno: foundPhoneNumber,
      imgurl: foundImage,
      item: selectedPin.item,
      category: selectedPin.category,
      desc: selectedPin.desc,
      lat: selectedPin.lat,
      lng: selectedPin.lng,
      lostBy: selectedPin.username, // Store who lost the item
    };
  
    try {
      const res = await axios.post("http://192.168.8.76:8800/api/found", foundData);
      setFoundItems(prevFoundItems => [...prevFoundItems, res.data]); // Update state correctly
      setShowFoundModal(false); // Close the modal
      setSelectedPin(null); // Clear selected pin
      // Reset input fields
      setFoundPhoneNumber("");
      setFoundName("");
      setFoundImage("");
    } catch (err) {
      console.error("Error marking item as found:", err);
      Alert.alert("Error", "Could not mark item as found. Please try again.");
    }
  };
  
  const getFoundItems = async () => {
    try {
      const res = await axios.get("http://192.168.8.76:8800/api/found");
      const filteredItems = res.data.filter((item: { lostBy: string | null; }) => item.lostBy === currentUsername);
      setFoundItems(filteredItems);
    } catch (err) {
      console.error("Error fetching found items:", err);
      Alert.alert("Error", "Unable to fetch found items. Please try again.");
    }
  };
  useEffect(() => {
    if (showFoundBoard) {
      getFoundItems();
    }
  }, [showFoundBoard]);
  
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://192.168.8.76:8800/api/pins/${id}`);
      setPins((prevPins) => prevPins.filter((pin) => pin._id !== id));
      Alert.alert("Success", "Pin deleted successfully.");
    } catch (error) {
      console.error("Error deleting pin:", error);
      Alert.alert("Error", "Failed to delete pin. Please try again.");
    }
  };
  
  return (
    
    <View style={styles.container}>
      {isAuthenticated ? (
        <>
        
        <View style={{ position: "absolute", top: 30, left: 200, zIndex: 10 }}>
          <Button title="Show Found Board" onPress={() => setShowFoundBoard(true)} />
          <Text style={{height:6}}></Text>
          <Button color="tomato" title="Log out"onPress={async () => { setCurrentUsername(null);setIsAuthenticated(false); await AsyncStorage.removeItem("user");}} />
        </View>
        {showFoundBoard && (
          <Modal transparent={true} animationType="slide" visible={showFoundBoard}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Found Items</Text>
                <FlatList
                  data={foundItems}
                  renderItem={({ item }) => (
                    <View>
                      <Text>{item.item} - {item.category}</Text>
                      <Text>Found By : {item.username}</Text>
                      <Text>Contact Info : {item.contactno}</Text>
                      <Text>Check The Image to Confirm : {item.imgurl}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item._id}
                />
                <Button title="Close" onPress={() => setShowFoundBoard(false)} />
              </View>
            </View>
          </Modal>
        )}

      
      <OpenStreetMapAutocomplete
        suggestions={suggestions}
        onSelect={handleSelectPlace}
        onChangeText={searchPlaces} // Pass search function to text input
      />
      <MapView
        ref ={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onRegionChangeComplete={handleRegionChange}
        onPress={(event) => 
          {handleMapPress(event) , setSelectedPin(null)}}
      >
        {pins.map((p) => (
          <Marker key={p._id} coordinate={{ latitude: p.lat, longitude: p.lng }} onPress={() => setSelectedPin(p)}>
            <Callout>
              <View>
                <Text style={styles.title}>{p.item}</Text>
                <Text>{p.category}</Text>
                <Text>{p.desc}</Text>
                <Text>{p.imgurl}</Text>
                <Text>By {p.username}</Text>
                <Text>Contact No: {p.contactno}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        
        {selectedPlace && (
          <Marker
            coordinate={{ latitude: parseFloat(selectedPlace.lat), longitude: parseFloat(selectedPlace.lon) }}
            pinColor="red" // Set the marker color to red
          />
        )}
        
    
      </MapView>
      {selectedPin && (
          <View style={styles.bottomBox}>
          <Text style={styles.title}>{selectedPin.item}</Text>
          <Text>{selectedPin.category}</Text>
          <Text>{selectedPin.desc}</Text>
          <Text>{selectedPin.imgurl}</Text>
          <Text>By {selectedPin.username}</Text>
          <Text>Contact No : {selectedPin.contactno}</Text>
          <Text></Text>
          <Button title="Mark as Found" onPress={() => markAsFound(selectedPin)} />
          <TouchableOpacity onPress={() => setSelectedPin(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          {selectedPin.username === currentUsername && (
            <TouchableOpacity onPress={() => handleDelete(selectedPin._id)}>
            <Text style={styles.closeText}>Delete</Text>
          </TouchableOpacity>
          )}
        </View>
    )}
    {selectedPin && (
  <Modal transparent={true} animationType="slide" visible={showFoundModal}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Mark as Found</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={foundName}
          onChangeText={setFoundName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Phone Number"
          value={foundPhoneNumber}
          onChangeText={setFoundPhoneNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={foundImage}
          onChangeText={setFoundImage}
        />
        <View style={styles.buttonContainer}>
          <Button title="Cancel" color="red" onPress={() => setShowFoundModal(false)} />
          <Button title="Submit" onPress={() => handleFoundSubmit(selectedPin)} />
        </View>
      </View>
    </View>
  </Modal>
)}
      {newPlace && (
      <Modal transparent={true} animationType="slide" visible={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Lost Item Information</Text>
            
            <TextInput style={styles.input} placeholder="Item Name" value={item} onChangeText={setItem} />
            <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={styles.input} >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Electronics" value="Electronics" />
              <Picker.Item label="Wallets" value="Wallets" />
              <Picker.Item label="Jewelry" value="Jewelry" />
              <Picker.Item label="Keys" value="Keys" />
              <Picker.Item label="Documents" value="Documents" />
              <Picker.Item label="Others" value="Others" />
            </Picker>
            <TextInput style={styles.input} placeholder="Description" value={desc} onChangeText={setDesc} />
            <TextInput style={styles.input} placeholder="Image URL" value={imgurl} onChangeText={setImgurl} />
            <TextInput style={styles.input} placeholder="Contact No" value={contactno} onChangeText={setContactno}/>
            <View style={styles.buttonContainer}>
              <Button title="Cancel" color="red" onPress={() => setNewPlace(null)} />
              <Button title="Add Pin" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </Modal>
    )}
    

    {movedAway && (
            <TouchableOpacity
              onPress={returnToCurrentLocation}
              style={{
                position: 'absolute',
                bottom: 60,
                right: 20,
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 50,
                elevation: 5,
              }}
            >
              <Ionicons name="locate" size={24} color="black" />
            </TouchableOpacity>
          )}
       
      
   
   </>
   ) : (
    <>
    <ImageBackground source={backgroundImage} style={styles.background}>
   <View style={{ position: "absolute", top: 80, left: 265, zIndex: 10 }}>
      <Button color="teal" title="Log in" onPress={() => { setShowLogin(true); setShowRegister(false); }} />
      <Text style={{height:6}}></Text>
      <Button color="slateblue" title="Register" onPress={() => { setShowRegister(true); setShowLogin(false); }} />
    </View>
    {showRegister && <Register setShowRegister={setShowRegister} />}
      {showLogin && <Login setShowLogin={setShowLogin} setCurrentUsername={setCurrentUsername} setIsAuthenticated={setIsAuthenticated}  />}
    </ImageBackground>
    </>
    )}
    </View>
   
  );
};
const styles = StyleSheet.create({
  container: { flex: 1,zIndex:2 },
  map: { width: "100%", height: "100%",zIndex:0,...StyleSheet.absoluteFillObject  },
  title: { fontWeight: "bold", fontSize: 16 },
  background: {
    flex: 1,
    resizeMode: "stretch", // or 'stretch'
    justifyContent: "center",
  },
  calloutContainer: {
    width: 250,
    height: 220,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5, // Adds shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex:100,
    position: "absolute", // Ensure proper layering
  },
  
  customCallout: {
    width: 250,
    height: 200,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5, // Shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex:100,
  },
  searchBar: {
    top:50,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    top: 20,
    alignSelf: "center",
    zIndex: 1,
  },  
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    marginBottom: 10,
    zIndex:200,
  },
  bottomBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  closeText: { color: "red", marginTop: 10, textAlign: "center" },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 5,
  },
  filledStar: {
    color: "#FFD700",
  },
  emptyStar: {
    color: "#ccc",
  },
  label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#333",
      alignSelf: "flex-start",
 },
});

export default Index;
