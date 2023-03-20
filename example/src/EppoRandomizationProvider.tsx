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
      baseUrl: 'https://qa.eppo.cloud/api',
      apiKey: 'mWJi3koIVP5jiGs0i9I4CISmLXpAYawwc1kp-1RaHJg',
      assignmentLogger : {
        logAssignment(assignment) {
          console.log('ASSIGNMENT', assignment);
        },
      },
    }).then(() => {
      return setIsInitialized(true);
    })
  }, []);

  if (!waitForInitialization || isInitialized) {
    return children;
  }
  return loadingComponent;
}