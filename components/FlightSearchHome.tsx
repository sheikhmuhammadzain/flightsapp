
import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const RAPIDAPI_KEY = process.env['X-RapidAPI_Key'] || '';

export default function FlightSearchHome() {
  const [origin, setOrigin] = useState('LAXA');
  const [destination, setDestination] = useState('LOND');
  const [date, setDate] = useState('2024-04-11');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const fetchFlights = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/getFlightDetails?legs=%5B%7B%22destination%22%3A%22${destination}%22%2C%22origin%22%3A%22${origin}%22%2C%22date%22%3A%22${date}%22%7D%5D&adults=1&currency=USD&locale=en-US&market=en-US&cabinClass=economy&countryCode=US`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch flights.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Flight Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Origin (e.g. LAXA)"
        value={origin}
        onChangeText={setOrigin}
      />
      <TextInput
        style={styles.input}
        placeholder="Destination (e.g. LOND)"
        value={destination}
        onChangeText={setDestination}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <Button title="Search Flights" onPress={fetchFlights} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error ? <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text> : null}
      {results && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Results:</Text>
          <Text selectable style={{ fontSize: 12 }}>{JSON.stringify(results, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
});
