import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        setForm(data);
      } else {
        // If no profile exists, start in editing mode
        setEditing(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Profile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photos.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Required Fields', 'Name and Email are required.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await saveProfile(form);
      setProfile(form);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully! ✅');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setForm(profile);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {!editing && (
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={editing ? pickImage : undefined}
            activeOpacity={editing ? 0.7 : 1}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {form.name ? getInitials(form.name) : '👤'}
                </Text>
              </View>
            )}
            {editing && (
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          {editing && (
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          )}
        </View>

        {editing ? (
          /* EDIT MODE */
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="person-outline" size={16} color={COLORS.text} /> Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="mail-outline" size={16} color={COLORS.text} /> Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="john.doe@example.com"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.text} /> Designation
              </Text>
              <TextInput
                style={styles.input}
                value={form.designation}
                onChangeText={v => handleChange('designation', v)}
                placeholder="Software Engineer"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="call-outline" size={16} color={COLORS.text} /> Phone Number
              </Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={v => handleChange('phone', v)}
                keyboardType="phone-pad"
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="business-outline" size={16} color={COLORS.text} /> Company Name
              </Text>
              <TextInput
                style={styles.input}
                value={form.company}
                onChangeText={v => handleChange('company', v)}
                placeholder="Acme Corporation"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* VIEW MODE */
          <View style={styles.card}>
            {profile?.name && (
              <Text style={styles.profileName}>{profile.name}</Text>
            )}
            {profile?.designation && (
              <Text style={styles.profileDesignation}>{profile.designation}</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile?.email || '—'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="call" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="business" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Company</Text>
                  <Text style={styles.infoValue}>{profile?.company || 'Not provided'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
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
    backgroundColor: COLORS.background,
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  editIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
  },

  // Profile View Mode
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  profileDesignation: {
    fontSize: 16,
    color: COLORS.textSecondary || '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  infoSection: {
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary || '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Edit Mode
  form: {
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.3,
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
    backgroundColor: '#fff',
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});





// import React, { useEffect, useState } from 'react';
// import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { getProfile, saveProfile } from '../db/database';
// import { COLORS } from '../theme/colors';
// import { Profile } from '../types';

// export default function ProfileScreen() {
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [editing, setEditing] = useState(false);
//   const [form, setForm] = useState<Profile>({
//     name: '',
//     email: '',
//     designation: '',
//     phone: '',
//     company: '',
//   });

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   const loadProfile = async () => {
//     const data = await getProfile();
//     if (data) {
//       setProfile(data);
//       setForm(data);
//     }
//   };

//   const handleChange = (field: keyof Profile, value: string) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.email) {
//       Alert.alert('Required Fields', 'Name and Email are required.');
//       return;
//     }
//     try {
//       await saveProfile(form);
//       setProfile(form);
//       setEditing(false);
//       Alert.alert('Success', 'Profile updated successfully.');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update profile.');
//     }
//   };

//   if (!profile && !editing) {
//     return (
//       <View style={styles.center}>
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Your Profile</Text>

//       {editing ? (
//         <View style={styles.form}>
//           <Text style={styles.label}>Full Name *</Text>
//           <TextInput style={styles.input} value={form.name} onChangeText={v => handleChange('name', v)} />

//           <Text style={styles.label}>Email *</Text>
//           <TextInput style={styles.input} value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" />

//           <Text style={styles.label}>Designation</Text>
//           <TextInput style={styles.input} value={form.designation} onChangeText={v => handleChange('designation', v)} />

//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput style={styles.input} value={form.phone} onChangeText={v => handleChange('phone', v)} keyboardType="phone-pad" />

//           <Text style={styles.label}>Company Name</Text>
//           <TextInput style={styles.input} value={form.company} onChangeText={v => handleChange('company', v)} />

//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSave}>
//               <Text style={styles.buttonText}>Save Changes</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => { setEditing(false); setForm(profile!); }}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <View style={styles.card}>
//           <View style={styles.row}>
//             <Text style={styles.label}>Name:</Text>
//             <Text style={styles.value}>{profile?.name}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Email:</Text>
//             <Text style={styles.value}>{profile?.email}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Designation:</Text>
//             <Text style={styles.value}>{profile?.designation || '—'}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Phone:</Text>
//             <Text style={styles.value}>{profile?.phone || '—'}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Company:</Text>
//             <Text style={styles.value}>{profile?.company || '—'}</Text>
//           </View>

//           <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
//             <Text style={styles.editButtonText}>Edit Profile</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 40, marginBottom: 24 },
//   card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
//   form: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
//   row: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
//   label: { fontSize: 16, fontWeight: '600', color: COLORS.text, width: 120 },
//   value: { fontSize: 16, color: '#495057', flex: 1 },
//   editButton: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
//   editButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
//   button: { flex: 1, borderRadius: 8, padding: 16, alignItems: 'center' },
//   save: { backgroundColor: COLORS.primary, marginRight: 12 },
//   cancel: { backgroundColor: '#6c757d' },
//   buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 8 },
// });