import { Calendar } from 'react-native-calendars';
import { format, startOfWeek, addDays, addWeeks, parseISO, subMonths, subDays } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { PurchaseHistoryService, AuthService, UserService } from '../../lib/supabase_crud';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
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
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [barChartData, setBarChartData] = useState<{labels: string[], values: number[]}>({labels: [], values: []});
  const [lineChartData, setLineChartData] = useState<{labels: string[], values: number[]}>({labels: [], values: []});

  let [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../../assets/fonts/Afacad-Regular.ttf'),
    'Megrim-Regular': require('../../assets/fonts/Megrim-Regular.ttf'),
  });

  interface Purchase {
    purchasedate: string;
    expense: number;
    description: string;
  }
  
  interface DailyTotals {
    [formattedDate: string]: number;
  }

  interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }
  
  interface LineBarChartData {
    values: number[];
    labels: string[];
  }

  function generateLineChartData(monthlyPurchases: Purchase[]) {
    // Assume currentMonth is in format "YYYY-MM"
    const [yearStr, monthStr] = monthlyPurchases.length > 0 
      ? monthlyPurchases[0].purchasedate.split('-') 
      : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString()];
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    // Get number of days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const labels: string[] = [];
    const data: number[] = [];
    // Pre-compute daily totals (formatted as MM/dd/yyyy)
    const dailyTotals: DailyTotals = {};
    monthlyPurchases.forEach((p) => {
      // Convert purchasedate (ISO) to local date and format as MM/dd/yyyy
      const formatted = format(parseISO(p.purchasedate), 'MM/dd/yyyy');
      dailyTotals[formatted] = (dailyTotals[formatted] || 0) + p.expense;
    });
    // For each day in the month, fill in data (0 if no purchase)
    for (let d = 1; d <= daysInMonth; d++) {
      // Create date object
      const dateObj = new Date(year, month - 1, d);
      const formatted = format(dateObj, 'MM/dd/yyyy');
      labels.push(format(dateObj, 'd')); // Use day number as label, or full date if desired
      data.push(dailyTotals[formatted] || 0);
    }
    return { labels, data };
  }

  function toLocalDate(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  function generatePieChartData(monthlyPurchases: Purchase[]) {
    // Group purchases by category extracted from description.
    const categoryTotals: Record<string, number> = {};
    monthlyPurchases.forEach((p) => {
      // Example description: "Coffee (Personal)". Extract the text inside parentheses.
      const match = p.description.match(/\(([^)]+)\)/);
      const category = match ? match[1] : 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + p.expense;
    });
    // Prepare pie chart data – adjust fields as required by your PieChart component.
    const data = Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      population: categoryTotals[cat],
      color: `rgba(139, 176, 79, ${0.5 + index * 0.1})`,
      legendFontColor: '#8BB04F',
      legendFontSize: 12,
    }));
    return data;
  }

  function generateBarChartData(monthlyPurchases: Purchase[]) {
    // Split the month into 4 weeks. We use the day of the month to assign weeks:
    // Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-end.
    const weekSums = [0, 0, 0, 0];
    // Pre-compute daily totals as before.
    const dailyTotals: DailyTotals = {};
    monthlyPurchases.forEach((p) => {
      const formatted = format(parseISO(p.purchasedate), 'MM/dd/yyyy');
      // Convert the formatted date back to day of month:
      const day = parseInt(formatted.split('/')[1]);
      let weekIndex = Math.floor((day - 1) / 7);
      if (weekIndex > 3) weekIndex = 3;
      weekSums[weekIndex] += p.expense;
    });
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return { labels, data: weekSums };
  }

  // Navigation for week view
  const handleWeekNavigation = (direction: 'previous' | 'next') => {
    setCurrentWeekStart((prev) =>
      direction === 'previous' ? addWeeks(prev, -1) : addWeeks(prev, 1)
    );
  };

  // Generates an array of 7 dates for the current week (formatted as MM/dd/yyyy)
  const generateWeekDays = () => {
    return Array.from({ length: 7 }).map((_, i) =>
      format(addDays(startOfWeek(currentWeekStart, { weekStartsOn: 0 }), i), 'MM/dd/yyyy')
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await AuthService.getCurrentUser();
        if (!user) return;
  
        if (isMonth) {
          // Fetch all purchases for the user (assumed to be in ISO format, e.g., "2023-05-12")
          const purchases = await PurchaseHistoryService.getUserPurchases(user.id);
          // Format dates for the calendar using ISO (YYYY-MM-DD)
          const formattedDates: MarkedDatesType = {};
          let monthTotal = 0;
          purchases.forEach((purchase) => {
            const purchaseDate = new Date(purchase.purchasedate);
            const adjustedDate = new Date(purchaseDate.getTime() + purchaseDate.getTimezoneOffset() * 60000);
            const dateISO = format(adjustedDate, 'yyyy-MM-dd');
            
            formattedDates[dateISO] = { marked: true, dotColor: '#FFBB00' };
            monthTotal += purchase.expense;
          });
          setMarkedDates(formattedDates);
          setTotalSpent(monthTotal);
          // Calculate monthly average as total divided by number of days in current month.
          // NOTE: Adjust currentMonth split: if your currentMonth is "YYYY-MM", use split('-').
          const [year, month] = currentMonth.split('-');
          const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
          setMonthlyAverage(monthTotal / daysInMonth);
  
          // Fetch user budget and calculate progress.
          const profile = await UserService.getUserProfile(user.id);
          const userBudget = profile?.budget || 0;
          setBudget(userBudget);
          const progress = userBudget > 0 ? Math.min((monthTotal / userBudget) * 100, 100) : 0;
          setProgressPercentage(progress);
  
          // --- Begin Chart Data Generation for Month ---
          // Filter purchases to the current month (assuming purchasedate is in ISO "YYYY-MM-DD")
          const currentMonthPrefix = currentMonth; // e.g., "2023-05"
          const monthlyPurchases = purchases.filter((p) =>
            p.purchasedate.startsWith(currentMonthPrefix)
          );
  
          // Generate line chart data spanning all days of the month.
          const { labels: lineLabels, data: lineData } = generateLineChartData(monthlyPurchases);
          // Generate pie chart data based on expense category (extracted from description).
          const pieData = generatePieChartData(monthlyPurchases);
          // Generate bar chart data (split into 4 weeks).
          const { labels: barLabels, data: barData } = generateBarChartData(monthlyPurchases);
  
          
          // --- End Chart Data Generation for Month ---
        } else if (isWeek) {
          // For week view, determine the week boundaries in MM/dd/yyyy.
          const weekStartLocal = format(currentWeekStart, 'yyyy-MM-dd');
          const weekEndLocal = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
          // Fetch purchases by date range.
          const purchases = await PurchaseHistoryService.getUserPurchasesByDateRange(
            user.id,
            weekStartLocal,
            weekEndLocal
          );
          // Build daily totals using MM/dd/yyyy format.
          const dailyTotals: Record<string, number> = {};
          let weekTotal = 0;
          purchases.forEach((purchase) => {
            // Convert purchase date to local date string (MM/dd/yyyy)
            const purchaseDate = new Date(purchase.purchasedate);
            const localDate = new Date(purchaseDate.getTime() + purchaseDate.getTimezoneOffset() * 60000);
            const formattedDate = format(localDate, 'MM/dd/yyyy');

            dailyTotals[formattedDate] = (dailyTotals[formattedDate] || 0) + purchase.expense;
            weekTotal += purchase.expense;
          });
          setWeekDailyTotals(dailyTotals);
          // Compute weekly average as total for the week divided by 7.
          setWeeklyAverage(weekTotal / 7);
          // Update totalSpent if needed.
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

  const fetchChartData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user || !isChart) return;
  
      const today = new Date();
      const oneYearAgo = subDays(today, 365);
      const startDate = format(oneYearAgo, 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');
  
      const purchases = await PurchaseHistoryService.getUserPurchasesByDateRange(
        user.id,
        startDate,
        endDate
      );
  
      // Process data for all chart types
      const categoryMap = new Map<string, number>();
      const monthlyTotals = new Map<string, number>();
      
      purchases.forEach(p => {
        // Category extraction
        const match = p.description.match(/\(([^)]+)\)/);
        const category = match?.[1]?.trim() || 'Other';
        categoryMap.set(category, (categoryMap.get(category) || 0) + p.expense);
  
        // Monthly aggregation
        const monthKey = format(new Date(p.purchasedate), 'M');
        monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + p.expense);
      });
  
      // Pie Chart Data
      setPieChartData(Array.from(categoryMap.entries()).map(([name, population], index) => ({
        name,
        population,
        color: `rgba(139, 176, 79, ${0.5 + index * 0.1})`,
        legendFontColor: '#8BB04F',
        legendFontSize: 12
      })));
  
      // Bar Chart Data
      setBarChartData({
        labels: Array.from(categoryMap.keys()),
        values: Array.from(categoryMap.values())
      });
  
      // Line Chart Data (last 12 months)
      const months = Array.from({ length: 12 }, (_, i) => 
        format(subMonths(today, 11 - i), 'M')
      );
      setLineChartData({
        labels: months,
        values: months.map(month => monthlyTotals.get(month) || 0)
      });
  
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    if (isChart) {
      fetchChartData();
    }
  }, [isChart, chartType]);

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
            
          </View>
        )}

        {isWeek && (
          <View style={styles.weekView}>
            <View style={styles.weekNavigation}>
              <TouchableOpacity onPress={() => handleWeekNavigation('previous')}>
                <MaterialIcons name="chevron-left" size={24} color="#8BB04F" />
              </TouchableOpacity>
              <Text style={styles.weekTitle}>
                {format(toLocalDate(currentWeekStart), 'MMM d, yyyy')} - {format(toLocalDate(addDays(currentWeekStart, 6)), 'MMM d, yyyy')}
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
              
          </View>
        )}


