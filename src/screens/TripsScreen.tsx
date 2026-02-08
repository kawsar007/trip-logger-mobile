import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView
} from 'react-native-safe-area-context';
import DateRangePicker from '../components/DateRangePicker';
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
      await loadData(); // refresh
      Alert.alert('Success', 'Trip deleted');
    } catch (err) {
      Alert.alert('Error', 'Could not delete trip');
    }
  };

  // const handleEdit = (trip: Trip) => {
  //   // Navigate to AddTripScreen with existing trip data
  //   // We'll pass trip as param
  //   navigation.navigate('AddTrip', { tripToEdit: trip });
  // };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text>Loading trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const grouped = groupTripsByDate();
  const { totalMiles: grandMiles, totalMinutes: grandMin } = grandTotals();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Trip History</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        <DateRangePicker range={dateRange} onChange={setDateRange} />

        {filteredTrips.length === 0 && (
          <Text style={styles.noResults}>No trips found in selected date range</Text>
        )}

        {Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => {
            const dayTrips = grouped[date];
            const { totalMiles, totalMinutes } = calculateTotals(dayTrips);

            return (
              <View key={date} style={styles.section}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                  <Text style={styles.subTotal}>
                    {totalMiles} miles • {minutesToTime(totalMinutes)}
                  </Text>
                </View>

                {dayTrips.map((trip) => (
                  <View key={trip.id} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <Text style={styles.tripTitle}>
                        {trip.startDestination} → {trip.endDestination}
                      </Text>
                      <TripActions
                        // onEdit={() => handleEdit(trip)}
                        onDelete={() => handleDelete(trip.id)}
                      />
                    </View>

                    {(trip.startPostal || trip.endPostal) && (
                      <View style={styles.tripRow}>
                        <Text style={styles.tripLabel}>Postal:</Text>
                        <Text style={styles.tripValue}>
                          {trip.startPostal || '-'} → {trip.endPostal || '-'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.tripRow}>
                      <Text style={styles.tripLabel}>Distance:</Text>
                      <Text style={styles.tripValue}>{trip.distance} miles</Text>
                    </View>

                    <View style={styles.tripRow}>
                      <Text style={styles.tripLabel}>Time:</Text>
                      <Text style={styles.tripValue}>{trip.time}</Text>
                    </View>

                    {trip.description && (
                      <View style={styles.tripRow}>
                        <Text style={styles.tripLabel}>Notes:</Text>
                        <Text style={styles.tripValue}>{trip.description}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            );
          })}

        {filteredTrips.length > 0 && (
          <View style={styles.grandTotal}>
            <Text style={styles.grandLabel}>GRAND TOTAL (filtered)</Text>
            <Text style={styles.grandValue}>
              {grandMiles} miles • {minutesToTime(grandMin)}
            </Text>
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
    padding: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  section: { marginBottom: 24 },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#343a40' },
  subTotal: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  tripCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  tripRow: { flexDirection: 'row', marginBottom: 8 },
  tripLabel: { width: 100, fontWeight: '600', color: '#495057' },
  tripValue: { flex: 1, color: '#212529' },
  grandTotal: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  grandLabel: { fontSize: 18, fontWeight: 'bold', color: '#155724' },
  grandValue: { fontSize: 24, fontWeight: 'bold', color: '#155724', marginTop: 8 },
});