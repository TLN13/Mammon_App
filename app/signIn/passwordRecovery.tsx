import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function PasswordRecovery() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [dob, setDob] = useState('');
  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });

  function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    return passwordRegex.test(password);
  }

  function isValidDateOfBirth(dob: string): boolean {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) return false;
    const [year, month, day] = dob.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  const handlePasswordRecovery = async () => {
    // Basic validation
    if (!email || !newPassword || !dob) {
      alert('All fields are required.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      alert('New password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number.');
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
        redirectTo: `${window.location.origin}/update-password`, // adjust as needed
      });
      if (error) {
        alert('Error occurred: ' + error.message);
        return;
      }
      alert('A password recovery email has been sent. Please check your inbox.');
      router.push('/success');
    } catch (error: any) {
      console.log(error.message);
      alert('Error sending password recovery email: ' + error.message);
    }
  };

  if (!fontsLoaded) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}onPress={router.back}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.mammon}>MAMMON</Text>
      </View>
      <View style={styles.upperContainer}>
        <TextInput
          placeholder="E-mail"
          style={styles.input}
          placeholderTextColor="#8BB04F"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput 
          placeholder="New Password"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#8BB04F"
          onChangeText={setNewPassword}
          value={newPassword}
        />
        <TextInput 
          placeholder="Date of Birth (YYYY-MM-DD)"
          style={styles.input}
          placeholderTextColor="#8BB04F"
          maxLength={10}
          onChangeText={setDob}
          value={dob}
        />
        <TouchableOpacity style={styles.submit} onPress={handlePasswordRecovery}>
          <Text style={styles.submitText}>Submit</Text>
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
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    fontFamily: 'Afacad-Regular',
    color: '#290A15',
    fontSize: 20,
  },
  backButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#8BB04F',
    position: 'absolute',
    top: 30,
    left: 10,
  },
  mammon: {
    fontFamily: 'Megrim-Regular',
    fontSize: 50,
    color: '#8BB04F',
    textAlign: 'center',
  },
  upperContainer: {
    justifyContent: 'center'
  },
  input: {
    color: '#8BB04F',
    width: 300,
    height: 40,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#980058',
    textAlign: 'center',
    marginBottom: 10,
},
  submit: {
    backgroundColor: '#8BB04F',
    padding: 10,
    width: 150,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  submitText: {
    color: '#290A15',
    fontSize: 18,
    fontFamily: 'Afacad-Regular',
  },
});
