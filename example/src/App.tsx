import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import EppoRandomizationProvider from './EppoRandomizationProvider';
import TestComponent from './TestComponent';

export default function App() {
  return (
    <View style={styles.container}>
      <EppoRandomizationProvider>
        <TestComponent />
      </EppoRandomizationProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
