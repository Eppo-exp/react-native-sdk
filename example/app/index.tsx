import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import TestComponent from '@/components/TestComponent';

export default function App() {
  return (
    <View style={styles.container}>
      <TestComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
