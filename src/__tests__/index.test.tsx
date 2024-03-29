import {
  IAssignmentTestCase,
  ValueTestType,
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
import type { EppoAsyncStorage } from 'src/async-storage';
import { EppoValue } from '@eppo/js-client-sdk-common/dist/eppo_value';

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

  it('assigns subject from overrides when experiment is enabled', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn({
      ...mockExperimentConfig,
      overrides: {
        '1b50f33aef8f681a13f623963da967ed': 'variant-2',
      },
      typedOverrides: {
        '1b50f33aef8f681a13f623963da967ed': 'variant-2',
      },
    });
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getAssignment('subject-10', flagKey);
    expect(assignment).toEqual('variant-2');
  });

  it('assigns subject from overrides when experiment is not enabled', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn({
      ...mockExperimentConfig,
      overrides: {
        '1b50f33aef8f681a13f623963da967ed': 'variant-2',
      },
      typedOverrides: {
        '1b50f33aef8f681a13f623963da967ed': 'variant-2',
      },
    });
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getAssignment('subject-10', flagKey);
    expect(assignment).toEqual('variant-2');
  });

  it('returns null when experiment config is absent', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn(null);
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    const assignment = client_instance.getAssignment('subject-10', flagKey);
    expect(assignment).toEqual(null);
  });

  it('logs variation assignment and experiment key', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
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

  it('handles logging exception', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockLogger.logAssignment(td.matchers.anything())).thenThrow(
      new Error('logging error')
    );
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
  });

  it('only returns variation if subject matches rules', () => {
    const mockConfigStore = td.object<EppoAsyncStorage>();
    const mockLogger = td.object<IAssignmentLogger>();
    td.when(mockConfigStore.get(flagKey)).thenReturn({
      ...mockExperimentConfig,
      rules: [
        {
          allocationKey: 'allocation1',
          conditions: [
            {
              operator: 'GT',
              attribute: 'appVersion',
              value: 10,
            },
          ],
        },
      ],
    });
    const client_instance = new EppoReactNativeClient(mockConfigStore);
    client_instance.setLogger(mockLogger);
    let assignment = client_instance.getAssignment('subject-10', flagKey, {
      appVersion: 9,
    });
    expect(assignment).toEqual(null);
    assignment = client_instance.getAssignment('subject-10', flagKey);
    expect(assignment).toEqual(null);
    assignment = client_instance.getAssignment('subject-10', flagKey, {
      appVersion: 11,
    });
    expect(assignment).toEqual('control');
  });

  describe('getAssignment', () => {
    const testData = readAssignmentTestData();
    it.each(testData)(
      'test variation assignment splits',
      ({
        experiment,
        valueType = ValueTestType.StringType,
        subjects,
        subjectsWithAttributes,
        expectedAssignments,
      }: IAssignmentTestCase) => {
        console.log(`---- Test Case for ${experiment} Experiment ----`);
        const assignments = getAssignmentsWithSubjectAttributes(
          subjectsWithAttributes
            ? subjectsWithAttributes
            : subjects.map((subject) => ({ subjectKey: subject })),
          experiment,
          valueType
        );

        switch (valueType) {
          case ValueTestType.BoolType: {
            const boolAssignments = assignments.map(
              (a) => a?.boolValue ?? null
            );
            expect(boolAssignments).toEqual(expectedAssignments);
            break;
          }
          case ValueTestType.NumericType: {
            const numericAssignments = assignments.map(
              (a) => a?.numericValue ?? null
            );
            expect(numericAssignments).toEqual(expectedAssignments);
            break;
          }
          case ValueTestType.StringType: {
            const stringAssignments = assignments.map(
              (a) => a?.stringValue ?? null
            );
            expect(stringAssignments).toEqual(expectedAssignments);
            break;
          }
          case ValueTestType.JSONType: {
            const jsonStringAssignments = assignments.map(
              (a) => a?.stringValue ?? null
            );
            expect(jsonStringAssignments).toEqual(expectedAssignments);
            break;
          }
        }
      }
    );

    it('runs expected number of test cases', () => {
      expect(testData.length).toBeGreaterThan(0);
    });
  });

  function getAssignmentsWithSubjectAttributes(
    subjectsWithAttributes: {
      subjectKey: string;
      subjectAttributes?: Record<string, any>;
    }[],
    experiment: string,
    valueTestType: ValueTestType = ValueTestType.StringType
  ): (EppoValue | null)[] {
    return subjectsWithAttributes.map((subject) => {
      switch (valueTestType) {
        case ValueTestType.BoolType: {
          const ba = client.getBoolAssignment(
            subject.subjectKey,
            experiment,
            subject.subjectAttributes
          );
          if (ba === null) return null;
          return EppoValue.Bool(ba);
        }
        case ValueTestType.NumericType: {
          const na = client.getNumericAssignment(
            subject.subjectKey,
            experiment,
            subject.subjectAttributes
          );
          if (na === null) return null;
          return EppoValue.Numeric(na);
        }
        case ValueTestType.StringType: {
          const sa = client.getStringAssignment(
            subject.subjectKey,
            experiment,
            subject.subjectAttributes
          );
          if (sa === null) return null;
          return EppoValue.String(sa);
        }
        case ValueTestType.JSONType: {
          const sa = client.getJSONStringAssignment(
            subject.subjectKey,
            experiment,
            subject.subjectAttributes
          );
          const oa = client.getParsedJSONAssignment(
            subject.subjectKey,
            experiment,
            subject.subjectAttributes
          );
          if (oa == null || sa === null) return null;
          return EppoValue.JSON(sa, oa);
        }
      }
    });
  }
});
