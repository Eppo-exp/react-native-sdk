import * as td from 'testdouble';

import type { EppoAsyncStorage } from 'src/async-storage';
import {
  VariationType,
  Flag,
  IAssignmentLogger,
} from '@eppo/js-client-sdk-common';
import { EppoReactNativeClient } from '..';

describe('EppoReactNativeClient E2E test', () => {
  const flagKey = 'mock-experiment';

  const mockExperimentConfig: Flag = {
    key: flagKey,
    enabled: true,
    variationType: VariationType.STRING,
    variations: {
      'control': {
        key: 'control',
        value: 'control',
      },
      'variant-1': {
        key: 'variant-1',
        value: 'variant-1',
      },
      'variant-2': {
        key: 'variant-2',
        value: 'variant-2',
      },
    },
    allocations: [
      {
        key: 'allocation1',
        rules: [],
        splits: [
          {
            shards: [
              {
                salt: 'some-salt',
                ranges: [
                  {
                    start: 0,
                    end: 34,
                  },
                ],
              },
            ],
            variationKey: 'control',
          },
          {
            variationKey: 'variant-1',
            shards: [
              {
                salt: 'some-salt',
                ranges: [
                  {
                    start: 34,
                    end: 67,
                  },
                ],
              },
            ],
          },
          {
            variationKey: 'variant-2',
            shards: [
              {
                salt: 'some-salt',
                ranges: [
                  {
                    start: 67,
                    end: 100,
                  },
                ],
              },
            ],
          },
        ],
        doLog: true,
      },
    ],
    totalShards: 100,
  };

  beforeAll(async () => {
    global.fetch = jest.fn(() => {
      return Promise.reject({
        ok: false,
        status: 404,
        text: 'Remote requests are not allowed.',
      });
    }) as jest.Mock;
  });

  it('returns default value when experiment config is absent', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn(null);
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getStringAssignment(
      flagKey,
      'subject-10',
      {},
      'default-value'
    );
    expect(assignment).toEqual('default-value');
  });

  it('logs variation assignment and experiment key', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn(mockExperimentConfig);
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getStringAssignment(
      flagKey,
      'subject-10',
      {},
      'default-value'
    );
    expect(assignment).toEqual('control');
    expect(td.explain(mockLogger.logAssignment).callCount).toEqual(1);
    expect(
      td.explain(mockLogger?.logAssignment).calls[0]?.args[0].subject
    ).toEqual('subject-10');
    expect(
      td.explain(mockLogger?.logAssignment).calls[0]?.args[0].featureFlag
    ).toEqual(flagKey);
    expect(
      td.explain(mockLogger?.logAssignment).calls[0]?.args[0].experiment
    ).toEqual(`${flagKey}-${mockExperimentConfig?.allocations[0]?.key}`);
    expect(
      td.explain(mockLogger?.logAssignment).calls[0]?.args[0].allocation
    ).toEqual(`${mockExperimentConfig?.allocations[0]?.key}`);
  });

  it('handles logging exception', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockLogger.logAssignment(td.matchers.anything())).thenThrow(
      new Error('logging error')
    );
    td.when(mockConfigStore.get(flagKey)).thenReturn(mockExperimentConfig);
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getStringAssignment(
      flagKey,
      'subject-10',
      {},
      'default-value'
    );
    expect(assignment).toEqual('control');
  });
});
