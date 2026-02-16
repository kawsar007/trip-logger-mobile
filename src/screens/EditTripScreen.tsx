import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTrips, getTripById, updateTrip } from '../db/database';
import { COLORS } from '../theme/colors';
import { Trip } from '../types';

export default function EditTripScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const tripId = route.params?.tripId;

  const [trip, setTrip] = useState<Trip>({
    tripDate: new Date().toLocaleDateString('en-CA'),
    startDestination: '',
    endDestination: '',
    startPostal: '',
    endPostal: '',
    distance: '',
    time: '',
    description: '',
    startTravelTime: '',
    endTravelTime: '',
  });

  // Auto-suggest states
  const [startSuggestions, setStartSuggestions] = useState<string[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<string[]>([]);
  const [allDestinations, setAllDestinations] = useState<{
    starts: string[];
    ends: string[];
  }>({ starts: [], ends: [] });
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Time picker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      loadTripData();
      loadDestinations();
    } else {
      Alert.alert('Error', 'No trip ID provided');
      navigation.goBack();
    }
  }, [tripId]);

  const loadTripData = async () => {
    try {
      const tripData = await getTripById(tripId);
      if (tripData) {
        setTrip(tripData);
        setSelectedDate(new Date(tripData.tripDate));
      } else {
        Alert.alert('Error', 'Trip not found');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const trips = await getAllTrips();
      const starts = [...new Set(trips.map((t) => t.startDestination).filter(Boolean))];
      const ends = [...new Set(trips.map((t) => t.endDestination).filter(Boolean))];
      setAllDestinations({ starts, ends });
    } catch (error) {
      console.error('Error loading destinations:', error);
    }
  };

  const formatPostalCode = (text: string): string => {
    return text.toUpperCase();
  };

  const parseTimeToDate = (timeStr?: string): Date => {
    const date = new Date(1970, 0, 1, 0, 0, 0, 0);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
      }
    }
    return date;
  };

  const formatDateToTime = (date: Date): string => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const computeTravelTime = (): string => {
    if (!trip.startTravelTime || !trip.endTravelTime) return '';

    const start = parseTimeToDate(trip.startTravelTime);
    const end = parseTimeToDate(trip.endTravelTime);

    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }

    if (diffMs < 0) return '';

    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const timeStr = formatDateToTime(selectedDate);
      setTrip(prev => ({ ...prev, startTravelTime: timeStr }));
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const timeStr = formatDateToTime(selectedDate);
      setTrip(prev => ({ ...prev, endTravelTime: timeStr }));
    }
  };

  useEffect(() => {
    const computed = computeTravelTime();
    setTrip(prev => ({ ...prev, time: computed || '' }));
  }, [trip.startTravelTime, trip.endTravelTime]);

  const handleChange = (field: keyof Trip, value: string | number) => {
    setTrip((prev) => ({ ...prev, [field]: value }));

    if (field === 'startDestination' && typeof value === 'string') {
      if (value.length > 0) {
        const filtered = allDestinations.starts.filter((dest) =>
          dest.toLowerCase().includes(value.toLowerCase())
        );
        setStartSuggestions(filtered);
        setShowStartSuggestions(filtered.length > 0);
      } else {
        setShowStartSuggestions(false);
      }
    }

    if (field === 'endDestination' && typeof value === 'string') {
      if (value.length > 0) {
        const filtered = allDestinations.ends.filter((dest) =>
          dest.toLowerCase().includes(value.toLowerCase())
        );
        setEndSuggestions(filtered);
        setShowEndSuggestions(filtered.length > 0);
      } else {
        setShowEndSuggestions(false);
      }
    }
  };

  const selectStartSuggestion = (suggestion: string) => {
    setTrip((prev) => ({ ...prev, startDestination: suggestion }));
    setShowStartSuggestions(false);
  };

  const selectEndSuggestion = (suggestion: string) => {
    setTrip((prev) => ({ ...prev, endDestination: suggestion }));
    setShowEndSuggestions(false);
  };

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      setSelectedDate(selected);
      const formattedDate = selected.toLocaleDateString('en-CA');
      handleChange('tripDate', formattedDate);
    }
  };

  const handleUpdate = async () => {
    const distanceNum = parseFloat(trip.distance.toString());

    if (!trip.startDestination || !trip.endDestination || isNaN(distanceNum) ||
      distanceNum <= 0 || !trip.startTravelTime || !trip.endTravelTime || !trip.time) {
      Alert.alert('Missing Fields', 'Please fill all required fields including both times.');
      return;
    }

    try {
      await updateTrip(tripId, { ...trip, distance: distanceNum });
      Alert.alert('Success', 'Trip updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Edit Trip</Text>
            <Text style={styles.subtitle}>Update your journey details</Text>
          </View>

          <View style={styles.form}>
            {/* Date Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>📅 </Text>
                Trip Date
              </Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>{trip.tripDate}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {/* Start Destination */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>📍 </Text>
                Start Destination <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={trip.startDestination}
                onChangeText={(v) => handleChange('startDestination', v)}
                placeholder="e.g., London"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
              {showStartSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {startSuggestions.map((item, index) => (
                      <TouchableOpacity
                        key={`start-${index}`}
                        style={styles.suggestionItem}
                        onPress={() => selectStartSuggestion(item)}
                      >
                        <Text style={styles.suggestionText}>📍 {item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* End Destination */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>🎯 </Text>
                End Destination <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={trip.endDestination}
                onChangeText={(v) => handleChange('endDestination', v)}
                placeholder="e.g., Brighton"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
              {showEndSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {endSuggestions.map((item, index) => (
                      <TouchableOpacity
                        key={`end-${index}`}
                        style={styles.suggestionItem}
                        onPress={() => selectEndSuggestion(item)}
                      >
                        <Text style={styles.suggestionText}>🎯 {item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Postal Codes Row */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Text style={styles.labelIcon}>📮 </Text>
                  Start Postal
                </Text>
                <TextInput
                  style={styles.input}
                  value={trip.startPostal}
                  onChangeText={(v) => handleChange('startPostal', formatPostalCode(v))}
                  placeholder="CF12 5LD"
                  placeholderTextColor={COLORS.textSecondary || '#999'}
                  keyboardType="default"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <Text style={styles.labelIcon}>📮 </Text>
                  End Postal
                </Text>
                <TextInput
                  style={styles.input}
                  value={trip.endPostal}
                  onChangeText={(v) => handleChange('endPostal', formatPostalCode(v))}
                  placeholder="CF12 8LD"
                  placeholderTextColor={COLORS.textSecondary || '#999'}
                  keyboardType="default"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Distance Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>🚗 </Text>
                Distance (miles) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={trip.distance.toString()}
                onChangeText={(v) => handleChange('distance', v)}
                placeholder="45.5"
                placeholderTextColor={COLORS.textSecondary || '#999'}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Time Fields */}
            <View>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeText}>
                  {trip.startTravelTime || 'Select start time'}
                </Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={parseTimeToDate(trip.startTravelTime)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartTimeChange}
                />
              )}

              <Text style={styles.label}>End Time *</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timeText}>
                  {trip.endTravelTime || 'Select end time'}
                </Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={parseTimeToDate(trip.endTravelTime)}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndTimeChange}
                />
              )}

              {trip.time && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>Calculated Travel Time</Text>
                  <Text style={styles.computedTime}>{trip.time}</Text>
                </View>
              )}
            </View>

            {/* Description Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>📝 </Text>
                Description / Notes
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={trip.description}
                onChangeText={(v) => handleChange('description', v)}
                placeholder="Write description..."
                placeholderTextColor={COLORS.textSecondary || '#999'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>💾 Update Trip</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary || '#666',
    fontWeight: '400',
  },
  form: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  labelIcon: {
    fontSize: 16,
  },
  required: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: COLORS.text,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: COLORS.text,
  },
  computedTime: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    textAlign: 'center',
  },
});