import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TextInput ,Button,Image, Dimensions, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

export default function LocationComponent() {
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false)
  const [givenAddress, setGivenAddress] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const API_KEY = '6b279fd4f91bccc983bce8f259119b77' //open weather api 
  const OPENCAGE_API_KEY = '65065d417cc54693a15d49ca31de1ff1'; //  OpenCage API key
  
   // console.log(weather, 'weather')

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
      if (location) {
        const { latitude, longitude } = location.coords;
        getAddressFromCoordinates(latitude, longitude);
        getWeather(latitude, longitude)
        calculateDistance(latitude, longitude);
      }
    })();
  }, []);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      setAddress(data.results[0].formatted);
    } else {
      Alert.alert('Address not found');
    }
  };
    
   const getWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      setErrorMsg('Error fetching weather data');
    } finally {
      setLoading(false);
    }
   };
  
  const geocodeAddress = async (address) => {
    try {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}`);
      const data = await response.json();
      
    if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      throw new Error('Error fetching geocode data');
    }
    
    
  };

 const calculateDistance = async () => {
    setIsCalculating(true);
    try {
      const { coords } = location;
      const { latitude: deviceLat, longitude: deviceLon } = coords;
      const { latitude, longitude } = await geocodeAddress(givenAddress);

      const R = 6371e3; // Earth radius in meters
      const φ1 = (deviceLat * Math.PI) / 180;
      const φ2 = (latitude * Math.PI) / 180;
      const Δφ = ((latitude - deviceLat) * Math.PI) / 180;
      const Δλ = ((longitude - deviceLon) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c; // Distance in meters
      setDistance(distance / 1000); // Convert to kilometers
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  let text = 'Waiting for location...';
  if (errorMsg) {
    text = errorMsg ;
  } else if (location) {
    text = `Latitude: ${location?.coords?.latitude}, Longitude: ${location?.coords?.longitude}`;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
      <TextInput
            style={styles.input}
            placeholder="Enter address"
            value={givenAddress}
            onChangeText={setGivenAddress}
          />
          <Button
            title="Calculate Distance"
            onPress={calculateDistance}
            disabled={isCalculating || !givenAddress}
          />
          {isCalculating && <ActivityIndicator size="large" color="#0000ff" />}
          {distance !== null && (
            <View >
              <Text style={[styles.paragraph, {color: distance <= 12 ? 'green' : 'red'}]}>
                Distance to {givenAddress}: {distance.toFixed(2)} km
              </Text>
            </View>
          )}
          {address && <Text style={styles.paragraph}>Address: {address}</Text>}
          {weather && (
        <>
          <Text style={styles.paragraph}>Location: {weather.name}</Text>
          <Text style={styles.paragraph}>Temperature: {weather.main.temp}°C</Text>
          <Text style={styles.paragraph}>Weather: {weather.weather[0].description}</Text>
          <Image source={{ uri: `http://openweathermap.org/img/w/${weather.weather[0].icon}.png` }} width={100} height={90} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  paragraph: {
    fontSize: width < 600 ? 18 : 24, // Adjust font size based on screen width
    textAlign: 'center',
    marginVertical: width < 600 ? 10 : 20, // Adjust margin based on screen width
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 240,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  }
  
});
