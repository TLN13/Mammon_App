import { Slot } from 'expo-router';

const linking = {
  prefixes: ['mammon://', 'http://localhost:8081'],
  config: {
    screens: {
      'updatePassword': 'updatePassword',
      // add additional screen mappings here
    },
  },
};

export default function RootLayout() {
  return <Slot />;
}