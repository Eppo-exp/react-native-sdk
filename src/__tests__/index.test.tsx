import * as td from 'testdouble';

import type { EppoAsyncStorage } from 'src/async-storage';
import {
  VariationType,
  Flag,
  IAssignmentLogger,
  type IAssignmentEvent,
} from '@eppo/js-client-sdk-common';
import { EppoReactNativeClient, getInstance, init } from '..';
import {
  getTestAssignments,
  OBFUSCATED_MOCK_UFC_RESPONSE_FILE,
  readMockUfcResponse,
  testCasesByFileName,
  validateTestAssignments,
} from './testHelpers';

describe('EppoReactNativeClient integration test', () => {
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

  beforeEach(() => {
    EppoReactNativeClient.initialized = false;
  });

  afterAll(() => {
    getInstance()?.stopPolling();
    EppoReactNativeClient.initialized = false;
    jest.restoreAllMocks();
  });

  it('returns default value when experiment config is absent', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn(null);
    const client_instance = new EppoReactNativeClient({
      flagConfigurationStore: mockConfigStore,
    });
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
    const client_instance = new EppoReactNativeClient({
      flagConfigurationStore: mockConfigStore,
    });
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
    const client_instance = new EppoReactNativeClient({
      flagConfigurationStore: mockConfigStore,
    });
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getStringAssignment(
      flagKey,
      'subject-10',
      {},
      'default-value'
    );
    expect(assignment).toEqual('control');
  });

  it('handles a successful init', async () => {
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockExperimentConfig),
      });
    }) as jest.Mock;
    await init({
      apiKey: 'some-key',
      assignmentLogger: {
        logAssignment(assignment) {
          console.log('TODO: log', assignment);
        },
      },
      throwOnFailedInitialization: false,
    });
    expect(EppoReactNativeClient.initialized).toBe(true);
  });

  it('handles errors during init with throwOnFailedInitialization set to true', async () => {
    global.fetch = jest.fn(() => {
      return Promise.reject({
        ok: false,
        status: 500,
        text: 'Network error',
      });
    }) as jest.Mock;
    expect.assertions(2);
    try {
      await init({
        apiKey: 'some-key',
        assignmentLogger: {
          logAssignment(assignment) {
            console.log('TODO: log', assignment);
          },
        },
        throwOnFailedInitialization: true,
      });
    } catch (err: any) {
      expect(err.message).toBe('Network error');
    }
    expect(EppoReactNativeClient.initialized).toBe(false);
  });

  it('handles errors during init with throwOnFailedInitialization set to false', async () => {
    global.fetch = jest.fn(() => {
      return Promise.reject({
        ok: false,
        status: 500,
        text: 'Network error',
      });
    }) as jest.Mock;
    await init({
      apiKey: 'some-key',
      assignmentLogger: {
        logAssignment(assignment) {
          console.log('TODO: log', assignment);
        },
      },
      throwOnFailedInitialization: false,
    });
    expect(EppoReactNativeClient.initialized).toBe(false);
  });
});

describe('UFC Obfuscated Test Cases', () => {
  beforeAll(async () => {
    global.fetch = jest.fn(() => {
      const ufc = readMockUfcResponse(OBFUSCATED_MOCK_UFC_RESPONSE_FILE);

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ufc),
      });
    }) as jest.Mock;

    EppoReactNativeClient.initialized = false;
    await init({
      apiKey: 'dummy api key',
      assignmentLogger: { logAssignment(_assignment: IAssignmentEvent) {} },
    });
  });

  afterAll(() => {
    getInstance()?.stopPolling();
    jest.restoreAllMocks();
  });

  const testCases = testCasesByFileName();

  it.each(Object.keys(testCases))(
    'Shared obfuscated test case - %s',
    async (fileName: string) => {
      const testCase = testCases[fileName];
      if (!testCase) {
        throw new Error('Test case failed to load from ' + fileName);
      }
      const { flag, defaultValue, subjects, variationType } = testCase;

      const client = getInstance();

      const typeAssignmentFunctions = {
        [VariationType.BOOLEAN]: client.getBooleanAssignment.bind(client),
        [VariationType.NUMERIC]: client.getNumericAssignment.bind(client),
        [VariationType.INTEGER]: client.getIntegerAssignment.bind(client),
        [VariationType.STRING]: client.getStringAssignment.bind(client),
        [VariationType.JSON]: client.getJSONAssignment.bind(client),
      };

      const assignmentFn = typeAssignmentFunctions[variationType];
      if (!assignmentFn) {
        throw new Error(`Unknown variation type: ${variationType}`);
      }

      const assignments = getTestAssignments(
        { flag, variationType, defaultValue, subjects },
        assignmentFn,
        true
      );

      validateTestAssignments(assignments, flag);
    }
  );
});
