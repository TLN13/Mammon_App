import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import {useRouter} from 'expo-router';

export default function Success(){
    const router = useRouter();
    let [fontsLoaded] = useFonts({
        'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
        'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
    });

    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.mammon}>MAMMON</Text>
          </View>
          <View style={styles.messageContainer}>
            <View style={styles.coin}>
              <Text style={styles.coinM}>M</Text>
            </View>
            <View>
              <Text style={styles.success}>Success!</Text>
              <Text style={styles.text}>You will be required to log in to access your account.</Text>
            </View>
            <TouchableOpacity style={styles.submit} onPress={() => router.push('/')}>
              <Text style={styles.submitText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#230A15',
        width: '100%'
    },
    header:{
        position: 'absolute',
        top: 50,
        
    },
    messageContainer:{
        position: 'absolute',
        top: 300,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },    
    coin:{
        width:100,
        height: 100,
        backgroundColor: '#FFBB00',
        borderRadius: 100,
        borderWidth: 5,
        borderColor: '#FFCC00'
    },
    coinM:{
        fontSize: 82,
        fontFamily: 'Megrim-Regular',
        color: '#8BB04F',
        textAlign: 'center',
        textShadowColor: '#230A15',
        textShadowRadius: 2
    },
    mammon:{
        color: '#8BB04F',
        fontFamily: 'Megrim-Regular',
        fontSize: 50
    },
    success:{
        color: '#8BB04F',
        fontSize: 24,
        fontFamily: 'Afacad-Regular',
        marginBottom: 10,
    },
    text:{
        color: '#8BB04F',
        fontSize: 18,
        marginBottom: 30,
        fontFamily: 'Afacad-Regular'
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
        color: '#230A15',
    },
})