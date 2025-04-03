import {StyleSheet, View, Text, TextInput, TouchableOpacity} from 'react-native';
import {useFonts} from 'expo-font';
import {useState} from 'react';
import { supabase } from '../../lib/supabase';

export default function PasswordRecovery() {
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });

<<<<<<< Updated upstream

  function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return false;
    }
    return true;
  }
=======
  
>>>>>>> Stashed changes

  function isValidDateOfBirth(dob: string): boolean {
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dobRegex.test(dob)) {
      return false;
  }

  const [year, month, day] = dob.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
  }

  const handlePasswordRecovery = async () => {
<<<<<<< Updated upstream
    if (!email) {
      alert('Please enter your email.');
      return;
    }
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
=======
    // Basic validation
    if (!email || !dob) {
      alert('All fields are required.');
      return;
    }
    if (!isValidDateOfBirth(dob)) {
      alert('Invalid date of birth format. Use YYYY-MM-DD.');
      return;
    }
    
    // Here we call the Supabase resetPasswordForEmail method.
    // Note: This method sends a recovery email. To actually update the password
    // immediately after verifying the dob, you'll need custom backend logic.
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/updatePassword`, // adjust as needed
      });
>>>>>>> Stashed changes
      if (error) {
        alert('Error occured:' + error.message);
        throw error;
      }
      alert('Password recovery email sent! Please check your inbox.');
    } catch (error: any) {
      alert('Error sending password recovery email: ' + error.message);
    }
  };



  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.mammon}>MAMMON</Text>
      </View>
      <View style={styles.upperContainer}>
        <TextInput
          placeholder="E-mail"
          style={styles.input}
          placeholderTextColor="#8BB04F"
          onChangeText={setEmail}
        />
        <TextInput 
<<<<<<< Updated upstream
          placeholder="New Password"
          style={styles.input}
          placeholderTextColor={"#8BB04F"}
          onChangeText={setNewPassword}
        />
        <TextInput 
          placeholder='Date of Birth (YYYY-MM-DD)'
=======
          placeholder="Date of Birth (YYYY-MM-DD)"
>>>>>>> Stashed changes
          style={styles.input}
          placeholderTextColor='#8BB04F'
          maxLength={10}
          onChangeText={(text) => setDob(text)}
          onEndEditing={(e) => {
          const edob = e.nativeEvent.text;
          if (!isValidDateOfBirth(edob)) {
            alert('Invalid Date of Birth. Please use the format YYYY-MM-DD.');
          }
          }}
        />
        <TouchableOpacity style={styles.submit}onPress={() => (handlePasswordRecovery)}>
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
    fontFamily: 'Megrim-Regular',
    fontSize: 50,
    color: '#8BB04F',
    textAlign: 'center',
  },
  upperContainer: {
    marginTop: 50,
  },
  input: {
    color: '#8BB04F',
    width: 300,
    height: 50,
    borderRadius: 5,
    borderWidth:2,
    borderColor: '#980058',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
  },
  lowerContainer: {
    position: 'absolute',
    bottom: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submit: {
    backgroundColor: '#8BB04F',
    padding: 10,
    width: 150,
    borderRadius: 5,
    marginBottom: 20,
},
});