import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addTrip } from '../db/database';
import { COLORS } from '../theme/colors';
import { Trip } from '../types';

export default function AddTripScreen() {
  const navigation = useNavigation();
  const [trip, setTrip] = useState<Trip>({
    tripDate: new Date().toISOString().split('T')[0], // default today YYYY-MM-DD
    startDestination: '',
    endDestination: '',
    startPostal: '',
    endPostal: '',
    distance: 0,
    time: '',
    description: '',
  });

  const handleChange = (field: keyof Trip, value: string | number) => {
    setTrip((prev) => ({ ...prev, [field]: value }));
  };

  const validateTime = (time: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleSave = async () => {
    if (!trip.startDestination || !trip.endDestination || trip.distance <= 0 || !trip.time) {
      Alert.alert('Missing Fields', 'Please fill in Start, End, Distance, and Time.');
      return;
    }

    if (!validateTime(trip.time)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (24-hour). Example: 08:30 or 17:45');
      return;
    }

    try {
      await addTrip(trip);
      Alert.alert('Success', 'Trip logged successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Log New Trip</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={trip.tripDate}
            onChangeText={(v) => handleChange('tripDate', v)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Start Destination *</Text>
          <TextInput
            style={styles.input}
            value={trip.startDestination}
            onChangeText={(v) => handleChange('startDestination', v)}
            placeholder="Office"
          />

          <Text style={styles.label}>End Destination *</Text>
          <TextInput
            style={styles.input}
            value={trip.endDestination}
            onChangeText={(v) => handleChange('endDestination', v)}
            placeholder="Client Site"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Start Postal Code</Text>
              <TextInput
                style={styles.input}
                value={trip.startPostal}
                onChangeText={(v) => handleChange('startPostal', v)}
                placeholder="1207"
                keyboardType="default"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Postal Code</Text>
              <TextInput
                style={styles.input}
                value={trip.endPostal}
                onChangeText={(v) => handleChange('endPostal', v)}
                placeholder="1212"
                keyboardType="default"
              />
            </View>
          </View>

          <Text style={styles.label}>Distance (miles) *</Text>
          <TextInput
            style={styles.input}
            value={trip.distance.toString()}
            onChangeText={(v) => handleChange('distance', parseFloat(v) || 0)}
            placeholder="45.5"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Time (HH:MM) *</Text>
          <TextInput
            style={styles.input}
            value={trip.time}
            onChangeText={(v) => handleChange('time', v)}
            placeholder="02:45"
            keyboardType="default"
          />

          <Text style={styles.label}>Description / Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={trip.description}
            onChangeText={(v) => handleChange('description', v)}
            placeholder="Meeting with client..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 40, marginBottom: 24 },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});