import React from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface OpenStreetMapAutocompleteProps {
  onSelect: (place: Place) => void;
  suggestions: Place[];
  onChangeText: (text: string) => void; // Add a prop to handle text change
}

const OpenStreetMapAutocomplete: React.FC<OpenStreetMapAutocompleteProps> = ({
  onSelect,
  suggestions,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for places..."
        onChangeText={onChangeText} // Update the input text
      />
      <FlatList
      style={styles.list}
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <Text style={styles.item}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    top: 110,
    alignSelf: 'center',
    zIndex: 1,
  },
  list: {
    backgroundColor : 'white'
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default OpenStreetMapAutocomplete;