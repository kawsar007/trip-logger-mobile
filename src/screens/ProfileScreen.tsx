import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfile, saveProfile } from '../db/database';
import { COLORS } from '../theme/colors';
import { Profile } from '../types';

// Developer Contact Information
const DEVELOPER_WHATSAPP = '+8801638600627'; // Replace with actual number
const DEVELOPER_NAME = 'Kawsar'; // Replace with actual name
const APP_VERSION = '1.0.1'; // Replace with actual version

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    designation: '',
    phone: '',
    company: '',
  });

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email) {
      Alert.alert('Required Fields', 'Name and Email are required');
      return;
    }

    try {
      await saveProfile(profile);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hello! I am using your Trip Logger app.');
    const url = `whatsapp://send?phone=${DEVELOPER_WHATSAPP}&text=${message}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            'WhatsApp Not Installed',
            'Please install WhatsApp to contact the developer.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Install WhatsApp',
                onPress: () => {
                  const playStoreUrl = 'market://details?id=com.whatsapp';
                  const appStoreUrl = 'https://apps.apple.com/app/whatsapp-messenger/id310633997';
                  Linking.openURL(Platform.OS === 'ios' ? appStoreUrl : playStoreUrl);
                },
              },
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open WhatsApp');
        console.error('WhatsApp error:', err);
      });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Manage your personal information</Text>
          </View>

          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>👤 </Text>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(v) => handleChange('name', v)}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>📧 </Text>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(v) => handleChange('email', v)}
                placeholder="john@example.com"
                placeholderTextColor={COLORS.textSecondary || '#999'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>📱 </Text>
                Phone Number
              </Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(v) => handleChange('phone', v)}
                placeholder="+44 7700 900000"
                placeholderTextColor={COLORS.textSecondary || '#999'}
                keyboardType="phone-pad"
              />
            </View>

            {/* Company Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>🏢 </Text>
                Company
              </Text>
              <TextInput
                style={styles.input}
                value={profile.company}
                onChangeText={(v) => handleChange('company', v)}
                placeholder="Acme Corporation"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            {/* Designation Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelIcon}>💼 </Text>
                Designation / Title
              </Text>
              <TextInput
                style={styles.input}
                value={profile.designation}
                onChangeText={(v) => handleChange('designation', v)}
                placeholder="Software Engineer"
                placeholderTextColor={COLORS.textSecondary || '#999'}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>💾 Save Profile</Text>
            </TouchableOpacity>
          </View>

          {/* App Info Section */}
          <View style={styles.appInfoSection}>
            <Text style={styles.appInfoTitle}>App Information</Text>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>{APP_VERSION}</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Platform</Text>
              <Text style={styles.appInfoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            </View>
          </View>

          {/* Developer Contact - Compact Footer */}
          <View style={styles.developerFooter}>
            <View style={styles.footerDivider} />

            <View style={styles.developerCompact}>
              <View style={styles.developerTextContainer}>
                <Text style={styles.footerLabel}>Need help?</Text>
                <Text style={styles.developerNameSmall}>
                  Chat with developer
                </Text>
              </View>

              <TouchableOpacity
                style={styles.whatsappButtonCompact}
                onPress={openWhatsApp}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                <Text style={styles.whatsappTextCompact}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerCopyright}>
              © 2026 REHAM • Made with ❤️
            </Text>
          </View>

          <View style={{ height: 30 }} />
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
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // App Info Section
  appInfoSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appInfoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
  },
  appInfoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },

  // Developer Footer - Compact Design
  developerFooter: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  developerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  developerTextContainer: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  developerNameSmall: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  whatsappButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#25D366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  whatsappTextCompact: {
    fontSize: 13,
    color: '#25D366',
    fontWeight: '700',
  },
  footerCopyright: {
    fontSize: 11,
    color: COLORS.textSecondary || '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
});




// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
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
//   const [avatarUri, setAvatarUri] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   const loadProfile = async () => {
//     try {
//       const data = await getProfile();
//       if (data) {
//         setProfile(data);
//         setForm(data);
//       } else {
//         // If no profile exists, start in editing mode
//         setEditing(true);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load profile.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (field: keyof Profile, value: string) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   };

//   const pickImage = async () => {
//     // Request permission
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (status !== 'granted') {
//       Alert.alert('Permission Required', 'Please grant permission to access your photos.');
//       return;
//     }

//     // Pick image
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setAvatarUri(result.assets[0].uri);
//     }
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.email) {
//       Alert.alert('Required Fields', 'Name and Email are required.');
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(form.email)) {
//       Alert.alert('Invalid Email', 'Please enter a valid email address.');
//       return;
//     }

//     try {
//       await saveProfile(form);
//       setProfile(form);
//       setEditing(false);
//       Alert.alert('Success', 'Profile updated successfully! ✅');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update profile.');
//     }
//   };

//   const handleCancel = () => {
//     setEditing(false);
//     if (profile) {
//       setForm(profile);
//     }
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.center}>
//           <Text style={styles.loadingText}>Loading profile...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header Section */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Profile</Text>
//           {!editing && (
//             <TouchableOpacity
//               style={styles.editIconButton}
//               onPress={() => setEditing(true)}
//             >
//               <Ionicons name="create-outline" size={24} color={COLORS.primary} />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Avatar Section */}
//         <View style={styles.avatarContainer}>
//           <TouchableOpacity
//             style={styles.avatarWrapper}
//             onPress={editing ? pickImage : undefined}
//             activeOpacity={editing ? 0.7 : 1}
//           >
//             {avatarUri ? (
//               <Image source={{ uri: avatarUri }} style={styles.avatar} />
//             ) : (
//               <View style={styles.avatarPlaceholder}>
//                 <Text style={styles.avatarInitials}>
//                   {form.name ? getInitials(form.name) : '👤'}
//                 </Text>
//               </View>
//             )}
//             {editing && (
//               <View style={styles.cameraIconContainer}>
//                 <Ionicons name="camera" size={20} color="#fff" />
//               </View>
//             )}
//           </TouchableOpacity>
//           {editing && (
//             <Text style={styles.avatarHint}>Tap to change photo</Text>
//           )}
//         </View>

//         {editing ? (
//           /* EDIT MODE */
//           <View style={styles.form}>
//             <Text style={styles.sectionTitle}>Personal Information</Text>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>
//                 <Ionicons name="person-outline" size={16} color={COLORS.text} /> Full Name <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.name}
//                 onChangeText={v => handleChange('name', v)}
//                 placeholder="John Doe"
//                 placeholderTextColor={COLORS.textSecondary || '#999'}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>
//                 <Ionicons name="mail-outline" size={16} color={COLORS.text} /> Email <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.email}
//                 onChangeText={v => handleChange('email', v)}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 placeholder="john.doe@example.com"
//                 placeholderTextColor={COLORS.textSecondary || '#999'}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>
//                 <Ionicons name="briefcase-outline" size={16} color={COLORS.text} /> Designation
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.designation}
//                 onChangeText={v => handleChange('designation', v)}
//                 placeholder="Software Engineer"
//                 placeholderTextColor={COLORS.textSecondary || '#999'}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>
//                 <Ionicons name="call-outline" size={16} color={COLORS.text} /> Phone Number
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.phone}
//                 onChangeText={v => handleChange('phone', v)}
//                 keyboardType="phone-pad"
//                 placeholder="+1 (555) 123-4567"
//                 placeholderTextColor={COLORS.textSecondary || '#999'}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>
//                 <Ionicons name="business-outline" size={16} color={COLORS.text} /> Company Name
//               </Text>
//               <TextInput
//                 style={styles.input}
//                 value={form.company}
//                 onChangeText={v => handleChange('company', v)}
//                 placeholder="Acme Corporation"
//                 placeholderTextColor={COLORS.textSecondary || '#999'}
//               />
//             </View>

//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 style={[styles.button, styles.saveButton]}
//                 onPress={handleSave}
//                 activeOpacity={0.8}
//               >
//                 <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Save Changes</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, styles.cancelButton]}
//                 onPress={handleCancel}
//                 activeOpacity={0.8}
//               >
//                 <Ionicons name="close-circle-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           /* VIEW MODE */
//           <View style={styles.card}>
//             {profile?.name && (
//               <Text style={styles.profileName}>{profile.name}</Text>
//             )}
//             {profile?.designation && (
//               <Text style={styles.profileDesignation}>{profile.designation}</Text>
//             )}

//             <View style={styles.divider} />

//             <View style={styles.infoSection}>
//               <View style={styles.infoRow}>
//                 <View style={styles.iconCircle}>
//                   <Ionicons name="mail" size={20} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.infoContent}>
//                   <Text style={styles.infoLabel}>Email</Text>
//                   <Text style={styles.infoValue}>{profile?.email || '—'}</Text>
//                 </View>
//               </View>

//               <View style={styles.infoRow}>
//                 <View style={styles.iconCircle}>
//                   <Ionicons name="call" size={20} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.infoContent}>
//                   <Text style={styles.infoLabel}>Phone</Text>
//                   <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
//                 </View>
//               </View>

//               <View style={styles.infoRow}>
//                 <View style={styles.iconCircle}>
//                   <Ionicons name="business" size={20} color={COLORS.primary} />
//                 </View>
//                 <View style={styles.infoContent}>
//                   <Text style={styles.infoLabel}>Company</Text>
//                   <Text style={styles.infoValue}>{profile?.company || 'Not provided'}</Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.editButton}
//               onPress={() => setEditing(true)}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="create-outline" size={20} color="#fff" />
//               <Text style={styles.editButtonText}>Edit Profile</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* <TouchableOpacity
//           style={[styles.button, styles.cancelButton, { marginTop: 24 }]}
//           onPress={() => {
//             Alert.alert('Reset Data', 'Are you sure you want to clear all data? This action cannot be undone.', [
//               { text: 'Cancel', style: 'cancel' },
//               {
//                 text: 'Yes, Clear',
//                 style: 'destructive',
//                 onPress: async () => {
//                   try {
//                     await clearAllData();
//                     setProfile(null);
//                     setForm({
//                       name: '',
//                       email: '',
//                       designation: '',
//                       phone: '',
//                       company: '',
//                     });
//                     setAvatarUri(null);
//                     setEditing(true);
//                     Alert.alert('Data Cleared', 'All data has been cleared successfully.');
//                   } catch (error) {
//                     Alert.alert('Error', 'Failed to clear data.');
//                   }
//                 },
//               },
//             ]);
//           }}
//         >
//           <Ionicons name="trash-outline" size={20} color="#fff" />
//           <Text style={styles.buttonText}>Clear All Data</Text>
//         </TouchableOpacity> */}

//         <View style={{ height: 40 }} />
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
//     backgroundColor: COLORS.background,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   loadingText: {
//     fontSize: 16,
//     color: COLORS.text,
//   },

//   // Header
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 20,
//     paddingBottom: 16,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '800',
//     color: COLORS.text,
//   },
//   editIconButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.card,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },

//   // Avatar
//   avatarContainer: {
//     alignItems: 'center',
//     paddingVertical: 24,
//   },
//   avatarWrapper: {
//     position: 'relative',
//   },
//   avatar: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 4,
//     borderColor: COLORS.card,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   avatarPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 4,
//     borderColor: COLORS.card,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   avatarInitials: {
//     fontSize: 40,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   cameraIconContainer: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: COLORS.primary,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: COLORS.card,
//   },
//   avatarHint: {
//     marginTop: 12,
//     fontSize: 13,
//     color: COLORS.textSecondary || '#666',
//     fontWeight: '500',
//   },

//   // Profile View Mode
//   card: {
//     backgroundColor: COLORS.card,
//     marginHorizontal: 24,
//     borderRadius: 20,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   profileName: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.text,
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   profileDesignation: {
//     fontSize: 16,
//     color: COLORS.textSecondary || '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//     fontWeight: '500',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: COLORS.border,
//     marginVertical: 20,
//   },
//   infoSection: {
//     gap: 20,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   iconCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: `${COLORS.primary}15`,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   infoContent: {
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.textSecondary || '#666',
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   editButton: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 32,
//     gap: 8,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   editButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },

//   // Edit Mode
//   form: {
//     backgroundColor: COLORS.card,
//     marginHorizontal: 24,
//     borderRadius: 20,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 20,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//     marginBottom: 8,
//     letterSpacing: 0.3,
//   },
//   required: {
//     color: '#FF3B30',
//     fontWeight: '700',
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: COLORS.border,
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     color: COLORS.text,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//     marginTop: 12,
//   },
//   button: {
//     flex: 1,
//     flexDirection: 'row',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   saveButton: {
//     backgroundColor: COLORS.primary,
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//     shadowColor: '#6c757d',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
// });
