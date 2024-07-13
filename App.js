import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text,  SafeAreaView, Image, ScrollView , View, Dimensions} from 'react-native';
import GeographyComponent from './components/LocationComponent';
import WeatherComponent from './components/WeatherComponent';

export default function App() {
  
  return (
    <SafeAreaView>
      <ScrollView  >
        <View style={styles.container}>
          <Text style={styles.text}>API Call</Text>
          <GeographyComponent />
          <Image source={{ uri: 'https://picsum.photos/1920/1080?random=6' }} width={360} height={300} />
          
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
    justifyContent:'center',
    alignItems:'center',
    paddingTop:40
  },
  text:{
    color:'green',
    fontSize:20,
    fontWeight:'bold'
  }
});
