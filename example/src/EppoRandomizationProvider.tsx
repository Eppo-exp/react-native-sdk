import * as React from 'react';

import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { init } from '@eppo/react-native-sdk';

interface IEppoRandomizationProvider {
  waitForInitialization?: boolean;
  children: JSX.Element;
  loadingComponent?: JSX.Element;
}

export default function EppoRandomizationProvider({
  waitForInitialization = true,
  children,
  loadingComponent = <Text>Loading...</Text>,
}: IEppoRandomizationProvider): JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    init({
      apiKey: '<API_KEY>',
      assignmentLogger: {
        logAssignment(assignment) {
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
