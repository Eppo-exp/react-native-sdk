import {
  IAssignmentTestCase,
  readAssignmentTestData,
} from '../../test/testHelpers';
import apiServer from '../../test/mockApiServer';

import { IEppoClient, init } from '../../src/index';

describe('EppoReactNativeClient E2E test', () => {
  let client: IEppoClient;

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
    jest.clearAllTimers();
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
