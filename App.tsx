import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getProfile, initDB } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';

export default function App() {
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      const profile = await getProfile();
      setHasProfile(!!profile);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator hasProfile={hasProfile} />
    </>
  );
}