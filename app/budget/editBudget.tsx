import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function EditBudgetScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  // Form and state variables
  const [loading, setLoading] = useState(true);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [budgetlimit, setBudgetlimit] = useState('');
  const [savingsgoal, setSavingsgoal] = useState('');
  const [setaside, setSetaside] = useState('');

  // Error messages for each field
  const [errors, setErrors] = useState({
    budgetlimit: '',
    savingsgoal: '',
    setaside: '',
  });

  // Fetch the current active budget when screen mounts
  useEffect(() => {
    const fetchCurrentBudget = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString();

        // Fetch current pay period where today falls between start and end
        const { data: budget, error } = await supabase
          .from('budget')
          .select('*')
          .eq('user_id', user.id)
          .lte('payperiod_start', today)
          .gte('payperiod_end', today)
          .single();

        if (error) throw error;

        // Set form values based on the budget
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

  // Input validation logic for all fields
  const validateInputs = useCallback(() => {
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
  }, [budgetlimit, savingsgoal, setaside]);

  // Run validation when any of the form values change
  useEffect(() => {
    validateInputs();
  }, [validateInputs]);

  // Save changes to Supabase if inputs are valid
  const handleUpdate = async () => {
    if (!budgetId) return;
    if (!validateInputs()) return;

    const updated = {
      budgetlimit: parseFloat(budgetlimit),
      savingsgoal: parseFloat(savingsgoal),
      setaside: parseFloat(setaside),
    };

    const { error } = await supabase
      .from('budget')
      .update(updated)
      .eq('payperiod_id', budgetId);

    if (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update budget.');
    } else {
      Alert.alert('Success', 'Budget updated successfully.');
      router.push('/tabs/budget'); // Navigate back to summary
    }
  };

  if (!fontsLoaded || loading) {
    // Show a spinner while fonts or data are loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8BB04F" />
      </View>
    );
  }

  const isFormValid = 
  !errors.budgetlimit && 
  !errors.savingsgoal && 
  !errors.setaside &&
  budgetlimit && 
  savingsgoal && 
  setaside;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Current Budget</Text>

      {/* Budget Limit Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Limit</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={budgetlimit}
          onChangeText={setBudgetlimit}
        />
        {errors.budgetlimit ? <Text style={styles.error}>{errors.budgetlimit}</Text> : null}
      </View>

      {/* Savings Goal Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Savings Goal</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={savingsgoal}
          onChangeText={setSavingsgoal}
        />
        {errors.savingsgoal ? <Text style={styles.error}>{errors.savingsgoal}</Text> : null}
      </View>

      {/* Set Aside Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Set Aside</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={setaside}
          onChangeText={setSetaside}
        />
        {errors.setaside ? <Text style={styles.error}>{errors.setaside}</Text> : null}
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
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

