import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function FlightSearchHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flights</Text>
      <View style={styles.searchBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Round trip</Text>
          <Text style={styles.label}>1</Text>
          <Text style={styles.label}>Economy</Text>
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Lahore" />
          <TextInput style={styles.input} placeholder="Where to?" />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Departure" />
          <TextInput style={styles.input} placeholder="Return" />
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Explore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    paddingTop: 40,
  },
  title: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  searchBox: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#bbb',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    flex: 1,
  },
  button: {
    backgroundColor: '#6ea8fe',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
