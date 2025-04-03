import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import {useFonts} from 'expo-font';
import {useRouter} from 'expo-router';
import { AuthService, PurchaseHistoryService } from '../../lib/supabase_crud';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 

export default function HomeScreen() {
  const router = useRouter();
  const getRandomColor = () => {
    const colors = ['#8BB04F', '#980058'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecentPurchases = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          const purchases = await PurchaseHistoryService.getUserPurchases(user.id);
          setRecentPurchases(purchases.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };
    
    fetchRecentPurchases();
  }, []);

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      alert('Sign-out successful!');
      router.push('/');
    } catch (error: any) {
      alert('Error signing out: ' + error.message);
    }
  };

  const formatDate = (dateInput: any) => {
    if (!dateInput) {
      console.warn('Empty date input');
      return 'No date';
    }

    if (typeof dateInput === 'string') {
      let date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      }

      if (dateInput.includes('/')) {
        const [month, day, year] = dateInput.split('/');
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
    }
    
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }

    console.warn('Unrecognized date format:', dateInput);
    return 'Invalid date';
  };

  const handlePurchasePress = () => {
    router.push('./budget');
  };

  const budgetAmount = 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>MAMMON</Text>
      </View>
      
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetText}>Remaining Budget:</Text>
        <Text style={styles.budgetAmount}>${budgetAmount}</Text>
      </View>
      
      <ScrollView style={styles.purchaseScrollContainer}>
        <Text style={styles.purchaseText}>Recent Purchases:</Text>
        {recentPurchases.map((purchase, index) => {
          const backgroundColor = getRandomColor();
          const dateValue = purchase.purchasedate || purchase.purchase_date;
          
          return (
            <TouchableOpacity key={index} onPress={handlePurchasePress}>
              <View style={[styles.purchaseItem, { backgroundColor }]}>
                <View style={styles.purchaseItemContent}>
                  <View style={styles.purchaseTextContainer}>
                    <Text style={styles.itemDescription}>
                      {purchase.description}
                    </Text>
                    <Text style={styles.itemDate}>
                      {formatDate(dateValue)}
                    </Text>
                  </View>
                  <Text style={styles.itemAmount}>
                    ${purchase.expense.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/addExpense')}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
    fontFamily: 'Afacad-Regular'
  },
  budgetAmount: {
    color: '#FFCC00',
    fontSize: 85,
    fontFamily: 'Afacad-Regular'
  },
  purchaseScrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  purchaseText: {
    color: '#8BB04F',
    fontSize: 25,
    fontFamily: 'Afacad-Regular',
    marginBottom: 15
  },
  purchaseItem: {
    backgroundColor: '#8BB04F',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  purchaseItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseTextContainer: {
    flex: 1,
  },
  itemDescription: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Afacad-Bold',
    marginBottom: 5,
  },
  itemDate: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Afacad-Regular',
  },
  itemAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Afacad-Bold',
    marginLeft: 10,
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
  bottomButtonsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#980058',
    padding: 12,
    width: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 25,
    fontFamily: 'Afacad-Regular'
  },
  signOutButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 10,
  },
  signOutText: {
    color: '#8BB04F',
    fontSize: 18,
    fontFamily: 'Afacad-Regular'
  }
});