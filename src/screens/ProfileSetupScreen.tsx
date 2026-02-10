import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { saveProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile } from '../types';

const FIELDS: {
  key: keyof Profile;
  label: string;
  placeholder: string;
  icon: string;
  keyboardType?: any;
  autoCapitalize?: any;
  required?: boolean;
}[] = [
    {
      key: 'name',
      label: 'Full Name',
      placeholder: 'John Doe',
      icon: 'person-outline',
      autoCapitalize: 'words',
      required: true,
    },
    {
      key: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      icon: 'mail-outline',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      required: true,
    },
    {
      key: 'designation',
      label: 'Designation / Job Title',
      placeholder: 'Enter your job title',
      icon: 'briefcase-outline',
    },
    {
      key: 'phone',
      label: 'Phone Number',
      placeholder: '+880 123 456 789',
      icon: 'call-outline',
      keyboardType: 'phone-pad',
    },
    {
      key: 'company',
      label: 'Company Name',
      placeholder: 'Tech Solutions Ltd',
      icon: 'business-outline',
    },
  ];

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    designation: '',
    phone: '',
    company: '',
  });
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof Profile | null>(null);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!profile.email.trim()) {
      Alert.alert('Required Field', 'Please enter your email address.');
      return;
    }
    if (!validateEmail(profile.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      await saveProfile(profile);
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!profile.name.trim()) return '?';
    return profile.name
      .trim()
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filledCount = FIELDS.filter(f => profile[f.key]?.trim()).length;
  const progressPercent = (filledCount / FIELDS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Ionicons name="rocket-outline" size={16} color={COLORS.primary} />
              <Text style={styles.headerBadgeText}>Welcome aboard</Text>
            </View>
            <Text style={styles.title}>Set Up Your{'\n'}Profile</Text>
            <Text style={styles.subtitle}>
              This info will appear on your exported trip reports.
            </Text>
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {profile.name.trim() || 'Your Name'}
              </Text>
              <Text style={styles.previewSub} numberOfLines={1}>
                {profile.designation.trim() || profile.company.trim() || 'Your Designation'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Profile completion</Text>
              <Text style={styles.progressCount}>{filledCount}/{FIELDS.length} fields</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {FIELDS.map((field, index) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === field.key && styles.inputWrapperFocused,
                    profile[field.key]?.trim() && styles.inputWrapperFilled,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name={field.icon as any}
                      size={20}
                      color={
                        focusedField === field.key
                          ? COLORS.primary
                          : profile[field.key]?.trim()
                            ? COLORS.primary
                            : '#adb5bd'
                      }
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={profile[field.key] as string}
                    onChangeText={v => handleChange(field.key, v)}
                    placeholder={field.placeholder}
                    placeholderTextColor="#c0c4cc"
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={field.autoCapitalize || 'sentences'}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                  {profile[field.key]?.trim() ? (
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  ) : null}
                </View>
              </View>
            ))}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>Saving Profile...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Save & Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>
              <Ionicons name="lock-closed-outline" size={12} color="#adb5bd" />
              {'  '}Your data is stored only on this device
            </Text>
          </View>

          <View style={{ height: 40 }} />
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

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}18`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 44,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary || '#6c757d',
    lineHeight: 22,
    marginBottom: 8,
  },

  // Avatar Preview
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  previewSub: {
    fontSize: 13,
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
  },

  // Progress
  progressSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary || '#666',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // Form
  form: {
    marginHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: {
    color: '#e74c3c',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingRight: 14,
  },
  inputWrapperFocused: {
    // Only border color change — safe, no layout or elevation shift
    borderColor: COLORS.primary,
  },
  inputWrapperFilled: {
    // Only border color change — background color change causes re-layout shake, so removed
    borderColor: '#2ecc7150',
  },
  inputIconContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 14,
  },

  // Button
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.75,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#adb5bd',
    marginTop: 16,
  },
});




// import { useNavigation } from '@react-navigation/native';
// import React, { useState } from 'react';
// import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { saveProfile } from '../db/database';
// import { COLORS } from '../theme/colors';
// import { Profile } from '../types';

// export default function ProfileSetupScreen() {
//   const navigation = useNavigation();
//   const [profile, setProfile] = useState<Profile>({
//     name: '',
//     email: '',
//     designation: '',
//     phone: '',
//     company: '',
//   });

//   const handleChange = (field: keyof Profile, value: string) => {
//     setProfile(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async () => {
//     if (!profile.name || !profile.email) {
//       Alert.alert('Required Fields', 'Name and Email are required.');
//       return;
//     }
//     try {
//       await saveProfile(profile);
//       // @ts-ignore - navigation reset after profile setup
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Main' }],
//       });
//     } catch (error) {
//       Alert.alert('Error', 'Failed to save profile. Please try again.');
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Set Up Your Profile</Text>
//       <Text style={styles.subtitle}>This information will appear in your exported trip reports.</Text>

//       <View style={styles.form}>
//         <Text style={styles.label}>Full Name *</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.name}
//           onChangeText={v => handleChange('name', v)}
//           placeholder="John Doe"
//           autoCapitalize="words"
//         />

//         <Text style={styles.label}>Email *</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.email}
//           onChangeText={v => handleChange('email', v)}
//           placeholder="john@example.com"
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <Text style={styles.label}>Designation / Job Title</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.designation}
//           onChangeText={v => handleChange('designation', v)}
//           placeholder="Software Engineer"
//         />

//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.phone}
//           onChangeText={v => handleChange('phone', v)}
//           placeholder="+880 123 456 789"
//           keyboardType="phone-pad"
//         />

//         <Text style={styles.label}>Company Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.company}
//           onChangeText={v => handleChange('company', v)}
//           placeholder="Tech Solutions Ltd"
//         />

//         <TouchableOpacity style={styles.button} onPress={handleSave}>
//           <Text style={styles.buttonText}>Save & Continue</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
//   title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 40, marginBottom: 8 },
//   subtitle: { fontSize: 16, color: '#6c757d', marginBottom: 32 },
//   form: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
//   label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 12 },
//   input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
//   button: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
// });