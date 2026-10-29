import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useDebounce } from '../utils/useDebounce';
import { ActivityIndicator, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const RAPIDAPI_KEY = Constants.expoConfig?.extra?.RAPIDAPI_KEY || '';

// Popular cities data with skyId and entityId for flight search
const popularCities = [
  { name: 'New York', code: 'NYC', country: 'USA', skyId: 'NYCA', entityId: '27537542' },
  { name: 'London', code: 'LON', country: 'UK', skyId: 'LOND', entityId: '27544008' },
  { name: 'Paris', code: 'PAR', country: 'France', skyId: 'PARI', entityId: '27539793' },
  { name: 'Tokyo', code: 'TYO', country: 'Japan', skyId: 'TYOA', entityId: '27539587' },
  { name: 'Los Angeles', code: 'LAX', country: 'USA', skyId: 'LAXA', entityId: '27536542' },
  { name: 'Dubai', code: 'DXB', country: 'UAE', skyId: 'DXBA', entityId: '27539016' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore', skyId: 'SINA', entityId: '27537859' },
  { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong', skyId: 'HKGA', entityId: '27539289' },
  { name: 'Sydney', code: 'SYD', country: 'Australia', skyId: 'SYDA', entityId: '27537471' },
  { name: 'Mumbai', code: 'BOM', country: 'India', skyId: 'BOMA', entityId: '27539733' },
  { name: 'Delhi', code: 'DEL', country: 'India', skyId: 'DELA', entityId: '27539018' },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand', skyId: 'BKKA', entityId: '27537542' },
  { name: 'Amsterdam', code: 'AMS', country: 'Netherlands', skyId: 'AMSA', entityId: '27544125' },
  { name: 'Frankfurt', code: 'FRA', country: 'Germany', skyId: 'FRAA', entityId: '27544266' },
  { name: 'Barcelona', code: 'BCN', country: 'Spain', skyId: 'BCNA', entityId: '27540772' },
  { name: 'Rome', code: 'ROM', country: 'Italy', skyId: 'ROMA', entityId: '27539793' },
  { name: 'Istanbul', code: 'IST', country: 'Turkey', skyId: 'ISTA', entityId: '27544370' },
  { name: 'Chicago', code: 'CHI', country: 'USA', skyId: 'CHIA', entityId: '27539587' },
  { name: 'Miami', code: 'MIA', country: 'USA', skyId: 'MIAA', entityId: '27536799' },
  { name: 'Toronto', code: 'YTO', country: 'Canada', skyId: 'YTOA', entityId: '27537859' },
  { name: 'Melbourne', code: 'MEL', country: 'Australia', skyId: 'MELA', entityId: '27537471' },
  { name: 'Seoul', code: 'SEL', country: 'South Korea', skyId: 'SELA', entityId: '27539289' },
  { name: 'Berlin', code: 'BER', country: 'Germany', skyId: 'BERA', entityId: '27544266' },
  { name: 'Madrid', code: 'MAD', country: 'Spain', skyId: 'MADA', entityId: '27540772' },
  { name: 'Lisbon', code: 'LIS', country: 'Portugal', skyId: 'LISA', entityId: '27541733' },
];


export default function FlightSearchHome() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [cabinClass, setCabinClass] = useState('economy');
  const [date, setDate] = useState('2025-08-15');
  const [returnDate, setReturnDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'user@example.com';

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting Clerk signout process...');

      // Close the menu first
      setMenuVisible(false);

      // Use Clerk's signOut method
      await signOut();

      console.log('✅ Clerk signout completed, navigating...');

      // Navigate to SignInSignUp screen
      router.replace('/SignInSignUp');
      console.log('✅ Navigation executed: /SignInSignUp');

    } catch (error) {
      console.error('❌ Error in Clerk signOut:', error);
      setMenuVisible(false);

      // Fallback: Force navigation anyway
      setTimeout(() => {
        router.replace('/SignInSignUp');
        console.log('🔄 Fallback navigation executed');
      }, 500);
    }
  };

  const fetchFlights = async () => {
    // Debug: Log current IDs
    console.log('Origin City:', originCity, 'Origin SkyId:', originSkyId, 'Origin EntityId:', originEntityId);
    console.log('Destination City:', destinationCity, 'Destination SkyId:', destinationSkyId, 'Destination EntityId:', destinationEntityId);

    // Input validation - Both SkyIds AND EntityIds are required for this endpoint
    if (!originCity.trim()) {
      setError('Please enter origin city (e.g., Lahore, Islamabad)');
      return;
    }
    if (!destinationCity.trim()) {
      setError('Please enter destination city (e.g., Karachi, Dubai)');
      return;
    }
    if (!originSkyId || !originEntityId) {
      setError(`Origin city "${originCity}" - waiting for airport codes to load. Please wait...`);
      return;
    }
    if (!destinationSkyId || !destinationEntityId) {
      setError(`Destination city "${destinationCity}" - waiting for airport codes to load. Please wait...`);
      return;
    }
    if (!date || !adults || !cabinClass) {
      setError('Please fill all required fields (date, passengers, cabin class).');
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
    setResults(null);

    // Add a longer delay to prevent rate limiting and avoid CAPTCHA
    await new Promise(resolve => setTimeout(resolve, 3000));

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
        `cabinClass=economy`,
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
          'User-Agent': 'MyFlightApp/1.0',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('==== FLIGHT SEARCH RESULTS ====');
      console.log('API Response Status:', response.status);
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      
      // Extract and log specific flight information if available
      if (data.data && data.data.itineraries && data.data.itineraries.length > 0) {
        console.log('\n==== FLIGHT DETAILS ====');
        data.data.itineraries.forEach((itinerary: any, index: number) => {
          console.log(`\n--- Flight ${index + 1} ---`);
          
          // Airline Information
          const airline = itinerary.legs?.[0]?.carriers?.marketing?.[0]?.name || 'Unknown Airline';
          console.log('Airline:', airline);
          
          // Price Information
          const price = itinerary.price?.formatted || 'Price N/A';
          console.log('Price:', price);
          
          // Flight Times
          const departure = itinerary.legs?.[0]?.departure ? new Date(itinerary.legs[0].departure).toISOString() : 'Departure N/A';
          const arrival = itinerary.legs?.[0]?.arrival ? new Date(itinerary.legs[0].arrival).toISOString() : 'Arrival N/A';
          console.log('Departure:', departure);
          console.log('Arrival:', arrival);
          
          // Airports
          const originCode = itinerary.legs?.[0]?.origin?.displayCode || 'Origin N/A';
          const destinationCode = itinerary.legs?.[0]?.destination?.displayCode || 'Destination N/A';
          console.log('Route:', `${originCode} → ${destinationCode}`);
          
          // Duration
          const durationMinutes = itinerary.legs?.[0]?.durationInMinutes;
          const duration = durationMinutes ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : 'Duration N/A';
          console.log('Duration:', duration);
          
          // Stops
          const stopCount = itinerary.legs?.[0]?.stopCount || 0;
          console.log('Stops:', stopCount === 0 ? 'Non-stop' : `${stopCount} stops`);
        });
      }
      console.log('================================\n');

      // Show API error messages if present
      if (data.status === false) {
        if (data.message && data.message.action === 'captcha') {
          setError('API CAPTCHA protection activated. This usually means too many requests. Please:\n• Wait 5-10 minutes before trying again\n• Check your RapidAPI plan limits\n• Consider upgrading your RapidAPI subscription');
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
  const [adults, setAdults] = useState('1');
  // Example values - using proper SkyIds and EntityIds from RapidAPI examples
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [originSkyId, setOriginSkyId] = useState('');
  const [destinationSkyId, setDestinationSkyId] = useState('');
  const [originEntityId, setOriginEntityId] = useState('');
  const [destinationEntityId, setDestinationEntityId] = useState('');

  // Debounced values to limit API requests
  const debouncedOriginCity = useDebounce(originCity, 600);
  const debouncedDestinationCity = useDebounce(destinationCity, 600);
  // Fetch skyId/entityId for origin city
  useEffect(() => {
    const fetchOriginIds = async () => {
      if (!debouncedOriginCity || debouncedOriginCity.length < 3) {
        setOriginSkyId('');
        setOriginEntityId('');
        return;
      }
      setLoadingOrigin(true);
      try {
        const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(debouncedOriginCity)}&locale=en-US`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
            'User-Agent': 'MyFlightApp/1.0',
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Origin API Response:', JSON.stringify(data, null, 2));
        if (data.data && data.data.length > 0) {
          setOriginSkyId(data.data[0].skyId || '');
          setOriginEntityId(data.data[0].entityId || '');
          console.log('Origin IDs set:', data.data[0].skyId, data.data[0].entityId);
        }
      } catch (error) {
        console.error('Error fetching origin IDs:', error);
        setOriginSkyId('');
        setOriginEntityId('');
      }
      setLoadingOrigin(false);
    };
    fetchOriginIds();
  }, [debouncedOriginCity]);

  // Fetch skyId/entityId for destination city
  useEffect(() => {
    const fetchDestinationIds = async () => {
      if (!debouncedDestinationCity || debouncedDestinationCity.length < 3) {
        setDestinationSkyId('');
        setDestinationEntityId('');
        return;
      }
      setLoadingDestination(true);
      try {
        const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(debouncedDestinationCity)}&locale=en-US`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
            'User-Agent': 'MyFlightApp/1.0',
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Destination API Response:', JSON.stringify(data, null, 2));
        if (data.data && data.data.length > 0) {
          setDestinationSkyId(data.data[0].skyId || '');
          setDestinationEntityId(data.data[0].entityId || '');
          console.log('Destination IDs set:', data.data[0].skyId, data.data[0].entityId);
        }
      } catch (error) {
        console.error('Error fetching destination IDs:', error);
        setDestinationSkyId('');
        setDestinationEntityId('');
      }
      setLoadingDestination(false);
    };
    fetchDestinationIds();
  }, [debouncedDestinationCity]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hamburger menu icon in header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.hamburgerBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Hamburger menu modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
        presentationStyle="overFullScreen"
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuDrawer}>
            {/* Header Section */}
            <View style={styles.menuHeader}>
              <View style={styles.userAvatarContainer}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color="#6ea8fe" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.menuWelcome}>Welcome back</Text>
                  <Text style={styles.menuEmail}>{userEmail}</Text>
                </View>
              </View>
              <Pressable style={styles.menuCloseBtn} onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#bbb" />
              </Pressable>
            </View>

            {/* Bottom Section */}
            <View style={styles.menuBottom}>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuSignOutBtn} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
                <Text style={styles.menuSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: 'https://www.gstatic.com/travel-frontend/animation/hero/flights_nc_dark_theme_4.svg' }}
          style={styles.heroArt}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
        </ImageBackground>
        <Text style={styles.heroTitle}>Flights</Text>
      </View>
      <View style={styles.googleCard}>
        <View style={styles.googleRow}>

          <Ionicons name="person" size={18} color="#bbb" style={{ marginLeft: 16, marginRight: 4 }} />
          <Text style={styles.googlePassengers}>{adults}</Text>
          <Text style={styles.googleCabinClass}>Economy</Text>
        </View>
        <View style={styles.googleInputRow}>
          <View style={styles.inputRowTop}>
            <View style={styles.googleInputBoxLeft}>
              <Ionicons name="radio-button-on" size={18} color="#bbb" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.googleInputText}
                placeholder="Origin"
                value={originCity}
                onChangeText={setOriginCity}
                placeholderTextColor="#bbb"
              />
              {loadingOrigin && (
                <ActivityIndicator size="small" color="#6ea8fe" style={{ marginLeft: 8 }} />
              )}
              {!loadingOrigin && originSkyId && (
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 8 }} />
              )}
            </View>
            <TouchableOpacity style={styles.googleSwapBtnHorizontal} onPress={() => {
              const tempCity = originCity;
              const tempSkyId = originSkyId;
              const tempEntityId = originEntityId;

              setOriginCity(destinationCity);
              setOriginSkyId(destinationSkyId);
              setOriginEntityId(destinationEntityId);

              setDestinationCity(tempCity);
              setDestinationSkyId(tempSkyId);
              setDestinationEntityId(tempEntityId);
            }}>
              <Ionicons name="swap-horizontal" size={22} color="#bbb" />
            </TouchableOpacity>
            <View style={styles.googleInputBoxMiddle}>
              <Ionicons name="location" size={18} color="#bbb" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.googleInputText}
                placeholder="Where to?"
                value={destinationCity}
                onChangeText={setDestinationCity}
                placeholderTextColor="#bbb"
              />
              {loadingDestination && (
                <ActivityIndicator size="small" color="#6ea8fe" style={{ marginLeft: 8 }} />
              )}
              {!loadingDestination && destinationSkyId && (
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 8 }} />
              )}
            </View>
          </View>
        </View>
        <View style={styles.inputRowBottom}>
          <View style={styles.googleInputBoxDate}>
            <Ionicons name="calendar" size={18} color="#bbb" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.googleInputText}
              placeholder="Departure"
              value={date}
              onChangeText={setDate}
              placeholderTextColor="#bbb"
            />
          </View>
          <View style={styles.googleInputBoxReturn}>
            <Ionicons name="calendar" size={18} color="#bbb" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.googleInputText}
              placeholder="Return"
              value={returnDate}
              onChangeText={setReturnDate}
              placeholderTextColor="#bbb"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.googleExploreBtn} onPress={fetchFlights} disabled={loading}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.googleExploreText}>Explore</Text>
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
      {results && results.data && results.data.itineraries && results.data.itineraries.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Available Flights</Text>
          {results.data.itineraries.slice(0, 10).map((flight: any, index: number) => {
            const leg = flight.legs?.[0];
            const airline = leg?.carriers?.marketing?.[0];
            const price = flight.price?.formatted || 'N/A';
            const departure = leg?.departure ? new Date(leg.departure).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }) : 'N/A';
            const arrival = leg?.arrival ? new Date(leg.arrival).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }) : 'N/A';
            const durationMinutes = leg?.durationInMinutes;
            const duration = durationMinutes ? 
              `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min` : 'N/A';
            const stops = leg?.stopCount || 0;
            const originCode = leg?.origin?.displayCode || 'N/A';
            const destinationCode = leg?.destination?.displayCode || 'N/A';

            return (
              <View key={index} style={styles.flightCard}>
                <View style={styles.flightHeader}>
                  <View style={styles.airlineSection}>
                    <View style={styles.airlineLogo}>
                      <Text style={styles.airlineCode}>
                        {airline?.name?.substring(0, 3).toUpperCase() || 'AIR'}
                      </Text>
                    </View>
                    <View style={styles.flightTimes}>
                      <Text style={styles.timeText}>{departure} – {arrival}</Text>
                      <Text style={styles.routeText}>{originCode} → {destinationCode}</Text>
                    </View>
                  </View>
                  <View style={styles.priceSection}>
                    <Text style={styles.priceText}>{price}</Text>
                    <Text style={styles.tripType}>round trip</Text>
                  </View>
                </View>
                
                <View style={styles.flightDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{duration}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Stops:</Text>
                    <Text style={[styles.detailValue, stops === 0 && styles.nonStopText]}>
                      {stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Airline:</Text>
                    <Text style={styles.detailValue}>{airline?.name || 'Unknown Airline'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      
      {results && (!results.data || !results.data.itineraries || results.data.itineraries.length === 0) && (
        <View style={styles.resultsBox}>
          <View style={styles.flightResultCard}>
            <Text style={styles.flightAirline}>No flights found</Text>
            <Text style={styles.flightTime}>Try different dates or destinations</Text>
            <Text style={styles.flightAirport}>Check console for API response details</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24,26,32,0.15)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    position: 'relative',
  },
  googleCard: {
    backgroundColor: '#23242a',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 1024,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  googleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  googleTripType: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  googlePassengers: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  googleCabinClass: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  googleInputRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    gap: 12,
  },
  inputRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  inputRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  inputStack: {
    flexDirection: 'column',
    width: '80%',
    gap: 10,
  },
  googleInputBoxLeft: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  googleInputBoxMiddle: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  googleInputBoxDate: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  googleInputBoxReturn: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  googleInputBoxRight: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
    flex: 2,
    marginLeft: 4,
  },
  googleInputText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  googleSwapBtn: {
    backgroundColor: '#23242a',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    elevation: 2,
  },
  googleSwapBtnHorizontal: {
    backgroundColor: '#23242a',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  googleSwapBtnVertical: {
    backgroundColor: '#23242a',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 0,
    elevation: 2,
    alignSelf: 'flex-end',
  },
  googleDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  googleExploreBtn: {
    backgroundColor: '#181A20',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    flexDirection: 'row',
    alignSelf: 'center',
    elevation: 2,
  },
  googleExploreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
  resultsContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  flightCard: {
    backgroundColor: '#23242a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  airlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#181A20',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  airlineCode: {
    color: '#6ea8fe',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flightTimes: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  routeText: {
    color: '#bbb',
    fontSize: 14,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripType: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 2,
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#bbb',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  nonStopText: {
    color: '#4CAF50',
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
  flightStops: {
    color: '#ff9500',
    fontSize: 13,
    marginTop: 2,
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
    paddingTop: 15,
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
  // City dropdown styles
  cityDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#23242a',
    borderRadius: 16,
    paddingVertical: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 350,
    borderWidth: 1,
    borderColor: '#444',
  },
  cityDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#181A20',
    backgroundColor: 'transparent',
  },
  cityDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cityName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cityDetails: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 2,
  },
  cityIdsText: {
    color: '#888',
    fontSize: 11,
    marginTop: 1,
    fontStyle: 'italic',
  },
  topHeader: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 10,
    marginBottom: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 16,
  },
  userAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2d35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#6ea8fe',
  },
  userInfo: {
    flex: 1,
  },
  menuWelcome: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuEmail: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '400',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
    marginVertical: 16,
  },
  menuItems: {
    flex: 1,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 16,
  },
  menuBottom: {
    width: '100%',
    paddingTop: 8,
  },
  menuSignOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginTop: 8,
  },
  menuSignOutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hamburgerBtn: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDrawer: {
    backgroundColor: '#1a1b20',
    width: 320,
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(110, 168, 254, 0.1)',
  },
});
