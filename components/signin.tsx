import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { supabase } from '../lib/supabase'



export default function SignIn() {
  const router = useRouter();
  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../assets/fonts/Megrim-Regular.ttf'),
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  

  function isValid(email: string, password: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
       if (!emailRegex.test(email) || !passwordRegex.test(password)){
          return false;
       }
      return true;
  }



  const handleSignIn = async () => {
    setLoading(true);
    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const {error} = await supabase.auth.signInWithPassword({email, password});
      if (error){
        alert('Error signing in: ' + error.message);
      }
      else{
      alert('Sign-in successful!');
      router.push('/tabs/home'); }
=======
=======
>>>>>>> Stashed changes
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(), 
            password
        });
<<<<<<< Updated upstream
=======

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                alert('Incorrect email or password');
            } else {
                alert('Error: ' + error.message);
            }
        } else {
            router.push('/tabs/home');
        }
    } catch (error: any) {
        alert('Unexpected error: ' + error.message);
    } finally {
        setLoading(false);
    }
};
>>>>>>> Stashed changes

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                alert('Incorrect email or password');
            } else {
                alert('Error: ' + error.message);
            }
        } else {
            router.push('/tabs/home');
        }
>>>>>>> Stashed changes
    } catch (error: any) {
        alert('Unexpected error: ' + error.message);
    } finally {
        setLoading(false);
    }
};

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.circle1}></View>
        <Text style={styles.header}>MAMMON</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={'#8BB04F'}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={'#8BB04F'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => (handleSignIn)}
        >
          <Text style={styles.buttonText} >Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to Mammon?</Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/signIn/signUp')}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText} onPress={() => router.push('/signIn/passwordRecovery')}>Can't access your account?</Text>
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
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 40,
    color: '#8BB04F',
    borderColor: '#980058',
    borderWidth: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 15,
    width: 300,
    alignContent: 'center',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#8BB04F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: 150,
    alignSelf: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#290A15',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#8BB04F',
  },
  linkButton: {
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#8BB04F',
  },
  linkText: {
    color: '#8BB04F',
  },
  header: {
    color: '#8BB04F',
    fontSize: 90,
    fontFamily: 'Megrim-Regular',
    textAlign: 'center',
    marginBottom: 30,

  },
  circle1: {
    position: 'absolute',
    top: 0,
    right: 160,
    width: 100,
    height: 100,
    backgroundColor: '#FFCC00',
    borderRadius: 100,
  }
});
