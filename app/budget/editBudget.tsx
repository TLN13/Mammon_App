import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function EditBudgetScreen() {
  const router = useRouter();
  const { payperiod_id } = useLocalSearchParams();
  
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetlimit, setBudgetlimit] = useState('');
  const [savingsgoal, setSavingsgoal] = useState('');
  const [setaside, setSetaside] = useState('');
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({
    dates: '',
    budgetlimit: '',
    savingsgoal: '',
    setaside: '',
  });

  // Load existing budget data
  useEffect(() => {
    if (!fontsLoaded || !payperiod_id) return;

    const loadBudget = async () => {
      try {
        const { data, error } = await supabase
          .from('budget')
          .select('*')
          .eq('payperiod_id', payperiod_id) 
          .single();

        if (error) throw error;
        if (!data) throw new Error('Budget not found');

        const formatDate = (isoDate: string) => {
          const date = new Date(isoDate);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };

        setStartDate(formatDate(data.payperiod_start));
        setEndDate(formatDate(data.payperiod_end));
        setBudgetlimit(String(data.budgetlimit));
        setSavingsgoal(String(data.savingsgoal));
        setSetaside(String(data.setaside));

      } catch (err) {
        console.error('Error loading budget:', err);
        Alert.alert('Error', 'Failed to load budget data');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
  }, [fontsLoaded, payperiod_id]);
  // Check MM/DD/YYYY format
  const isValidDateFormat = (date: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(date);

  // Convert date string to ISO (YYYY-MM-DD)
  const parseDate = (input: string) => {
    const [month, day, year] = input.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { dates: '', budgetlimit: '', savingsgoal: '', setaside: '' };

    // Date validation
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

    // Numeric validation
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
    if (!payperiod_id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const payperiod_start = parseDate(startDate).toISOString();
      const payperiod_end = parseDate(endDate).toISOString();

      const { error } = await supabase
        .from('budget')
        .update({
          payperiod_start,
          payperiod_end,
          budgetlimit: parseFloat(budgetlimit),
          savingsgoal: parseFloat(savingsgoal),
          setaside: parseFloat(setaside),
        })
        .eq('payperiod_id', payperiod_id); 

      if (error) throw error;

      Alert.alert('Success', 'Budget updated successfully.');
      router.push('/tabs/budget');
    } catch (err) {
      console.error(err);
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
      <Text style={styles.title}>Edit Budget</Text>

      {/* Start Date */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pay Period Start (MM/DD/YYYY)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="MM/DD/YYYY"
          keyboardType="numbers-and-punctuation"
          placeholderTextColor="#888"
        />
      </View>

      {/* End Date */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pay Period End (MM/DD/YYYY)</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="MM/DD/YYYY"
          keyboardType="numbers-and-punctuation"
          placeholderTextColor="#888"
        />
        {errors.dates ? <Text style={styles.error}>{errors.dates}</Text> : null}
      </View>

      {/* Budget Limit */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Limit</Text>
        <TextInput
          style={styles.input}
          keyboardType="numbers-and-punctuation"
          value={budgetlimit}
          onChangeText={setBudgetlimit}
        />
        {errors.budgetlimit ? <Text style={styles.error}>{errors.budgetlimit}</Text> : null}
      </View>

      {/* Savings Goal */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Savings Goal</Text>
        <TextInput
          style={styles.input}
          keyboardType="numbers-and-punctuation"
          value={savingsgoal}
          onChangeText={setSavingsgoal}
        />
        {errors.savingsgoal ? <Text style={styles.error}>{errors.savingsgoal}</Text> : null}
      </View>

      {/* Set Aside */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Set Aside</Text>
        <TextInput
          style={styles.input}
          keyboardType="numbers-and-punctuation"
          value={setaside}
          onChangeText={setSetaside}
        />
        {errors.setaside ? <Text style={styles.error}>{errors.setaside}</Text> : null}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Update Budget</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/tabs/budget')}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styling (same as before)
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