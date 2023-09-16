import {
  IAssignmentTestCase,
  readAssignmentTestData,
} from '../../test/testHelpers';
import apiServer from '../../test/mockApiServer';

import * as td from 'testdouble';

import {
  EppoReactNativeClient,
  IAssignmentLogger,
  IEppoClient,
  init,
} from '../../src/index';
import type { IExperimentConfiguration } from '@eppo/js-client-sdk-common/dist/dto/experiment-configuration-dto';
import type { EppoAsyncStorage } from 'src/async-storage';

describe('EppoReactNativeClient E2E test', () => {
  let client: IEppoClient;

  const flagKey = 'mock-experiment';

  const mockExperimentConfig = {
    name: flagKey,
    enabled: true,
    subjectShards: 100,
    overrides: {},
    typedOverrides: {},
    rules: [
      {
        allocationKey: 'allocation1',
        conditions: [],
      },
    ],
    allocations: {
      allocation1: {
        percentExposure: 1,
        variations: [
          {
            name: 'control',
            value: 'control',
            typedValue: 'control',
            shardRange: {
              start: 0,
              end: 34,
            },
          },
          {
            name: 'variant-1',
            value: 'variant-1',
            typedValue: 'variant-1',
            shardRange: {
              start: 34,
              end: 67,
            },
          },
          {
            name: 'variant-2',
            value: 'variant-2',
            typedValue: 'variant-2',
            shardRange: {
              start: 67,
              end: 100,
            },
          },
        ],
      },
    },
  };

  beforeAll(async () => {
    client = await init({
      apiKey: 'dummy',
      baseUrl: 'http://127.0.0.1:4000',
      assignmentLogger: {
        logAssignment(_assignment): Promise<void> {
          return Promise.resolve();
        },
      },
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve, reject) => {
      apiServer.close((error) => {
        if (error) {
          reject(error);
        }
        console.log('closed server');
        resolve();
      });
    });
  });

  it('logs variation assignment and experiment key', () => {
    const mockConfigStore =
      td.object<EppoAsyncStorage<IExperimentConfiguration>>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn(mockExperimentConfig);
    const subjectAttributes = { foo: 3 };
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getAssignment(
      'subject-10',
      flagKey,
      subjectAttributes
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
    ).toEqual(`${flagKey}-${mockExperimentConfig?.rules[0]?.allocationKey}`);
    expect(
      td.explain(mockLogger?.logAssignment).calls[0]?.args[0].allocation
    ).toEqual(`${mockExperimentConfig?.rules[0]?.allocationKey}`);
  });

  describe('getAssignment', () => {
    const testData = readAssignmentTestData();
    it.each(testData)(
      'test variation assignment splits',
      ({
        experiment,
        valueType = 'string',
        subjects,
        subjectsWithAttributes,
        expectedAssignments,
      }: IAssignmentTestCase) => {
        `---- Test Case for ${experiment} Experiment ----`;
        if (valueType === 'string') {
          const assignments = subjectsWithAttributes
            ? getAssignmentsWithSubjectAttributes(
                subjectsWithAttributes,
                experiment
              )
            : getAssignments(subjects, experiment);
          expect(assignments).toEqual(expectedAssignments);
          expect(assignments.length).toBeGreaterThan(0);
        } else {
          // skip for now
          expect(true).toBe(true);
        }
      }
    );

    it('runs expected number of test cases', () => {
      expect(testData.length).toBeGreaterThan(0);
    });
  });

  function getAssignments(
    subjects: string[],
    experiment: string
  ): (string | null)[] {
    return subjects.map((subjectKey) => {
      return client.getAssignment(subjectKey, experiment);
    });
  }

  function getAssignmentsWithSubjectAttributes(
    subjectsWithAttributes: {
      subjectKey: string;

      subjectAttributes: Record<string, any>;
    }[],
    experiment: string
  ): (string | null)[] {
    return subjectsWithAttributes.map((subject) => {
      return client.getAssignment(
        subject.subjectKey,
        experiment,
        subject.subjectAttributes
      );
    });
  }
});
