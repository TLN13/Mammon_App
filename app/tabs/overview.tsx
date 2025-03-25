import { StyleSheet, Text, View } from 'react-native';

export default function OverviewScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome to Overview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});