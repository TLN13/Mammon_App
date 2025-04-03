import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { PurchaseHistoryService, AuthService, PayPeriodService } from '../lib/supabase_crud';
import { supabase } from '../lib/supabase';

export default function AddExpenseScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
      'Afacad-Regular': require('../assets/fonts/Afacad-Regular.ttf'),
      'Afacad-Bold': require('../assets/fonts/Afacad-Bold.ttf'),
      'Megrim-Regular': require('../assets/fonts/Megrim-Regular.ttf'),
    });
    
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
   
    const categories = [
        { id: 'Bills', name: 'Bills/Utilities' },
        { id: 'Subscriptions', name: 'Subscriptions' },
        { id: 'Services', name: 'Services' },
        { id: 'Seisure', name: 'Leisure' },
        { id: 'Other', name: 'Other' }
    ];
    
    const isValidDate = (input: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(input);
    const isValidAmount = (input: string) => /^\d*\.?\d{0,2}$/.test(input);

    useEffect(() => {
        // Get the current user when component mounts
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (user) {
                    setUserId(user.id);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                Alert.alert('Error', 'Failed to get user session');
            }
        };
        
        fetchUser();
    }, []);

    const handleSubmit = async () => {
        if (!description || !amount || !date || !category) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
    
        if (!isValidDate(date)) {
            Alert.alert('Error', 'Please enter a valid date in MM/DD/YYYY format');
            return;
        }
    
        if (!isValidAmount(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount greater than 0');
            return;
        }
    
        if (!userId) {
            Alert.alert('Error', 'User not authenticated. Please sign in.');
            router.push('/sign-in');
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            // Get or create current pay period
            const payperiod_id = await PayPeriodService.getOrCreateCurrentPayPeriod(userId);
            
            // Convert date format
            const [month, day, year] = date.split('/');
            const purchasedate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            await PurchaseHistoryService.createPurchase(
                userId,
                payperiod_id, 
                purchasedate,
                parseFloat(amount),
                `${description} (${category})`
            );
    
            Alert.alert('Success', 'Expense added successfully');
            setDescription('');
            setAmount('');
            setDate('');
            setCategory('');
            router.push('/tabs/home');
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', 'Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Text style={styles.logoText}>MAMMON</Text>
            </View>
            <View style={styles.title}>
                <Text style={styles.titleText}>Add Expense</Text>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    {/* Description Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>What is it for?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Groceries, Netflix, Electricity bill"
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#888"
                        />
                    </View>
                    
                    {/* Amount Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={[
                                    styles.input, 
                                    styles.amountInput,
                                    amount && !isValidAmount(amount) && styles.invalidInput
                                ]}
                                placeholder="0.00"
                                value={amount}
                                onChangeText={(text) => {
                                    if (/^\d*\.?\d{0,2}$/.test(text)) {
                                        setAmount(text);
                                    }
                                }}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#888"
                            />
                        </View>
                        {amount && !isValidAmount(amount) && (
                            <Text style={styles.errorText}>Please enter a valid amount (e.g. 12.99)</Text>
                        )}
                    </View>
                    
                    {/* Date Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                date && !isValidDate(date) && styles.invalidInput
                            ]}
                            placeholder="MM/DD/YYYY"
                            value={date}
                            onChangeText={setDate}
                            keyboardType="numbers-and-punctuation"
                            placeholderTextColor="#888"
                        />
                        {date && !isValidDate(date) && (
                            <Text style={styles.errorText}>Please use MM/DD/YYYY format</Text>
                        )}
                    </View>
                    
                    {/* Category Selection */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoriesContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryButton,
                                        category === cat.id && styles.categoryButtonSelected
                                    ]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        category === cat.id && styles.categoryTextSelected
                                    ]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
                
                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.submitButton,
                            isSubmitting && styles.disabledButton
                        ]} 
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => router.push('/tabs/home')}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#290A15',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    logo: {
        alignItems: 'center',
        paddingTop: 75,
    },
    logoText: {
        color: '#8BB04F',
        fontSize: 50,
        fontFamily: 'Megrim-Regular',
        transform: [{ scaleY: 1.25 }]
    },
    title: {
        alignItems: 'center',
        paddingTop: 20,
        borderColor: '#980058',
        borderBottomWidth: 3,
        alignSelf: 'center',
        width: '65%',
        marginBottom: 20,
    },
    titleText: {
        color: '#8BB04F',
        fontFamily: 'Afacad-Bold',
        fontSize: 40,
    },
    formContainer: {
        backgroundColor: '#980058',
        borderRadius: 15,
        marginHorizontal: 10,
        paddingHorizontal: 15,
        paddingVertical: 20,
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        color: '#8BB04F',
        fontSize: 18,
        fontFamily: 'Afacad-Bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#3A1A25',
        color: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        fontFamily: 'Afacad-Regular',
    },
    invalidInput: {
        borderColor: '#FF0000',
        borderWidth: 1,
    },
    errorText: {
        color: '#FF0000',
        fontSize: 14,
        marginTop: 5,
        fontFamily: 'Afacad-Regular',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        color: '#FFFFFF',
        fontSize: 20,
        marginRight: 10,
        fontFamily: 'Afacad-Bold',
    },
    amountInput: {
        flex: 1,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryButton: {
        backgroundColor: '#3A1A25',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        width: '48%',
        alignItems: 'center',
    },
    categoryButtonSelected: {
        backgroundColor: '#8BB04F',
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Afacad-Regular',
    },
    categoryTextSelected: {
        color: '#290A15',
        fontFamily: 'Afacad-Bold',
    },
    buttonsContainer: {
        marginHorizontal: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8BB04F',
        padding: 8,
        width: 175,
        borderRadius: 10,
        marginBottom: 15,
    },
    cancelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#980058',
        padding: 8,
        width: 175,
        borderRadius: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'AFACAD-Regular'
    }
});