import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView
} from 'react-native-safe-area-context';
import TripActions from '../components/TripActions';
import { deleteTrip, getAllTrips, getProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile, Trip } from '../types';
import { formatDate, minutesToTime, timeToMinutes } from '../utils/format';
import { exportToPDF } from '../utils/pdf';

export default function TripsScreen() {
  const navigation = useNavigation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  // Date picker states
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedToDate, setSelectedToDate] = useState(new Date());

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const [allTrips, userProfile] = await Promise.all([
        getAllTrips(),
        getProfile(),
      ]);
      setTrips(allTrips);
      setFilteredTrips(allTrips);
      setProfile(userProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  // Filter trips when date range changes
  useEffect(() => {
    let result = [...trips];
    if (dateRange.from) {
      result = result.filter((t) => t.tripDate >= dateRange.from);
    }
    if (dateRange.to) {
      result = result.filter((t) => t.tripDate <= dateRange.to);
    }

    setFilteredTrips(result);
  }, [dateRange, trips]);

  const groupTripsByDate = () => {
    const groups: Record<string, Trip[]> = {};
    filteredTrips.forEach((trip) => {
      if (!groups[trip.tripDate]) groups[trip.tripDate] = [];
      groups[trip.tripDate].push(trip);
    });
    return groups;
  };

  const calculateTotals = (dayTrips: Trip[]) => {
    const totalMinutes = dayTrips.reduce((sum, t) => sum + timeToMinutes(t.time), 0);
    const totalMiles = dayTrips.reduce((sum, t) => sum + t.distance, 0);
    return { totalMinutes, totalMiles };
  };

  const grandTotals = () => {
    const totalMinutes = filteredTrips.reduce((sum, t) => sum + timeToMinutes(t.time), 0);
    const totalMiles = filteredTrips.reduce((sum, t) => sum + t.distance, 0);
    return { totalMinutes, totalMiles };
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteTrip(id);
      await loadData();
      Alert.alert('Success', 'Trip deleted');
    } catch (err) {
      Alert.alert('Error', 'Could not delete trip');
    }
  };

  const handleExport = async () => {
    if (!profile) {
      Alert.alert('Profile Required', 'Please set up your profile first.');
      return;
    }
    if (filteredTrips.length === 0) {
      Alert.alert('No Data', 'No trips to export in the selected range.');
      return;
    }
    await exportToPDF(profile, filteredTrips);
  };

  const onFromDateChange = (event: any, selected?: Date) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selected) {
      setSelectedFromDate(selected);
      const formattedDate = selected.toLocaleDateString('en-CA');
      setDateRange((prev) => ({ ...prev, from: formattedDate }));
    }
  };

  const onToDateChange = (event: any, selected?: Date) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selected) {
      setSelectedToDate(selected);
      const formattedDate = selected.toLocaleDateString('en-CA');
      setDateRange((prev) => ({ ...prev, to: formattedDate }));
    }
  };

  const clearFilters = () => {
    setDateRange({ from: '', to: '' });
    setSelectedFromDate(new Date());
    setSelectedToDate(new Date());
  };

  const hasActiveFilters = dateRange.from !== '' || dateRange.to !== '';

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const grouped = groupTripsByDate();
  const { totalMiles: grandMiles, totalMinutes: grandMin } = grandTotals();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Trip History</Text>
            <Text style={styles.subtitle}>{trips.length} total trips</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Date Filter Section */}
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>📅 Filter by Date</Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.primary} />
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.datePickerRow}>
            {/* From Date */}
            <View style={styles.datePickerGroup}>
              <Text style={styles.dateLabel}>From</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={dateRange.from ? styles.dateText : styles.datePlaceholder}>
                  {dateRange.from || 'Start date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View style={styles.datePickerGroup}>
              <Text style={styles.dateLabel}>To</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={dateRange.to ? styles.dateText : styles.datePlaceholder}>
                  {dateRange.to || 'End date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {hasActiveFilters && (
            <View style={styles.filterSummary}>
              <Text style={styles.filterSummaryText}>
                📊 Showing {filteredTrips.length} of {trips.length} trips
              </Text>
            </View>
          )}
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={selectedFromDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onFromDateChange}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={selectedToDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onToDateChange}
          />
        )}

        {filteredTrips.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsIcon}>📭</Text>
            <Text style={styles.noResults}>No trips found</Text>
            <Text style={styles.noResultsHint}>
              {hasActiveFilters ? 'Try adjusting your date filters' : 'Add your first trip to get started'}
            </Text>
          </View>
        )}

        {Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => {
            const dayTrips = grouped[date];
            const { totalMiles, totalMinutes } = calculateTotals(dayTrips);

            return (
              <View key={date} style={styles.section}>
                <View style={styles.dateHeader}>
                  <View>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                    <Text style={styles.tripCount}>{dayTrips.length} trip{dayTrips.length > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.subTotalContainer}>
                    <Text style={styles.subTotal}>
                      {totalMiles.toFixed(1)} mi
                    </Text>
                    <Text style={styles.subTotalTime}>
                      {minutesToTime(totalMinutes)}
                    </Text>
                  </View>
                </View>

                {dayTrips.map((trip) => (
                  <View key={trip.id} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <View style={styles.tripTitleContainer}>
                        <Text style={styles.tripTitle}>
                          {trip.startDestination}
                        </Text>
                        <View style={styles.arrowContainer}>
                          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                        </View>
                        <Text style={styles.tripTitle}>
                          {trip.endDestination}
                        </Text>
                      </View>
                      <TripActions
                        onDelete={() => handleDelete(trip.id)}
                      />
                    </View>

                    <View style={styles.tripDetails}>
                      {(trip.startPostal || trip.endPostal) && (
                        <View style={styles.tripRow}>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text style={styles.tripLabel}>Postal:</Text>
                          <Text style={styles.tripValue}>
                            {trip.startPostal || '-'} → {trip.endPostal || '-'}
                          </Text>
                        </View>
                      )}

                      <View style={styles.tripRow}>
                        <Ionicons name="car-outline" size={16} color="#666" />
                        <Text style={styles.tripLabel}>Distance:</Text>
                        <Text style={styles.tripValue}>{trip.distance} miles</Text>
                      </View>

                      <View style={styles.tripRow}>
                        <Text style={styles.tripLabel}>Travel Time:</Text>
                        <Text style={styles.tripValue}>
                          {trip.startTravelTime || '—'} → {trip.endTravelTime || '—'} ({trip.time})
                        </Text>
                      </View>

                      <View style={styles.tripRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.tripLabel}>Duration:</Text>
                        <Text style={styles.tripValue}>{trip.time}</Text>
                      </View>

                      {trip.description && (
                        <View style={styles.tripRow}>
                          <Ionicons name="document-text-outline" size={16} color="#666" />
                          <Text style={styles.tripLabel}>Notes:</Text>
                          <Text style={styles.tripValue}>{trip.description}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

        {filteredTrips.length > 0 && (
          <View style={styles.grandTotal}>
            <Text style={styles.grandLabel}>
              {hasActiveFilters ? 'FILTERED TOTAL' : 'GRAND TOTAL'}
            </Text>
            <View style={styles.grandTotalDetails}>
              <View style={styles.grandTotalItem}>
                <Text style={styles.grandTotalLabel}>Distance</Text>
                <Text style={styles.grandValue}>{grandMiles.toFixed(1)} Miles</Text>
              </View>
              <View style={styles.grandTotalDivider} />
              <View style={styles.grandTotalItem}>
                <Text style={styles.grandTotalLabel}>Time</Text>
                <Text style={styles.grandValue}>{minutesToTime(grandMin)} Hours</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#666',
    fontWeight: '400',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  exportText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 15,
  },

  // Filter Section
  filterContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  clearText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  datePlaceholder: {
    fontSize: 15,
    color: COLORS.textSecondary || '#999',
  },
  filterSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  filterSummaryText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResults: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsHint: {
    textAlign: 'center',
    color: COLORS.textSecondary || '#888',
    fontSize: 14,
  },

  // Trip Cards
  section: {
    marginBottom: 24
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  // dateText: {
  //   fontSize: 17,
  //   fontWeight: '700',
  //   color: COLORS.text,
  //   marginBottom: 2,
  // },
  tripCount: {
    fontSize: 12,
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
  },
  subTotalContainer: {
    alignItems: 'flex-end',
  },
  subTotal: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  subTotalTime: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },

  tripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tripTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  arrowContainer: {
    marginHorizontal: 4,
  },
  tripDetails: {
    gap: 10,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripLabel: {
    fontWeight: '600',
    color: '#495057',
    fontSize: 14,
    minWidth: 80,
  },
  tripValue: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },

  // Grand Total
  grandTotal: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  grandTotalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  grandTotalItem: {
    alignItems: 'center',
    flex: 1,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  grandValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  grandTotalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});





// import { Ionicons } from '@expo/vector-icons';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {
//   SafeAreaView
// } from 'react-native-safe-area-context';
// import DateRangePicker from '../components/DateRangePicker';
// import TripActions from '../components/TripActions';
// import { deleteTrip, getAllTrips, getProfile } from '../db/database';
// import { COLORS } from '../theme/colors';
// import { Profile, Trip } from '../types';
// import { formatDate, minutesToTime, timeToMinutes } from '../utils/format';
// import { exportToPDF } from '../utils/pdf';

// export default function TripsScreen() {
//   const navigation = useNavigation();
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
//     from: '',
//     to: '',
//   });
//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (isFocused) {
//       loadData();
//     }
//   }, [isFocused]);

//   const loadData = async () => {
//     try {
//       const [allTrips, userProfile] = await Promise.all([
//         getAllTrips(),
//         getProfile(),
//       ]);
//       setTrips(allTrips);
//       setFilteredTrips(allTrips);
//       setProfile(userProfile);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load trips.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter trips when date range changes
//   useEffect(() => {
//     let result = [...trips];
//     if (dateRange.from) {
//       result = result.filter((t) => t.tripDate >= dateRange.from);
//     }
//     if (dateRange.to) {
//       result = result.filter((t) => t.tripDate <= dateRange.to);
//     }

//     setFilteredTrips(result);
//   }, [dateRange, trips]);

//   const groupTripsByDate = () => {
//     const groups: Record<string, Trip[]> = {};
//     filteredTrips.forEach((trip) => {
//       if (!groups[trip.tripDate]) groups[trip.tripDate] = [];
//       groups[trip.tripDate].push(trip);
//     });
//     return groups;
//   };

//   const calculateTotals = (dayTrips: Trip[]) => {
//     const totalMinutes = dayTrips.reduce((sum, t) => sum + timeToMinutes(t.time), 0);
//     const totalMiles = dayTrips.reduce((sum, t) => sum + t.distance, 0);
//     return { totalMinutes, totalMiles };
//   };

//   const grandTotals = () => {
//     const totalMinutes = filteredTrips.reduce((sum, t) => sum + timeToMinutes(t.time), 0);
//     const totalMiles = filteredTrips.reduce((sum, t) => sum + t.distance, 0);
//     return { totalMinutes, totalMiles };
//   };

//   const handleDelete = async (id?: number) => {
//     if (!id) return;
//     try {
//       await deleteTrip(id);
//       await loadData(); // refresh
//       Alert.alert('Success', 'Trip deleted');
//     } catch (err) {
//       Alert.alert('Error', 'Could not delete trip');
//     }
//   };

//   // const handleEdit = (trip: Trip) => {
//   //   // Navigate to AddTripScreen with existing trip data
//   //   // We'll pass trip as param
//   //   navigation.navigate('AddTrip', { tripToEdit: trip });
//   // };

//   const handleExport = async () => {
//     if (!profile) {
//       Alert.alert('Profile Required', 'Please set up your profile first.');
//       return;
//     }
//     if (filteredTrips.length === 0) {
//       Alert.alert('No Data', 'No trips to export in the selected range.');
//       return;
//     }
//     await exportToPDF(profile, filteredTrips);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.center}>
//           <Text>Loading trips...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const grouped = groupTripsByDate();
//   const { totalMiles: grandMiles, totalMinutes: grandMin } = grandTotals();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>Trip History</Text>
//           <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
//             <Ionicons name="download-outline" size={20} color="#fff" />
//             <Text style={styles.exportText}>Export PDF</Text>
//           </TouchableOpacity>
//         </View>

//         <DateRangePicker range={dateRange} onChange={setDateRange} />

//         {filteredTrips.length === 0 && (
//           <Text style={styles.noResults}>No trips found in selected date range</Text>
//         )}

//         {Object.keys(grouped)
//           .sort((a, b) => b.localeCompare(a))
//           .map((date) => {
//             const dayTrips = grouped[date];
//             const { totalMiles, totalMinutes } = calculateTotals(dayTrips);

//             return (
//               <View key={date} style={styles.section}>
//                 <View style={styles.dateHeader}>
//                   <Text style={styles.dateText}>{formatDate(date)}</Text>
//                   <Text style={styles.subTotal}>
//                     {totalMiles} miles • {minutesToTime(totalMinutes)}
//                   </Text>
//                 </View>

//                 {dayTrips.map((trip) => (
//                   <View key={trip.id} style={styles.tripCard}>
//                     <View style={styles.tripHeader}>
//                       <Text style={styles.tripTitle}>
//                         {trip.startDestination} → {trip.endDestination}
//                       </Text>
//                       <TripActions
//                         // onEdit={() => handleEdit(trip)}
//                         onDelete={() => handleDelete(trip.id)}
//                       />
//                     </View>

//                     {(trip.startPostal || trip.endPostal) && (
//                       <View style={styles.tripRow}>
//                         <Text style={styles.tripLabel}>Postal:</Text>
//                         <Text style={styles.tripValue}>
//                           {trip.startPostal || '-'} → {trip.endPostal || '-'}
//                         </Text>
//                       </View>
//                     )}

//                     <View style={styles.tripRow}>
//                       <Text style={styles.tripLabel}>Distance:</Text>
//                       <Text style={styles.tripValue}>{trip.distance} miles</Text>
//                     </View>

//                     <View style={styles.tripRow}>
//                       <Text style={styles.tripLabel}>Time:</Text>
//                       <Text style={styles.tripValue}>{trip.time}</Text>
//                     </View>

//                     {trip.description && (
//                       <View style={styles.tripRow}>
//                         <Text style={styles.tripLabel}>Notes:</Text>
//                         <Text style={styles.tripValue}>{trip.description}</Text>
//                       </View>
//                     )}
//                   </View>
//                 ))}
//               </View>
//             );
//           })}

//         {filteredTrips.length > 0 && (
//           <View style={styles.grandTotal}>
//             <Text style={styles.grandLabel}>GRAND TOTAL (filtered)</Text>
//             <Text style={styles.grandValue}>
//               {grandMiles} miles • {minutesToTime(grandMin)}
//             </Text>
//           </View>
//         )}

//         <View style={{ height: 80 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   noResults: {
//     textAlign: 'center',
//     color: '#888',
//     fontSize: 16,
//     marginVertical: 20,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
//   exportButton: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   exportText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
//   section: { marginBottom: 24 },
//   dateHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#e9ecef',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   dateText: { fontSize: 18, fontWeight: 'bold', color: '#343a40' },
//   subTotal: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
//   tripCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   tripHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   tripTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     flex: 1,
//   },
//   tripRow: { flexDirection: 'row', marginBottom: 8 },
//   tripLabel: { width: 100, fontWeight: '600', color: '#495057' },
//   tripValue: { flex: 1, color: '#212529' },
//   grandTotal: {
//     backgroundColor: '#d4edda',
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 16,
//     marginBottom: 40,
//   },
//   grandLabel: { fontSize: 18, fontWeight: 'bold', color: '#155724' },
//   grandValue: { fontSize: 24, fontWeight: 'bold', color: '#155724', marginTop: 8 },
// });