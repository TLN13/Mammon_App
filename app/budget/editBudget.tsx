import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { PayPeriodService } from '../../lib/supabase_crud';

export default function EditBudgetScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  const [loading, setLoading] = useState(true);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [budgetlimit, setBudgetlimit] = useState('');
  const [savingsgoal, setSavingsgoal] = useState('');
  const [setaside, setSetaside] = useState('');

  const [errors, setErrors] = useState({
    budgetlimit: '',
    savingsgoal: '',
    setaside: '',
  });

  useEffect(() => {
    const fetchCurrentBudget = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString();

        const { data: budget, error } = await supabase
          .from('budget')
          .select('*')
          .eq('user_id', user.id)
          .lte('payperiod_start', today)
          .gte('payperiod_end', today)
          .single();

        if (error) throw error;

        setBudgetId(budget.payperiod_id);
        setBudgetlimit(budget.budgetlimit.toString());
        setSavingsgoal(budget.savingsgoal.toString());
        setSetaside(budget.setaside.toString());
      } catch (error) {
        console.error('Failed to fetch budget:', error);
        Alert.alert('Error', 'Could not load current budget.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBudget();
  }, []);

  const validateInputs = () => {
    let isValid = true;
    const numLimit = parseFloat(budgetlimit);
    const numGoal = parseFloat(savingsgoal);
    const numSetaside = parseFloat(setaside);
    const newErrors = { budgetlimit: '', savingsgoal: '', setaside: '' };

    if (isNaN(numLimit) || numLimit <= 0) {
      newErrors.budgetlimit = 'Budget must be greater than 0';
      isValid = false;
    }

    if (isNaN(numGoal) || numGoal < 0 || numGoal > numLimit) {
      newErrors.savingsgoal = 'Savings goal must be ≥ 0 and ≤ budget';
      isValid = false;
    }

    if (isNaN(numSetaside) || numSetaside < 0 || numSetaside > numLimit - numGoal) {
      newErrors.setaside = 'Set aside must be ≥ 0 and ≤ budget - savings goal';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!budgetId) return;
    if (!validateInputs()) return;

    try {
      await PayPeriodService.updateBudget(budgetId, {
        budgetlimit: parseFloat(budgetlimit),
        savingsgoal: parseFloat(savingsgoal),
        setaside: parseFloat(setaside),
      });

      Alert.alert('Success', 'Budget updated.');
      router.push('/tabs/budget');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update budget.');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8BB04F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Current Budget</Text>

      {/* Input Fields */}
      {/* ... same as before ... */}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/tabs/budget')}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#290A15',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#8BB04F',
    fontFamily: 'Afacad-Bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#8BB04F',
    fontSize: 16,
    fontFamily: 'Afacad-Regular',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#3A1A25',
    color: '#ffffff',
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Afacad-Regular',
  },
  error: {
    color: '#FF0000',
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Afacad-Regular',
  },
  button: {
    backgroundColor: '#8BB04F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#290A15',
    fontSize: 20,
    fontFamily: 'Afacad-Bold',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Afacad-Regular',
  },
});
