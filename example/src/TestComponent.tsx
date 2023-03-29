import * as React from 'react';
import { Text } from 'react-native';

import { getInstance } from '@eppo/react-native-sdk';

export default function TestComponent(): JSX.Element {
  const assignedVariation = React.useMemo(() => {
    const eppoClient = getInstance();
    return eppoClient.getAssignment('<USER_ID', 'test-feature-flag');
  }, []);

  var text = 'In control';
  if (assignedVariation === 'show-logo') {
    text = 'Assigned to logo group';
  }

  return <Text>{text}</Text>;
}
