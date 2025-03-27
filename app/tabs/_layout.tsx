import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8BB04F',  
        tabBarInactiveTintColor: '#ffffff',   
        tabBarLabelStyle: {
          fontSize: 13,                   
          marginBottom: 10,                 
        },
        tabBarIconStyle: {
          marginTop: 8,                    
        },
        tabBarStyle: {
          backgroundColor: '#980058', 
          borderTopWidth: 0,      
          height: 75,                      
          paddingBottom: 10,               
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={32} color={color} />  // Bigger icon
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="wallet" size={25} color={color} />  // Bigger icon
          ),
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pie-chart" size={30} color={color} />  // Bigger icon
          ),
        }}
      />
    </Tabs>
  );
}