{isChart && (
  <View style={styles.chartView}>
    

    <TouchableOpacity
      style={styles.inputAndroid}
      onPress={() => {
      setChartType((prev) => {
        if (prev === 'pie') return 'bar';
        if (prev === 'bar') return 'line';
        return 'pie';
      });
      }}
    >
      <Text style={{ color: '#FFF', textAlign: 'center' }}>
      {chartType === 'pie' ? 'Pie Chart' : chartType === 'bar' ? 'Bar Chart' : 'Line Chart'}
      </Text>
    </TouchableOpacity>


    {chartType === 'line' && (
      <LineChart
        data={{
          labels: lineChartData.labels,
          datasets: [{ data: lineChartData.values }]
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#230A15',
          backgroundGradientFrom: '#230A15',
          backgroundGradientTo: '#230A15',
          decimalPlaces: 0,
          color: () => '#8BB04F',
          labelColor: () => '#FFBB00',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#FFBB00'
          },
          paddingTop: 500,
        }}
        bezier
        style={styles.chart}
      />
    )}

    {chartType === 'bar' && (
      <BarChart
        data={{
          labels: barChartData.labels,
          datasets: [{ data: barChartData.values }]
        }}
        width={Dimensions.get('window').width - 35}
        height={240}
        fromZero={true}
        yAxisLabel="$"
        yAxisSuffix="" 
        chartConfig={{
          backgroundColor: '#230A15',
          backgroundGradientFrom: '#230A15',
          backgroundGradientTo: '#230A15',
          color: () => '#8BB04F',
          labelColor: () => '#FFBB00',
          fillShadowGradient: '#8BB04F',
          fillShadowGradientOpacity: 1, 
          propsForLabels: {
            fontSize: 10, 
          },
          
        }}
        style={styles.chart}
      />
    )}

    {chartType === 'pie' && (
      <PieChart
        data={pieChartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={{
          color: () => '#8BB04F'
        }}
        style={styles.chart}
      />
    )}
  </View>
)}
      </View>
      <View style={styles.info}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Spent</Text>
                <Text style={styles.infoValue}>${totalSpent.toFixed(2)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Monthly Average</Text>
                <Text style={styles.infoValue}>${monthlyAverage.toFixed(2)}</Text>
              </View>
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 100,
  },
  calendar: {
    marginTop: 30,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartView: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    color: '#8BB04F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#980058',
    borderRadius: 4,
    backgroundColor: '#230A15',
    marginBottom: 10,
  },
  inputIOS: {
    color: '#8BB04F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#980058',
    borderRadius: 4,
    backgroundColor: '#230A15',
    marginBottom: 10,

  },
  inputAndroid: {
    color: '#8BB04F',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    backgroundColor: '#980058',
    borderRadius: 4,
    marginBottom: 10,
  },
});
