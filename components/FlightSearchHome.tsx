import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const RAPIDAPI_KEY = Constants.expoConfig?.extra?.RAPIDAPI_KEY || '';


export default function FlightSearchHome() {
  const [airportQuery, setAirportQuery] = useState('');
  const [airportResults, setAirportResults] = useState<{ name: string; city: string; skyId: string; entityId: string }[]>([]);
  const [airportLoading, setAirportLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Popular cities for dropdown
  const popularCities = [
    'Lahore',
    'Islamabad',
    'Karachi',
    'Dubai',
    'London',
    'New York',
    'Jeddah',
    'Doha',
    'Bangkok',
    'Istanbul',
  ];

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
    } catch {
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
        headers:
         {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        },
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      // Show API error messages if present
      if (data.status === false) {
        if (data.message && data.message.action === 'captcha') {
          setError('API rate limit reached. Please wait a few minutes and try again.');
        } else if (data.message) {
          setError(`API Error: ${JSON.stringify(data.message)} - Please check your airport codes and dates.`);
        } else {
          setError('No flights found for your search criteria.');
        }
        setResults(data); // Still set results to see the full response
      } else if (data.data && data.data.messages && data.data.messages.length > 0) {
        setError(`API Message: ${data.data.messages.join(' ')} - Try different search criteria.`);
        setResults(data);
      } else if (data.data && data.data.context && data.data.context.status && data.data.context.status !== 'complete') {
        setError(`API Context Status: ${data.data.context.status}. Try changing your search criteria.`);
        setResults(data);
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
      {/* Large header illustration and title */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Flights</Text>
      </View>

      {/* Airport search section */}
      <View style={styles.airportSearchBox}>
        <Text style={styles.airportSearchLabel}>Search Airport by City or Name</Text>
        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.inputBox}
              placeholder="Enter city or airport name"
              value={airportQuery}
              onChangeText={text => {
                setAirportQuery(text);
                setShowCityDropdown(text.length === 0);
              }}
              placeholderTextColor="#bbb"
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
            />
            {showCityDropdown && (
              <View style={styles.cityDropdown}>
                {popularCities.map((city, idx) => (
                  <TouchableOpacity
                    key={city + idx}
                    style={styles.cityDropdownItem}
                    onPress={() => {
                      setAirportQuery(city);
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text style={styles.cityDropdownText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.airportSearchBtn} onPress={searchAirport} disabled={airportLoading}>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.airportSearchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
        {airportLoading && (
          <ActivityIndicator size="small" color="#6ea8fe" style={{ marginTop: 8 }} />
        )}
        {airportResults.length > 0 && (
          <View style={styles.airportResultsBox}>
            {airportResults.map((airport, idx) => (
              <View key={airport.skyId + airport.entityId + idx} style={styles.airportResultRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.airportResultName}>{airport.name}</Text>
                  <Text style={styles.airportResultDetails}>{airport.city} | SkyId: {airport.skyId} | EntityId: {airport.entityId}</Text>
                </View>
                <TouchableOpacity style={styles.setBtn} onPress={() => { setOriginSkyId(airport.skyId); setOriginEntityId(airport.entityId); }}>
                  <Text style={styles.setBtnText}>Set Origin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.setBtn} onPress={() => { setDestinationSkyId(airport.skyId); setDestinationEntityId(airport.entityId); }}>
                  <Text style={styles.setBtnText}>Set Destination</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Ionicons name="person" size={20} color="#bbb" style={{ marginHorizontal: 8 }} />
          <Text style={styles.cardLabel}>{adults}</Text>
          <Ionicons name="briefcase" size={20} color="#bbb" style={{ marginHorizontal: 8 }} />
          <Text style={styles.cardLabel}>{cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1)}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.inputBox} placeholder="Origin City or SkyId" value={originSkyId} onChangeText={setOriginSkyId} placeholderTextColor="#bbb" />
          <TouchableOpacity onPress={() => {
            // Swap origin and destination SkyId and EntityId
            const tempSkyId = originSkyId;
            const tempEntityId = originEntityId;
            setOriginSkyId(destinationSkyId);
            setOriginEntityId(destinationEntityId);
            setDestinationSkyId(tempSkyId);
            setDestinationEntityId(tempEntityId);
          }}>
            <Ionicons name="swap-horizontal" size={24} color="#bbb" style={{ marginHorizontal: 8 }} />
          </TouchableOpacity>
          <TextInput style={styles.inputBox} placeholder="Destination City or SkyId" value={destinationSkyId} onChangeText={setDestinationSkyId} placeholderTextColor="#bbb" />
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.inputBox} placeholder="Departure (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholderTextColor="#bbb" />
          <TextInput style={styles.inputBox} placeholder="Return (YYYY-MM-DD)" value={returnDate} onChangeText={setReturnDate} placeholderTextColor="#bbb" />
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.inputBox} placeholder="Origin EntityId" value={originEntityId} onChangeText={setOriginEntityId} placeholderTextColor="#bbb" />
          <TextInput style={styles.inputBox} placeholder="Destination EntityId" value={destinationEntityId} onChangeText={setDestinationEntityId} placeholderTextColor="#bbb" />
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.inputBox} placeholder="Adults" value={adults} onChangeText={setAdults} keyboardType="numeric" placeholderTextColor="#bbb" />
          <TextInput style={styles.inputBox} placeholder="Cabin Class" value={cabinClass} onChangeText={setCabinClass} placeholderTextColor="#bbb" />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={fetchFlights} disabled={loading}>
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results and error handling remain unchanged below */}
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
          {results && results.data && Array.isArray(results.data) && results.data.length > 0 ? (
            results.data.map((flight: any, idx: number) => (
              <View key={flight.id || idx} style={styles.flightResultCard}>
                <View style={styles.flightRow}>
                  <Text style={styles.flightAirline}>{flight.airlineName || flight.airline || 'Unknown Airline'}</Text>
                  <Text style={styles.flightPrice}>{flight.price ? `$${flight.price}` : 'Price N/A'}</Text>
                </View>
                <View style={styles.flightRow}>
                  <Text style={styles.flightTime}>{flight.departureTime || flight.departure || 'Dep N/A'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#6ea8fe" style={{ marginHorizontal: 8 }} />
                  <Text style={styles.flightTime}>{flight.arrivalTime || flight.arrival || 'Arr N/A'}</Text>
                </View>
                <View style={styles.flightRow}>
                  <Text style={styles.flightAirport}>{flight.originAirport || flight.origin || 'Origin N/A'}</Text>
                  <Text style={styles.flightAirport}>{flight.destinationAirport || flight.destination || 'Dest N/A'}</Text>
                </View>
                {flight.duration && (
                  <Text style={styles.flightDuration}>Duration: {flight.duration}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={{alignItems: 'center', justifyContent: 'center', padding: 24}}>
              <Ionicons name="airplane" size={48} color="#6ea8fe" style={{marginBottom: 12}} />
              <Text style={styles.noFlightsText}>
                {results && results.data && Array.isArray(results.data) && results.data.length === 0
                  ? 'No flights found. Try changing your dates, airports, or passenger count.'
                  : 'No valid flight data received. Please check your search and try again.'}
              </Text>
              <Text style={{color: '#bbb', fontSize: 14, marginTop: 8, textAlign: 'center'}}>
                Tip: Popular routes and future dates are more likely to show results.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cityDropdown: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#23242a',
    borderRadius: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#222',
    maxHeight: 220,
  },
  cityDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#181A20',
  },
  cityDropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  airportDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#23242a',
    borderRadius: 16,
    paddingVertical: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: '#222',
  },
  airportDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#181A20',
  },
  airportDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  flightResultCard: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  flightAirline: {
    color: '#6ea8fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flightPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flightTime: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '500',
  },
  flightAirport: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '400',
  },
  flightDuration: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  noFlightsText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#181A20',
    alignItems: 'center',
    paddingTop: 32,
    minHeight: '100%',
    width: '100%',
    paddingHorizontal: 0,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 0,
    paddingHorizontal: 0,
  },
  heroArt: {
    width: '100%',
    height: 180,
    backgroundColor: '#23242a',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    position: 'relative',
    marginBottom: 0,
  },
  heroTitle: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -24,
    marginBottom: 18,
    letterSpacing: 1,
    width: '100%',
  },
  card: {
    backgroundColor: '#23242a',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  cardLabel: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  inputBox: {
    backgroundColor: '#181A20',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#444',
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
    maxWidth: '100%',
  },
  searchBtn: {
    backgroundColor: '#181A20',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    width: '80%',
    alignSelf: 'center',
    flexDirection: 'row',
    minWidth: 180,
    maxWidth: 340,
  },
  searchBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#23242a',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resultsBox: {
    backgroundColor: '#23242a',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  airportSearchBox: {
    backgroundColor: '#23242a',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 20,
  },
  airportSearchLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  airportSearchBtn: {
    backgroundColor: '#181A20',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flexDirection: 'row',
  },
  airportSearchBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  airportResultsBox: {
    marginTop: 12,
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  airportResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#23242a',
    flexWrap: 'wrap',
    gap: 6,
  },
  airportResultName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  airportResultDetails: {
    color: '#bbb',
    fontSize: 13,
  },
  setBtn: {
    backgroundColor: '#6ea8fe',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
    marginTop: 4,
    minWidth: 90,
    alignItems: 'center',
  },
  setBtnText: {
    color: '#222',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
