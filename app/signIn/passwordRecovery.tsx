import {StyleSheet, View, Text, TextInput, Button, TouchableOpacity} from 'react-native';
import {useFonts} from 'expo-font';
import {useState} from 'react';

export default function PasswordRecovery() {
  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });


  const [email, setEmail] = useState('');
  

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.mammon}>MAMMON</Text>
      </View>
      <View style={styles.upperContainer}>
        <TextInput
          placeholder="E-mail"
          style={styles.email}
          placeholderTextColor="#8BB04F"
          onChangeText={setEmail}
        />
        <TouchableOpacity onPress={() => console.log(email)}>
          <Text>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#290A15',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  mammon: {
    fontFamily: 'Afacad-Regular',
    fontSize: 50,
    color: '#8BB04F',
    textAlign: 'center',
  },
  upperContainer: {
    marginTop: 50,
  },
  email: {
    backgroundColor: '#8BB04F',
    width: 300,
    height: 50,
    borderRadius: 25,
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
  },
});