import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';


import { supabase } from '../../lib/supabase';
import { PurchaseHistoryService } from '../../lib/supabase_crud';

export default function BudgetScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  // State for loading and budget info
  const [loading, setLoading] = useState(true);
  const [currentBudget, setCurrentBudget] = useState<any>(null);
  const [previousBudget, setPreviousBudget] = useState<any>(null);

  // Load budgets when component mounts
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all budgets for user and sort newest first
        const { data: budgets, error } = await supabase
          .from('budget')
          .select('*')
          .eq('user_id', user.id)
          .order('payperiod_start', { ascending: false });

        if (error) throw error;

        const today = new Date().toISOString();

        // Determine current and previous budgets based on date
        const current = budgets.find(b => b.payperiod_start <= today && b.payperiod_end >= today);
        const previous = budgets.find(b => b.payperiod_end < today);

        // Fetch and attach expenses to current budget
        if (current) {
          const currentExpenses = await getTotalExpenses(user.id, current.payperiod_start, current.payperiod_end);
          setCurrentBudget({ ...current, expenses: currentExpenses });
        }

        // Fetch and attach expenses to previous budget
        if (previous) {
          const previousExpenses = await getTotalExpenses(user.id, previous.payperiod_start, previous.payperiod_end);
          setPreviousBudget({ ...previous, expenses: previousExpenses });
        }

      } catch (error) {
        console.error('Error loading budgets:', error);
      } finally {
        setLoading(false); // Done loading, hide spinner
      }
    };

    loadBudgets();
  }, []);

  // Calculate total expenses for a user during a specific period
  const getTotalExpenses = async (userId: string, start: string, end: string) => {
    const purchases = await PurchaseHistoryService.getUserPurchasesByDateRange(userId, start, end);
    return purchases.reduce((total, p) => total + p.expense, 0);
  };

  // Format dates like: "Apr 1, 2025 – Apr 30, 2025"
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
  };

  // Reusable UI component for displaying a budget card
  const renderBudgetCard = (title: string, budget: any) => {
    const remaining = (budget.budgetlimit ?? 0) - (budget.savingsgoal ?? 0) - (budget.setaside ?? 0) - (budget.expenses ?? 0);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>

        {/* Pay period shown inline */}
        <View style={styles.inlineRow}>
          <Text style={styles.label}>Period: </Text>
          <Text style={styles.value}>{formatDateRange(budget.payperiod_start, budget.payperiod_end)}</Text>
        </View>

        <Text style={styles.label}>Budget:</Text>
        <Text style={styles.value}>${budget.budgetlimit?.toFixed(2)}</Text>

        <Text style={styles.label}>Savings Goal:</Text>
        <Text style={styles.value}>${budget.savingsgoal?.toFixed(2)}</Text>

        <Text style={styles.label}>Remaining:</Text>
        <Text style={styles.value}>${remaining.toFixed(2)}</Text>
      </View>
    );
  };

  // Show loading spinner while fonts/data load
  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8BB04F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Conditionally render budget summaries */}
        {currentBudget && renderBudgetCard("Current Budget", currentBudget)}
        {previousBudget && renderBudgetCard("Previous Budget", previousBudget)}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/budget/editBudget')}>
          <Text style={styles.buttonText}>Edit Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/budget/newBudget')}>
          <Text style={styles.buttonText}>New Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/budget/purchase_history')}>
          <Text style={styles.buttonText}>View Purchase History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#290A15',
    paddingTop: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 50,
  },
  card: {
    backgroundColor: '#980058',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    color: '#8BB04F',
    fontFamily: 'Afacad-Bold',
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    color: '#8BB04F',
    fontFamily: 'Afacad-Regular',
    marginTop: 8,
  },
  value: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Afacad-Bold',
  },
  buttonSection: {
    padding: 20,
    paddingBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#980058',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: 'Afacad-Regular',
  },
});
