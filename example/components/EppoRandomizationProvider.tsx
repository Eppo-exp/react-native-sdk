import * as React from 'react';

import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { init } from '@eppo/react-native-sdk';

interface IEppoRandomizationProvider {
  waitForInitialization?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export default function EppoRandomizationProvider({
  waitForInitialization = true,
  children,
  loadingComponent = <Text>Loading...</Text>,
}: IEppoRandomizationProvider) {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_EPPO_API_KEY;
    if (!apiKey) {
      console.error('EXPO_PUBLIC_EPPO_API_KEY is not set');
      return;
    }

    init({
      apiKey,
      assignmentLogger: {
        logAssignment(assignment: any) {
          console.log('ASSIGNMENT', assignment);
        },
      },
    }).then(() => {
      return setIsInitialized(true);
    });
  }, []);

  if (!waitForInitialization || isInitialized) {
    return children;
  }
  return loadingComponent;
}
