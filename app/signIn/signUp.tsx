import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import {useRouter} from 'expo-router';
import { AuthService } from '../../lib/supabase_crud';

export default function SignUp() {
    const router = useRouter();
    let [fontsLoaded] = useFonts({
        'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
        'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
    });

    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');

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

function isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
        return false;
    }
    return true;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(email)){
        return false;
     }

    return true;
}

function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        return false;
    }
    return true;
}



async function handleSignUp(fName: string, lName: string, email: string, password: string, dob: string) {
  if (!isValidName(fName) || !isValidName(lName) || !isValidEmail(email) || !isValidPassword(password) || !isValidDateOfBirth(dob)) {
    alert('All fields are required and must be valid.');
    return;
  }

  try {
    const data = await AuthService.signUpWithEmail(email, password, fName, lName, dob);
    alert('Sign-up successful! Please check your email for verification.');
    router.push('./success');
  } catch (error: any) {
    alert('Error signing up: ' + error.message);
  }
}

return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
            <Text style={styles.back} >Back</Text>
        </TouchableOpacity>
            <View style={styles.headerContainer}>
            
            <Text style={styles.header}>MAMMON</Text>
            </View>
            <View style={styles.upperContainer}>
                    
                    <TextInput
                    style={styles.input}
                    placeholder='First Name'
                    placeholderTextColor={'#8BB04F'}
                    onChangeText={(text) => setFName(text)}
                    onEndEditing={(e) => {
                    const eName = e.nativeEvent.text;
                    if (!isValidName(eName)) {
                            alert('Invalid name. Name must contain only letters.');
                    }
                    else {
                            setFName(eName);
                    }
                    }}
                    />
                    <TextInput
                    style={styles.input}
                    placeholder='Last Name'
                    placeholderTextColor={'#8BB04F'}
                    onChangeText={(text) => setLName(text)}
                    onEndEditing={(e) => {
                    const eName = e.nativeEvent.text;
                    if (!isValidName(eName)) {
                            alert('Invalid name. Name must contain only letters.');
                    }
                    else {
                            setLName(eName);
                    }
                    }}
                    />
                    <TextInput 
                    placeholder='E-mail' 
                    style={styles.input} 
                    placeholderTextColor='#8BB04F'
                    onChangeText={(text) => setEmail(text)}
                    onEndEditing={(e) => {
                    const eEmail = e.nativeEvent.text;
                    if (!isValidEmail(eEmail)) {
                            alert('Invalid email address.');
                    }
                    else {
                            setEmail(eEmail);
                    }
                    }}
                    />
                    <TextInput 
                    placeholder='Password' 
                    style={styles.input} 
                    placeholderTextColor='#8BB04F'
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                    onEndEditing={(e) => {
                    const ePassword = e.nativeEvent.text;
                    if (!isValidPassword(ePassword)) {
                            alert('Invalid password. Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
                    }
                    else {
                            setPassword(ePassword);
                    }
                    }}
                    />
                    <TextInput 
                    placeholder='Date of Birth (YYYY-MM-DD)'
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
                
                        <TouchableOpacity style={styles.signUp} 
                        onPress={() => {handleSignUp(fName, lName, email, password, dob)}}
                        >
                            <Text style={styles.text}>Sign Up</Text>
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
    headerContainer: {
        position: 'absolute',
        top: 50,
        width: '100%',
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
        top: 60,
        left: 10,
      },
    header: {
        fontFamily: 'Megrim-Regular',
        fontSize: 50,
        color: '#8BB04F',
        textAlign: 'center',
    },
    upperContainer: {
        position: 'absolute',
        top: 225,
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
    lowerContainer: {
        position: 'absolute',
        bottom: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        color: '#8BB04F',
        fontFamily: 'Afacad-Regular',
    },
    checkbox: {
        backgroundColor: '#8BB04F',
        width: 20,
        height: 20,
        borderRadius: 10,
        textAlign: 'center',
        marginLeft: 10,
    },
    signUp: {
        backgroundColor: '#8BB04F',
        padding: 10,
        width: 150,
        borderRadius: 5,
        alignSelf: 'center'
    },
    text:{
        color: '#290A15',
        textAlign: 'center',
        fontFamily: 'Afacad-Regular',
    },
});

