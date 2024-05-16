import * as React from 'react';
import { Text } from 'react-native';

import { getInstance } from '@eppo/react-native-sdk';

export default function TestComponent(): JSX.Element {
  const assignedVariation = React.useMemo(() => {
    const eppoClient = getInstance();
    return eppoClient.getStringAssignment(
      'test-feature-flag',
      '<USER_ID>',
      {},
      'default-value'
    );
  }, []);

  var text = `In Variation: ${assignedVariation}`;
  if (assignedVariation === 'show-logo') {
    text = 'Assigned to logo group';
  }

  return <Text>{text}</Text>;
}
