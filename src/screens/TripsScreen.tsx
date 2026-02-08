import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllTrips, getProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile, Trip } from '../types';
import { formatDate, minutesToTime, timeToMinutes } from '../utils/format';
import { exportToPDF } from '../utils/pdf';

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTrips, userProfile] = await Promise.all([getAllTrips(), getProfile()]);
      setTrips(allTrips);
      setProfile(userProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  const groupTripsByDate = () => {
    const groups: Record<string, Trip[]> = {};
    trips.forEach((trip) => {
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
    const totalMinutes = trips.reduce((sum, t) => sum + timeToMinutes(t.time), 0);
    const totalMiles = trips.reduce((sum, t) => sum + t.distance, 0);
    return { totalMinutes, totalMiles };
  };

  const handleExport = async () => {
    if (!profile) {
      Alert.alert('Profile Required', 'Please set up your profile first.');
      return;
    }
    if (trips.length === 0) {
      Alert.alert('No Data', 'There are no trips to export.');
      return;
    }
    await exportToPDF(profile, trips);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading trips...</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="car-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No trips logged yet</Text>
        <Text style={styles.emptySubText}>Tap "Log Trip" to add your first entry</Text>
      </View>
    );
  }

  const grouped = groupTripsByDate();
  const { totalMiles: grandMiles, totalMinutes: grandMin } = grandTotals();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Trip History</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {Object.keys(grouped)
        .sort((a, b) => b.localeCompare(a)) // newest first
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
                  <View style={styles.tripRow}>
                    <Text style={styles.tripLabel}>From → To:</Text>
                    <Text style={styles.tripValue}>
                      {trip.startDestination} → {trip.endDestination}
                    </Text>
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

      <View style={styles.grandTotal}>
        <Text style={styles.grandLabel}>GRAND TOTAL</Text>
        <Text style={styles.grandValue}>
          {grandMiles} miles • {minutesToTime(grandMin)}
        </Text>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptySubText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
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