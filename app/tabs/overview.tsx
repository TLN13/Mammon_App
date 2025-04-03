import { Calendar } from 'react-native-calendars';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { PurchaseHistoryService, AuthService, UserService } from '../../lib/supabase_crud';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import { Dimensions } from 'react-native';

type MarkedDatesType = Record<string, { marked: boolean; dotColor: string }>;

export default function OverviewScreen() {
  const [markedDates, setMarkedDates] = useState<MarkedDatesType>({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [budget, setBudget] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [loading, setLoading] = useState(true);
  const [isMonth, setIsMonth] = useState(true);
  const [isWeek, setIsWeek] = useState(false);
  const [isChart, setIsChart] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // week starts on Monday
  const [weekDailyTotals, setWeekDailyTotals] = useState<Record<string, number>>({});
  const [chartType, setChartType] = useState('pie'); // Default to pie chart
  const [timeRange, setTimeRange] = useState('month'); // Default to month
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);

  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });

  // Navigation for week view
  const handleWeekNavigation = (direction: 'previous' | 'next') => {
    setCurrentWeekStart((prev) =>
      direction === 'previous' ? addWeeks(prev, -1) : addWeeks(prev, 1)
    );
  };

  // Generates an array of 7 dates for the current week (formatted as MM/dd/yyyy)
  const generateWeekDays = () => {
    return Array.from({ length: 7 }).map((_, i) =>
      format(addDays(currentWeekStart, i), 'MM/dd/yyyy')
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        if (isMonth) {
          // For month view, fetch all purchases (assumed to be in ISO format, e.g., "2023-05-12")
          const purchases = await PurchaseHistoryService.getUserPurchases(user.id);
          // For the calendar, use the ISO date format (YYYY-MM-DD)
          const formattedDates: MarkedDatesType = {};
          let monthTotal = 0;
          purchases.forEach((purchase) => {
            const dateISO = purchase.purchasedate; // from CRUD, ensure this is in YYYY-MM-DD
            formattedDates[dateISO] = { marked: true, dotColor: '#FFBB00' };
            monthTotal += purchase.expense;
          });
          setMarkedDates(formattedDates);
          setTotalSpent(monthTotal);
          // Calculate monthly average as total divided by number of days in current month.
          const [year, month] = currentMonth.split('-');
          const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
          setMonthlyAverage(monthTotal / daysInMonth);

          // Fetch user budget and calculate progress.
          const profile = await UserService.getUserProfile(user.id);
          const userBudget = profile?.budget || 0;
          setBudget(userBudget);
          const progress = userBudget > 0 ? Math.min((monthTotal / userBudget) * 100, 100) : 0;
          setProgressPercentage(progress);
        } else if (isWeek) {
          // For week view, determine the week boundaries.
          const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
          const weekEnd = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
          // Use a CRUD method to fetch purchases by date range.
          const purchases = await PurchaseHistoryService.getUserPurchasesByDateRange(
            user.id,
            weekStart,
            weekEnd
          );
          // Build daily totals using the desired format (MM/dd/yyyy).
          const dailyTotals: Record<string, number> = {};
          let weekTotal = 0;
          purchases.forEach((purchase) => {
            // Convert purchase date to a Date and reformat it.
            const purchaseDate = new Date(purchase.purchasedate);
            const formattedDate = format(purchaseDate, 'MM/dd/yyyy');
            dailyTotals[formattedDate] = (dailyTotals[formattedDate] || 0) + purchase.expense;
            weekTotal += purchase.expense;
          });
          setWeekDailyTotals(dailyTotals);
          // Compute weekly average as total for the week divided by 7.
          setWeeklyAverage(weekTotal / 7);
          // For week view, you might also want to update totalSpent if desired.
          setTotalSpent(weekTotal);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentWeekStart, isMonth, isWeek]);

  if (!fontsLoaded) return <View />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mammon}>MAMMON</Text>
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => {
              setIsMonth(true);
              setIsWeek(false);
              setIsChart(false);
            }}
          >
            <Text style={styles.navItemText}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => {
              setIsMonth(false);
              setIsWeek(true);
              setIsChart(false);
            }}
          >
            <Text style={styles.navItemText}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => {
              setIsMonth(false);
              setIsWeek(false);
              setIsChart(true);
            }}
          >
            <Text style={styles.navItemText}>Chart</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        {isMonth && (
          <View>
            <Calendar
              style={styles.calendar}
              markedDates={markedDates}
              onMonthChange={(date: { dateString: string }) =>
                setCurrentMonth(date.dateString.substring(0, 7))
              }
              theme={{
                backgroundColor: '#230A15',
                calendarBackground: '#230A15',
                textSectionTitleColor: '#8BB04F',
                selectedDayBackgroundColor: '#980058',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#FFBB00',
                dayTextColor: '#8BB04F',
                arrowColor: '#8BB04F',
                monthTextColor: '#8BB04F',
                textDayFontFamily: 'Afacad-Regular',
                textMonthFontFamily: 'Afacad-Regular',
                textDayHeaderFontFamily: 'Afacad-Regular',
              }}
            />
            <View style={styles.info}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Spent</Text>
                <Text style={styles.infoValue}>${totalSpent.toFixed(2)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Monthly Average</Text>
                <Text style={styles.infoValue}>${monthlyAverage.toFixed(2)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Budget Progress</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                </View>
                <Text style={styles.infoValue}>
                  ${totalSpent.toFixed(2)} / ${budget.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isWeek && (
          <View style={styles.weekView}>
            <View style={styles.weekNavigation}>
              <TouchableOpacity onPress={() => handleWeekNavigation('previous')}>
                <MaterialIcons name="chevron-left" size={24} color="#8BB04F" />
              </TouchableOpacity>
              <Text style={styles.weekTitle}>
                {format(currentWeekStart, 'MMM d, yyyy')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </Text>
              <TouchableOpacity onPress={() => handleWeekNavigation('next')}>
                <MaterialIcons name="chevron-right" size={24} color="#8BB04F" />
              </TouchableOpacity>
            </View>
              {generateWeekDays().map((dateString) => {
                const dayTotal = weekDailyTotals[dateString] || 0;
                return (
                  <View key={dateString} style={styles.weekDayItem}>
                    <Text style={styles.weekDayText}>{dateString}</Text>
                    <Text style={styles.weekDayAmount}>${dayTotal.toFixed(2)}</Text>
                  </View>
                );
              })}
              <View style={styles.info}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Spent</Text>
                  <Text style={styles.infoValue}>${totalSpent.toFixed(2)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Weekly Average</Text>
                  <Text style={styles.infoValue}>${weeklyAverage.toFixed(2)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Budget Progress</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.infoValue}>
                    ${totalSpent.toFixed(2)} / ${budget.toFixed(2)}
                  </Text>
                </View>
              </View>
          </View>
        )}

        {isChart && (
          <View style={styles.chartView}>
            <Text style={{ color: '#8BB04F', textAlign: 'center' }}>Chart view coming soon.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  purchaseScrollContainer: {
    
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#230A15',
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5
  },
  mammon: {
    color: '#8BB04F',
    fontFamily: 'Megrim-Regular',
    fontSize: 50,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    width: '100%',
    backgroundColor: '#980058',
    padding: 10,
  },
  navItems: {
    flexDirection: 'row',
    padding: 5,
  },
  navItemText: {
    fontFamily: 'Afacad-Regular',
    color: '#8BB04F',
  },
  main: {
    width: '90%',
    marginTop: 175,
  },
  calendar: {
    height: 375,
    borderColor: '#980058',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  info: {
    marginTop: 10,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#980058',
    borderRadius: 10,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    fontFamily: 'Afacad-Regular',
    color: '#8BB04F',
    fontSize: 16,
  },
  infoValue: {
    fontFamily: 'Afacad-Regular',
    color: '#FFBB00',
    fontSize: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#230A15',
    borderRadius: 5,
    marginVertical: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8BB04F',
    borderRadius: 5,
  },
  weekView: {
    width: '100%',
    marginTop: 20,
    paddingBottom: 90,
  },
  weekNavigation: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 70,
  },
  weekTitle: {
    color: '#8BB04F',
    fontFamily: 'Afacad-Regular',
    fontSize: 16,
  },
  weekDayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#230A15',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#980058'
  },
  weekDayText: {
    color: '#8BB04F',
    fontFamily: 'Afacad-Regular',
    fontSize: 14,
  },
  weekDayAmount: {
    color: '#FFBB00',
    fontFamily: 'Afacad-Regular',
    fontSize: 14,
    fontWeight: '600',
  },
  chartView:{

  },
});

