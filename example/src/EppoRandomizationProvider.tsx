import * as React from 'react';

import { useEffect, useState } from 'react';
import { Text } from 'react-native';

//import { init } from '@eppo/react-native-sdk';
const eppo = require('@eppo/react-native-sdk');

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
    eppo
      .init({
        baseUrl: 'https://eppo.cloud/api',
        apiKey: '<API_KEY>',
        assignmentLogger: {
          logAssignment(assignment: any) {
            console.log('ASSIGNMENT', assignment);
          },
        },
      })
      .then(() => {
        return setIsInitialized(true);
      });
  }, []);

  if (!waitForInitialization || isInitialized) {
    return children;
  }
  return loadingComponent;
}
