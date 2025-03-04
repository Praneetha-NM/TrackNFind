import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

const OpenStreetMapAutocomplete = ({ onSelect }: { onSelect: (place: Place) => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);

  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${text}`
        );
        const data: Place[] = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for a place..."
        value={query}
        onChangeText={searchPlaces}
        style={styles.searchBar}
      />
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                onSelect(item); // Pass selected place
                setQuery(item.display_name); // Update search bar
                setResults([]); // Hide suggestions
              }}
            >
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  searchBar: {
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
});

export default OpenStreetMapAutocomplete;
