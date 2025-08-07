
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// ...existing code...
const RAPIDAPI_KEY = Constants.expoConfig?.extra?.RAPIDAPI_KEY || '';


export default function FlightSearchHome() {
  const [airportQuery, setAirportQuery] = useState('');
  const [airportResults, setAirportResults] = useState<Array<{ name: string; city: string; skyId: string; entityId: string }>>([]);
  const [airportLoading, setAirportLoading] = useState(false);

  // Test API key function
  const testAPIKey = async () => {
    try {
      const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=london&locale=en-US`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
      });
      const data = await response.json();
      console.log('API Key Test:', data.status !== false ? 'WORKING' : 'ISSUE');
      return data.status !== false;
    } catch (error) {
      console.log('API Key Test Failed:', error);
      return false;
    }
  };

  const searchAirport = async () => {
    setAirportLoading(true);
    setAirportResults([]);
    try {
      const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(airportQuery)}&locale=en-US`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
      });
      const data = await response.json();
      setAirportResults(data.data || []);
    } catch (err) {
      setAirportResults([]);
    }
    setAirportLoading(false);
  };
  // Example values - using proper SkyIds and EntityIds from RapidAPI examples
  const [originSkyId, setOriginSkyId] = useState('LAXA');
  const [destinationSkyId, setDestinationSkyId] = useState('LOND');
  const [originEntityId, setOriginEntityId] = useState('27536542');
  const [destinationEntityId, setDestinationEntityId] = useState('27544008');
  const [date, setDate] = useState('2025-08-15');
  const [returnDate, setReturnDate] = useState('');
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState('1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');


  const fetchFlights = async () => {
    // Input validation - Both SkyIds AND EntityIds are required for this endpoint
    if (!originSkyId || !destinationSkyId || !originEntityId || !destinationEntityId || !date || !adults || !cabinClass) {
      setError('Please fill all required fields including EntityIds. Use airport search to get valid codes.');
      return;
    }
    // Date validation (must be in YYYY-MM-DD and not in the past)
    const today = new Date();
    const depDate = new Date(date);
    if (isNaN(depDate.getTime()) || depDate < today) {
      setError('Please enter a valid future departure date (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);

    // Add a small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Use searchFlights endpoint with BOTH SkyId and EntityId parameters
      const params = [
        `originSkyId=${originSkyId}`,
        `destinationSkyId=${destinationSkyId}`,
        `originEntityId=${originEntityId}`,
        `destinationEntityId=${destinationEntityId}`,
        `date=${date}`,
        returnDate ? `returnDate=${returnDate}` : '',
        `adults=${adults}`,
        `cabinClass=${cabinClass}`,
        `currency=USD`,
        `locale=en-US`,
        `market=en-US`,
        `countryCode=US`,
      ].filter(Boolean).join('&');

      const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?${params}`;
      console.log(`Making API call to: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (data.status === false) {
        if (data.message && data.message.action === 'captcha') {
          setError('API rate limit reached. Please wait a few minutes and try again.');
        } else if (data.message) {
          setError(`API Error: ${JSON.stringify(data.message)} - Please check your airport codes and dates.`);
        } else {
          setError('No flights found for your search criteria.');
        }
        setResults(data); // Still set results to see the full response
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error('Flight search error:', err);
      setError('Failed to fetch flights. Please check your internet connection and try again.');
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="airplane" size={50} color="#fff" />
        </View>
        <Text style={styles.title}>My Flight App</Text>
        <Text style={styles.subtitle}>Find and book the best flights worldwide</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>

          <Text style={styles.cardTitle}>Search Airport</Text>
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Type airport or city name..."
            placeholderTextColor="#888"
            value={airportQuery}
            onChangeText={setAirportQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchAirport} disabled={airportLoading}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {airportLoading && <ActivityIndicator style={{ marginTop: 10 }} color="#6ea8fe" />}
        {airportResults.length > 0 && (
          <View style={styles.resultsBox}>
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>Results:</Text>
            {airportResults.map((a, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 12, flex: 1 }}>
                  {a.name} ({a.city}) - SkyId: {a.skyId}, EntityId: {a.entityId}
                </Text>
                <TouchableOpacity
                  style={[styles.button, { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#6ea8fe', marginLeft: 8 }]}
                  onPress={() => {
                    setOriginSkyId(a.skyId);
                    setOriginEntityId(a.entityId);
                  }}
                >
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 12 }}>Set Origin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#6ea8fe', marginLeft: 4 }]}
                  onPress={() => {
                    setDestinationSkyId(a.skyId);
                    setDestinationEntityId(a.entityId);
                  }}
                >
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 12 }}>Set Destination</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="airplane-outline" size={24} color="#6ea8fe" />
          <Text style={styles.cardTitle}>Flight Search</Text>
        </View>
        <Text style={styles.hint}>
          💡 Use airport search above to get valid codes
        </Text>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Origin SkyId (e.g. LOND)" placeholderTextColor="#bbb" value={originSkyId} onChangeText={setOriginSkyId} />
          <TextInput style={styles.input} placeholder="Destination SkyId (e.g. NYCA)" placeholderTextColor="#bbb" value={destinationSkyId} onChangeText={setDestinationSkyId} />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Origin EntityId (e.g. 27544008)" placeholderTextColor="#bbb" value={originEntityId} onChangeText={setOriginEntityId} />
          <TextInput style={styles.input} placeholder="Destination EntityId (e.g. 27537542)" placeholderTextColor="#bbb" value={destinationEntityId} onChangeText={setDestinationEntityId} />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Departure (YYYY-MM-DD)" placeholderTextColor="#bbb" value={date} onChangeText={setDate} />
          <TextInput style={styles.input} placeholder="Return (YYYY-MM-DD)" placeholderTextColor="#bbb" value={returnDate} onChangeText={setReturnDate} />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.inputSmall} placeholder="Adults" placeholderTextColor="#bbb" value={adults} onChangeText={setAdults} keyboardType="numeric" />
          <TextInput style={styles.inputSmall} placeholder="Cabin" placeholderTextColor="#bbb" value={cabinClass} onChangeText={setCabinClass} />
        </View>
        <TouchableOpacity style={styles.button} onPress={fetchFlights} disabled={loading}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.buttonText}>Search Flights</Text>
        </TouchableOpacity>

     

      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ea8fe" />
          <Text style={styles.loadingText}>Searching flights...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {results && (
        <View style={styles.resultsBox}>
          <View style={styles.cardHeader}>
            <Ionicons name="airplane" size={24} color="#6ea8fe" />
            <Text style={styles.cardTitle}>Flight Results</Text>
          </View>
          {results.data && results.data.itineraries && results.data.itineraries.length > 0 ? (
            <>
              <Text style={{ color: '#333', fontSize: 16, marginBottom: 12, fontWeight: '600' }}>
                Found {results.data.itineraries.length} flights
              </Text>
              {results.data.itineraries.slice(0, 5).map((itinerary: any, idx: number) => {
                const leg = itinerary.legs?.[0];
                const carrier = leg?.carriers?.[0];
                const segments = leg?.segments || [];

                return (
                  <View key={idx} style={{ backgroundColor: '#333', padding: 12, marginBottom: 8, borderRadius: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#6ea8fe', fontWeight: 'bold', fontSize: 16 }}>
                        {carrier?.name || `Flight ${idx + 1}`}
                      </Text>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                        {itinerary.price?.formatted || 'N/A'}
                      </Text>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: '#bbb', fontSize: 12 }}>
                        ⏱️ Duration: {leg?.durationInMinutes ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m` : leg?.duration || 'N/A'}
                      </Text>
                      <Text style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
                        ✈️ {leg?.stopCount === 0 ? 'Direct flight' : `${leg?.stopCount} stop${leg?.stopCount > 1 ? 's' : ''}`}
                      </Text>

                      {leg?.departure && leg?.arrival && (
                        <Text style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
                          🕐 {leg.departure.split('T')[1]?.substring(0, 5)} → {leg.arrival.split('T')[1]?.substring(0, 5)}
                        </Text>
                      )}

                      {segments.length > 0 && (
                        <Text style={{ color: '#bbb', fontSize: 11, marginTop: 2 }}>
                          Route: {segments.map((seg: any) => `${seg.origin?.displayCode || seg.originPlace?.iata}-${seg.destination?.displayCode || seg.destinationPlace?.iata}`).join(' → ')}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          ) : results.data && Array.isArray(results.data) && results.data.length > 0 ? (
            // Handle different response format
            <>
              <Text style={{ color: '#6ea8fe', fontSize: 14, marginBottom: 8 }}>
                Found {results.data.length} flights
              </Text>
              {results.data.slice(0, 5).map((flight: any, idx: number) => (
                <View key={idx} style={{ backgroundColor: '#333', padding: 12, marginBottom: 8, borderRadius: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#6ea8fe', fontWeight: 'bold', fontSize: 16 }}>
                      {flight.airline || flight.carriers?.[0]?.name || `Flight ${idx + 1}`}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                      {flight.price?.formatted || flight.price || 'N/A'}
                    </Text>
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: '#bbb', fontSize: 12 }}>
                      ⏱️ Duration: {flight.duration || 'N/A'}
                    </Text>
                    <Text style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
                      ✈️ {flight.stops === 0 || flight.direct ? 'Direct flight' : `${flight.stops} stops`}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={{ backgroundColor: '#333', padding: 16, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
                No flight data available. Try adjusting your search criteria.
              </Text>
              {/* Debug: Show raw API response */}
              <Text selectable style={{ fontSize: 10, color: '#bbb', marginTop: 10 }}>{JSON.stringify(results, null, 2)}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#667eea',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 0,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    backgroundColor: '#6ea8fe',
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e6ff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  hint: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#666',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    color: '#333',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputSmall: {
    backgroundColor: '#f8f9fa',
    color: '#333',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: 80,
  },
  searchButton: {
    backgroundColor: '#6ea8fe',
    borderRadius: 12,
    padding: 14,
    marginLeft: 8,
    shadowColor: '#6ea8fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6ea8fe',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#6ea8fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginRight: 8,
  },
  warningButton: {
    backgroundColor: '#ffc107',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '90%',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
