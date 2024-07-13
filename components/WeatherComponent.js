import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
//import { API_KEY } from './config'; // Create a config.js file with your OpenWeatherMap API key

export default function WeatherComponent() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);


 const API_KEY = '6b279fd4f91bccc983bce8f259119b77'

  /* useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to provide weather information.',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(position);
          getWeather(latitude, longitude);
        },
        (error) => {
          setErrorMsg(error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []); */

    useEffect(() => {
        getWeather(latitude, longitude);
    }, [])
    
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {weather && (
        <View>
          <Text style={styles.paragraph}>Location: {weather.name}</Text>
          <Text style={styles.paragraph}>Temperature: {weather.main.temp}°C</Text>
          <Text style={styles.paragraph}>Weather: {weather.weather[0].description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
