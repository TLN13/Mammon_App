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
  const [budgetBalance, setBudgetBalance] = useState<number>(0);

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

  const fetchBudgetBalance = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (user) {
        // Get the current budget with all needed fields
        const { data: budgetData, error } = await supabase
          .from('budget')
          .select('budgetlimit, savingsgoal, setaside, payperiod_start, payperiod_end')
          .eq('user_id', user.id)
          .order('payperiod_start', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (budgetData && budgetData.length > 0) {
          const budget = budgetData[0];
          
          // Calculate expenses for this budget period
          const expenses = await PurchaseHistoryService.getUserPurchasesByDateRange(
            user.id, 
            budget.payperiod_start, 
            budget.payperiod_end
          );
          
          const totalExpenses = expenses.reduce((sum, p) => sum + p.expense, 0);
          
          const remaining = (budget.budgetlimit ?? 0) - 
                           (budget.savingsgoal ?? 0) - 
                           (budget.setaside ?? 0) - 
                           totalExpenses;
          
          setBudgetBalance(remaining);
        }
      }
    } catch (error) {
      console.error('Error fetching budget balance:', error);
    }
  };

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
  
    let date: Date;
  
    if (typeof dateInput === 'string') {
      if (dateInput.includes('T')) {
        date = new Date(dateInput.endsWith('Z') ? dateInput : dateInput + 'Z');
      } 
      else if (dateInput.includes('/')) {
        const parts = dateInput.split('/');
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        date = new Date(Date.UTC(year, month - 1, day));
      }
      // Try to parse as is
      else {
        date = new Date(dateInput);
      }
    } 
    // If it's already a Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    } 
    // Unrecognized format
    else {
      console.warn('Unrecognized date format:', dateInput);
      return 'Invalid date';
    }
  
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateInput);
      return 'Invalid date';
    }
  
    // Format without timezone conversion
    return date.toLocaleDateString('en-US', { 
      timeZone: 'UTC', // Important: treat as UTC to prevent shifting
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchBudgetBalance(),
        fetchRecentPurchases()
      ]);
    };
    
    fetchData();
  }, []);

  const handlePurchasePress = () => {
    router.push('../budget/purchase_history');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>MAMMON</Text>
      </View>
      
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetText}>Remaining Budget:</Text>
        <Text style={styles.budgetAmount}>${budgetBalance.toFixed(2)}</Text>
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