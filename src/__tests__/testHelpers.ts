import * as fs from 'fs';
import * as path from 'node:path';

import type {
  Flag,
  VariationType,
  AttributeType,
} from '@eppo/js-client-sdk-common';

export const TEST_DATA_DIR = path.resolve(__dirname, 'data', 'ufc');
export const ASSIGNMENT_TEST_DATA_DIR = path.join(TEST_DATA_DIR, 'tests');
export const OBFUSCATED_MOCK_UFC_RESPONSE_FILE = `flags-v1-obfuscated.json`;

export interface SubjectTestCase {
  subjectKey: string;
  subjectAttributes: Record<string, AttributeType>;
  assignment: string | number | boolean | object;
}

export interface IAssignmentTestCase {
  flag: string;
  variationType: VariationType;
  defaultValue: string | number | boolean | object;
  subjects: SubjectTestCase[];
}

export function readMockUfcResponse(filename: string): {
  flags: Record<string, Flag>;
} {
  return JSON.parse(
    fs.readFileSync(path.join(TEST_DATA_DIR, filename), 'utf-8')
  );
}

export function testCasesByFileName(): Record<string, IAssignmentTestCase> {
  const testDirectory = ASSIGNMENT_TEST_DATA_DIR;
  const testCasesWithFileName: Array<
    IAssignmentTestCase & { fileName: string }
  > = fs.readdirSync(testDirectory).map((fileName) => ({
    ...JSON.parse(fs.readFileSync(path.join(testDirectory, fileName), 'utf8')),
    fileName,
  }));
  if (!testCasesWithFileName.length) {
    throw new Error('No test cases at ' + testDirectory);
  }
  const mappedTestCase: Record<string, IAssignmentTestCase> = {};
  testCasesWithFileName.forEach((testCaseWithFileName) => {
    mappedTestCase[testCaseWithFileName.fileName] = testCaseWithFileName;
  });

  return mappedTestCase;
}

export function getTestAssignments(
  testCase: IAssignmentTestCase,
  assignmentFn: any,
  obfuscated = false
): {
  subject: SubjectTestCase;
  assignment: string | boolean | number | object;
}[] {
  const assignments: {
    subject: SubjectTestCase;
    assignment: string | boolean | number | object;
  }[] = [];
  for (const subject of testCase.subjects) {
    const assignment =
      assignmentFn(
        testCase.flag,
        subject.subjectKey,
        subject.subjectAttributes,
        testCase.defaultValue,
        obfuscated
      ) || testCase.defaultValue; // Fallback to defaultValue if null
    assignments.push({ subject: subject, assignment: assignment });
  }
  return assignments;
}

export function validateTestAssignments(
  assignments: {
    subject: SubjectTestCase;
    assignment: string | boolean | number | object;
  }[],
  flag: string
) {
  expect(assignments.length).toBeGreaterThan(0);
  for (const { subject, assignment } of assignments) {
    if (typeof assignment !== 'object') {
      // the expect works well for objects, but this comparison does not
      if (assignment !== subject.assignment) {
        throw new Error(
          `subject ${
            subject.subjectKey
          } was assigned ${assignment?.toString()} when expected ${subject.assignment?.toString()} for flag ${flag}`
        );
      }
    }
    expect(subject.assignment).toEqual(assignment);
  }
}
