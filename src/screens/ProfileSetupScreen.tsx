import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile } from '../types';

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    designation: '',
    phone: '',
    company: '',
  });

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email) {
      Alert.alert('Required Fields', 'Name and Email are required.');
      return;
    }
    try {
      await saveProfile(profile);
      // @ts-ignore - navigation reset after profile setup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <Text style={styles.subtitle}>This information will appear in your exported trip reports.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={v => handleChange('name', v)}
          placeholder="John Doe"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={v => handleChange('email', v)}
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Designation / Job Title</Text>
        <TextInput
          style={styles.input}
          value={profile.designation}
          onChangeText={v => handleChange('designation', v)}
          placeholder="Software Engineer"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={v => handleChange('phone', v)}
          placeholder="+880 123 456 789"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={profile.company}
          onChangeText={v => handleChange('company', v)}
          placeholder="Tech Solutions Ltd"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 40, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6c757d', marginBottom: 32 },
  form: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});