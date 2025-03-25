import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View>
        <TextInput placeholder="Username"/>
        <TextInput placeholder="Password" />
        <TouchableOpacity >
          <Text>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text >New to Mammon?</Text>
        <Button title="Sign Up" onPress={() => {}} />
        <Button title="Can't access your account?" onPress={() => {}} />
      </View>
      <View>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Text>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
});