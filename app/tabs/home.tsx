import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import {useFonts} from 'expo-font';
import {useRouter} from 'expo-router'

export default function HomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });

  const budgetAmount = 0;
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>Mammon</Text>
      </View>
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetText}>Remaining Budget:</Text>
        <Text style={styles.budgetAmount}>${budgetAmount}</Text>
      </View>
      <View style={styles.purchaseContainer}>
        <Text style={styles.purchaseText}>Purchase History:</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/addExpense')}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#290A15',
  },
  budgetContainer: {
    alignItems: 'center',
    paddingTop: 50,
    padding: 20,
    borderRadius: 10,
  },
  budgetText: {
    color: '#8BB04F',
    fontSize: 25,
    marginBottom: 10,
    fontFamily: 'AFACAD-Regular'
  },
  budgetAmount: {
    color: '#FFCC00',
    fontSize: 85,
    fontFamily: 'AFACAD-Regular'
  },
  purchaseContainer: {
    paddingTop: 40,
    padding: 20,
    borderRadius: 10,
    minHeight: 300, 
  },
  purchaseText: {
    color: '#8BB04F',
    fontSize: 25,
    fontFamily: 'AFACAD-Regular'
  },
  purchaseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#8BB04F',
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logo:{
    alignItems: 'center',
    paddingTop: 75,
  },
  logoText: {
    color: '#8BB04F',
    fontSize: 50,
    fontFamily: 'Megrim-Regular',
    transform: [{ scaleY: 1.25 }]
  },
  buttonContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#980058',
    padding: 8,
    width: 175,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 25,
    fontFamily: 'AFACAD-Regular'
  }


});