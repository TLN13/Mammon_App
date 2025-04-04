import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { PurchaseHistoryService } from '../../lib/supabase_crud';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { useRouter } from 'expo-router';
import {useFonts} from 'expo-font';

interface Purchase {
  purchase_id: string;
  description: string;
  expense: number;
  purchasedate: string;
}

interface GroupedPurchases {
  [key: string]: Purchase[];
}

export default function PurchaseHistoryScreen() {
  const router = useRouter();
  const [groupedPurchases, setGroupedPurchases] = useState<GroupedPurchases>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../../assets/fonts/Afacad-Bold.ttf'),
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        const purchases = await PurchaseHistoryService.getUserPurchases(user.id);
        const grouped = groupPurchasesByMonth(purchases || []);
        setGroupedPurchases(grouped);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setError(error instanceof Error ? error.message : 'Failed to load purchases');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const groupPurchasesByMonth = (purchases: Purchase[]): GroupedPurchases => {
    const grouped: GroupedPurchases = {};
    
    purchases.forEach(purchase => {
      const date = new Date(purchase.purchasedate);
      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      const monthYear = localDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(purchase);
    });
    
    return grouped;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    return localDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontFamily: 'Afacad-Regular' }}>Loading purchases...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#8BB04F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.keys(groupedPurchases).length === 0 ? (
          <Text style={styles.emptyText}>No purchases found</Text>
        ) : (
          Object.entries(groupedPurchases).map(([monthYear, purchases]) => (
            <View key={monthYear} style={styles.monthSection}>
              <Text style={styles.monthHeader}>{monthYear}</Text>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.dateHeader]}>Date</Text>
                <Text style={[styles.headerText, styles.descHeader]}>Description</Text>
                <Text style={[styles.headerText, styles.amountHeader]}>Amount</Text>
              </View>
              
              {/* Table Rows */}
              {purchases.map(purchase => (
                <View key={purchase.purchase_id} style={styles.tableRow}>
                  <Text style={styles.dateCell}>{formatDate(purchase.purchasedate)}</Text>
                  <Text style={styles.descCell}>{purchase.description}</Text>
                  <Text style={styles.amountCell}>${purchase.expense.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Go to Top Button */}
      <TouchableOpacity 
        style={styles.topButton} 
        onPress={scrollToTop}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-up" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#290A15',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      marginTop: 30,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
      fontFamily: 'Afacad-Bold',
      color: '#8BB04F',
    },
    headerSpacer: {
      width: 40, 
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 25,
      paddingBottom: 80,
    },
    monthSection: {
      marginBottom: 24,
      backgroundColor: '#980058',
      padding: 16,
      borderRadius: 10,
    },
    monthHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#8BB04F',
      fontFamily: 'Afacad-Bold',
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 8,
      marginBottom: 8,
    },
    headerText: {
      fontWeight: 'bold',
      color: '#8BB04F',
      fontFamily: 'Afacad-Bold',
    },
    dateHeader: {
      flex: 1.2,
    },
    descHeader: {
      flex: 2,
    },
    amountHeader: {
      flex: 0.8,
      textAlign: 'right',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ffffff',
    },
    dateCell: {
      flex: 1.2,
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
    },
    descCell: {
      flex: 2,
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Afacad-Regular',
    },
    amountCell: {
      flex: 0.8,
      textAlign: 'right',
      fontWeight: 'bold',
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 24,
      color: '#666',
      fontFamily: 'Afacad-Regular',
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 24,
      fontFamily: 'Afacad-Regular',
    },
    topButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: '#8BB04F',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
  });