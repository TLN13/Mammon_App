import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { PayPeriodService } from '../../lib/supabase_crud';

export default function NewBudgetScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetlimit, setBudgetlimit] = useState('');
  const [savingsgoal, setSavingsgoal] = useState('');
  const [setaside, setSetaside] = useState('');

  const [errors, setErrors] = useState({
    dates: '',
    budgetlimit: '',
    savingsgoal: '',
    setaside: '',
  });

  const isValidDateFormat = (date: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  const parseDate = (input: string) => {
    const [month, day, year] = input.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { dates: '', budgetlimit: '', savingsgoal: '', setaside: '' };

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      newErrors.dates = 'Dates must be in MM/DD/YYYY format.';
      isValid = false;
    } else {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      if (start >= end) {
        newErrors.dates = 'Start date must be before end date.';
        isValid = false;
      }
    }

    const numLimit = parseFloat(budgetlimit);
    const numGoal = parseFloat(savingsgoal);
    const numSetaside = parseFloat(setaside);

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

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      await PayPeriodService.createBudget({
        user_id: user.id,
        payperiod_start: parseDate(startDate).toISOString(),
        payperiod_end: parseDate(endDate).toISOString(),
        budgetlimit: parseFloat(budgetlimit),
        savingsgoal: parseFloat(savingsgoal),
        setaside: parseFloat(setaside),
      });

      Alert.alert('Success', 'New budget created.');
      router.push('/tabs/budget');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create budget.');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Budget</Text>

      {/* Date + Input Fields */}
      {/* ... same as before, not repeated for brevity ... */}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Budget</Text>
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
    fontSize: 14,
    fontFamily: 'Afacad-Regular',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#8BB04F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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