import * as React from 'react';
import { Text } from 'react-native';

import { getInstance } from '@eppo/react-native-sdk';

export default function TestComponent(): JSX.Element {
  const assignedVariation = React.useMemo(() => {
    const eppoClient = getInstance();
    return eppoClient.getAssignment('user-id-1', 'nicks-react-native');
  }, []);

  var text = 'In control';
  if (assignedVariation === 'ShowLogo') {
    text = 'Assigned to logo group';
  }

  return <Text>{text}</Text>;
}
