import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');

  function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        return false;
    }
    return true;
}

  const handleUpdatePassword = async () => {
    if (!isValidPassword(password)) {
      alert('Password must be at least 6 characters long, includes an uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        alert('Error updating password: ' + error.message);
        return;
      }

      alert('Password updated successfully!');
      router.push('/'); // Redirect to sign-in page
    } catch (error: any) {
      console.error(error.message);
      alert('Error updating password: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text></Text>
      <Text style={styles.header}>Update Password</Text>
      <TextInput
        placeholder="New Password"
        style={styles.input}
        placeholderTextColor="#8BB04F"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity style={styles.submit} onPress={handleUpdatePassword}>
        <Text style={styles.submitText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#290A15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    color: '#8BB04F',
    marginBottom: 20,
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
  submit: {
    backgroundColor: '#8BB04F',
    padding: 10,
    width: 150,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  submitText: {
    color: '#290A15',
    fontSize: 18,
  },
});