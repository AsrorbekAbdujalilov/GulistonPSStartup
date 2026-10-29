/**
 * Phase 0: Security Rules Verification Spec for GulistanPS Startup Competition 26/27
 * Verifies that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyPayloadTest {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyPayloadTest[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof on Admin Role Update',
    collection: 'users_public',
    docId: 'user_target',
    operation: 'update',
    auth: { uid: 'spoof_admin', email: 'nosirovkamron622@gmail.com', email_verified: false },
    payload: { role: 'jury', isJury: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-Assigned Jury Privilege on Registration',
    collection: 'users_public',
    docId: 'user_attacker',
    operation: 'create',
    auth: { uid: 'user_attacker', email: 'student@gulistanps.uz', email_verified: true },
    payload: {
      uid: 'user_attacker',
      sevenDigitId: '1234567',
      name: 'Evil',
      surname: 'Student',
      grade: '10',
      role: 'jury',
      isJury: true,
      isSoftwareTutor: false,
      isHardwareTutor: false,
      teamId: '',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User Private PII Read',
    collection: 'users_private',
    docId: 'victim_uid',
    operation: 'get',
    auth: { uid: 'attacker_uid', email: 'attacker@gulistanps.uz', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Project',
    collection: 'projects',
    docId: 'proj_1',
    operation: 'create',
    auth: { uid: 'leader_1', email: 'leader@gulistanps.uz', email_verified: true },
    payload: {
      id: 'proj_1',
      leaderId: 'leader_1',
      isWinner: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Team Size Out of Range (5 members)',
    collection: 'projects',
    docId: 'proj_1',
    operation: 'create',
    auth: { uid: 'leader_1', email: 'leader@gulistanps.uz', email_verified: true },
    payload: {
      id: 'proj_1',
      leaderId: 'leader_1',
      targetTeamSize: 5,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Project Description Exceeding 250 Characters',
    collection: 'projects',
    docId: 'proj_1',
    operation: 'create',
    auth: { uid: 'leader_1', email: 'leader@gulistanps.uz', email_verified: true },
    payload: {
      id: 'proj_1',
      leaderId: 'leader_1',
      description: 'A'.repeat(251),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Identity Spoofing on Project Leader',
    collection: 'projects',
    docId: 'proj_1',
    operation: 'create',
    auth: { uid: 'attacker_1', email: 'attacker@gulistanps.uz', email_verified: true },
    payload: {
      id: 'proj_1',
      leaderId: 'victim_leader',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned Evaluation Write to Non-Existent Project',
    collection: 'evaluations',
    docId: 'eval_1',
    operation: 'create',
    auth: { uid: 'jury_1', email: 'jury@gulistanps.uz', email_verified: true },
    payload: {
      id: 'eval_1',
      projectId: 'non_existent_project',
      juryId: 'jury_1',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Evaluation MVP Score Out of Bounds (25 > 15)',
    collection: 'evaluations',
    docId: 'eval_1',
    operation: 'create',
    auth: { uid: 'jury_1', email: 'jury@gulistanps.uz', email_verified: true },
    payload: {
      id: 'eval_1',
      projectId: 'proj_1',
      juryId: 'jury_1',
      mvpScore: 25,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immortal Field Tampering (leaderId modification)',
    collection: 'projects',
    docId: 'proj_1',
    operation: 'update',
    auth: { uid: 'leader_1', email: 'leader@gulistanps.uz', email_verified: true },
    payload: {
      leaderId: 'new_leader',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Path ID Poisoning with Illegal Characters',
    collection: 'projects',
    docId: 'bad$id!@#',
    operation: 'create',
    auth: { uid: 'leader_1', email: 'leader@gulistanps.uz', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Client Timestamp Forgery on User Creation',
    collection: 'users_public',
    docId: 'user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@gulistanps.uz', email_verified: true },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
