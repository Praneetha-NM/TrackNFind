import React, { useEffect, useState,useRef} from "react";
import { View, Text, StyleSheet, TextInput, Button ,TouchableOpacity,Modal,PermissionsAndroid, Platform,Alert,FlatList} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE ,MapMarker, Region} from "react-native-maps";
import axios from "axios";
import Register from "../../components/Register";
import Login from "../../components/Login";
import OpenStreetMapAutocomplete from "@/components/SearchBar";
import "./app.css";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons';
import { GooglePlaceDetail,GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';



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
interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
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

  
  const [movedAway, setMovedAway] = useState(false);
  const [region, setRegion] = useState({
    latitude: 11.032852,
    longitude: 77.008879,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);

  const searchPlaces = async (text: string) => {
    setQuery(text);
  
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`,
          {
            headers: {
              "User-Agent": navigator.userAgent || "TrackNFind/1.0 (contact: praneetha7597@gmail.com)",
              "Accept": "application/json"
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Read response as text first
        const textResponse = await response.text();
        
        // Check if the response is HTML (error page)
        if (textResponse.startsWith("<")) {
          throw new Error("Received an HTML response instead of JSON. API might be blocked.");
        }
  
        const data = JSON.parse(textResponse);
  
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Invalid or empty response");
        }
  
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
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
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          setCurrentUsername(user);
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
        const res = await axios.get("http://10.52.16.76:8800/api/pins");
        setPins(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getPins();
  }, []);

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
      const res = await axios.post("http://10.52.16.76:8800/api/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err: any) {
      console.error("Error saving pin:", err.response?.data || err.message);
    }
  };
  return (
    <View style={styles.container}>
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
        {newPlace && (
          <>
            <Marker coordinate={{ latitude: newPlace.lat, longitude: newPlace.lng }} />
          </>
        )}
      </MapView>
      <OpenStreetMapAutocomplete onSelect={handleSelectPlace} />
        {selectedPin && (
          <View style={styles.bottomBox}>
          <Text style={styles.title}>{selectedPin.item}</Text>
          <Text>{selectedPin.category}</Text>
          <Text>{selectedPin.desc}</Text>
          <Text>{selectedPin.imgurl}</Text>
          <Text>By {selectedPin.username}</Text>
          <Text>Contact No : {selectedPin.contactno}</Text>
          <TouchableOpacity onPress={() => setSelectedPin(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
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
                bottom: 20,
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
       
      {currentUsername ? (
        <View style={{ position: "absolute", top: 50, left: 400, zIndex: 1 }}>
          <Button color="tomato" title="Log out"onPress={async () => { setCurrentUsername(null); await AsyncStorage.removeItem("user");}} />
        </View>
      ) : (
        <View style={{ position: "absolute", top: 50, left: 400, zIndex: 1 }}>
          <Button color="teal" title="Log in" onPress={() => { setShowLogin(true); setShowRegister(false); }} />
          <Button color="slateblue" title="Register" onPress={() => { setShowRegister(true); setShowLogin(false); }} />
        </View>
      )}

      {showRegister && <Register setShowRegister={setShowRegister}  />}
      {showLogin && <Login setShowLogin={setShowLogin} setCurrentUsername={setCurrentUsername}  />}
   </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%",zIndex:0,...StyleSheet.absoluteFillObject  },
  title: { fontWeight: "bold", fontSize: 16 },
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
