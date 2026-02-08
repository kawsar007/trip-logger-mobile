import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getProfile, saveProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile } from '../types';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>({
    name: '',
    email: '',
    designation: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      setProfile(data);
      setForm(data);
    }
  };

  const handleChange = (field: keyof Profile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Required Fields', 'Name and Email are required.');
      return;
    }
    try {
      await saveProfile(form);
      setProfile(form);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (!profile && !editing) {
    return (
      <View style={styles.center}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      {editing ? (
        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={v => handleChange('name', v)} />

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" />

          <Text style={styles.label}>Designation</Text>
          <TextInput style={styles.input} value={form.designation} onChangeText={v => handleChange('designation', v)} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={v => handleChange('phone', v)} keyboardType="phone-pad" />

          <Text style={styles.label}>Company Name</Text>
          <TextInput style={styles.input} value={form.company} onChangeText={v => handleChange('company', v)} />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => { setEditing(false); setForm(profile!); }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{profile?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designation:</Text>
            <Text style={styles.value}>{profile?.designation || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{profile?.phone || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>{profile?.company || '—'}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 40, marginBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  form: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, width: 120 },
  value: { fontSize: 16, color: '#495057', flex: 1 },
  editButton: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  editButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
  button: { flex: 1, borderRadius: 8, padding: 16, alignItems: 'center' },
  save: { backgroundColor: COLORS.primary, marginRight: 12 },
  cancel: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 8 },
});