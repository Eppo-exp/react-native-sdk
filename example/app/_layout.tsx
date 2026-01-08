import * as React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import EppoRandomizationProvider from '@/components/EppoRandomizationProvider';

export default function RootLayout() {
  return (
    <EppoRandomizationProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </EppoRandomizationProvider>
  );
}
