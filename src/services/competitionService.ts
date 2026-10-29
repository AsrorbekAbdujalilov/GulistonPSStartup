import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import type {
  CompetitionState,
  Evaluation,
  ProjectRankingSummary,
  ProjectSubmission,
  TutorMessage,
  UserAccount,
} from '../types';

export async function fetchCompetitionState(): Promise<CompetitionState> {
  const res = await fetch('/api/state');
  if (!res.ok) {
    throw new Error('Failed to load competition state');
  }
  return res.json();
}

export async function lookupParticipantBySevenDigitId(sevenDigitId: string): Promise<{
  found: boolean;
  participant?: {
    uid: string;
    sevenDigitId: string;
    name: string;
    surname: string;
    grade: string;
  };
}> {
  const clean = sevenDigitId.trim();
  if (!/^[0-9]{7}$/.test(clean)) {
    return { found: false };
  }
  const res = await fetch(`/api/users/lookup/${encodeURIComponent(clean)}`);
  if (!res.ok) {
    return { found: false };
  }
  return res.json();
}

export async function syncUserToFirestoreIfSignedIn(user: UserAccount): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== user.uid) return;
  const publicPath = `users_public/${user.uid}`;
  try {
    await setDoc(
      doc(db, 'users_public', user.uid),
      {
        uid: user.uid,
        sevenDigitId: user.sevenDigitId,
        name: user.name.slice(0, 80),
        surname: user.surname.slice(0, 80),
        grade: user.grade.slice(0, 30),
        role: user.role,
        isJury: user.isJury,
        isSoftwareTutor: user.isSoftwareTutor,
        isHardwareTutor: user.isHardwareTutor,
        teamId: user.teamId || '',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, publicPath);
  }

  if (user.email) {
    const privatePath = `users_private/${user.uid}`;
    try {
      await setDoc(
        doc(db, 'users_private', user.uid),
        {
          uid: user.uid,
          email: user.email.slice(0, 160),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, privatePath);
    }
  }
}

export async function syncProjectToFirestoreIfSignedIn(
  project: ProjectSubmission
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== project.leaderId) return;
  const path = `projects/${project.id}`;
  try {
    await setDoc(
      doc(db, 'projects', project.id),
      {
        id: project.id,
        leaderId: project.leaderId,
        teamName: project.teamName.slice(0, 100),
        targetTeamSize: project.targetTeamSize,
        teamLogoUrl: (project.teamLogoUrl || '').slice(0, 150000),
        projectName: (project.projectName || 'Draft Project').slice(0, 120),
        projectLogoUrl: (project.projectLogoUrl || '').slice(0, 150000),
        projectType: project.projectType,
        description: (project.description || 'Pending project description').slice(
          0,
          250
        ),
        subjects:
          project.subjects.length > 0
            ? project.subjects.slice(0, 10)
            : ['informatics'],
        githubRepo: (project.githubRepo || 'https://github.com/gulistanps').slice(
          0,
          500
        ),
        presentationUrl: (
          project.presentationUrl || 'https://gulistanps.uz'
        ).slice(0, 150000),
        videoUrl: (project.videoUrl || '').slice(0, 150000),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncEvaluationToFirestoreIfSignedIn(
  evaluation: Evaluation
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== evaluation.juryId) return;
  const path = `evaluations/${evaluation.id}`;
  try {
    await setDoc(
      doc(db, 'evaluations', evaluation.id),
      {
        id: evaluation.id,
        projectId: evaluation.projectId,
        juryId: evaluation.juryId,
        mvpScore: evaluation.mvpScore,
        ideaScore: evaluation.ideaScore,
        presentationScore: evaluation.presentationScore,
        technicalScore: evaluation.technicalScore,
        activenessScore: evaluation.activenessScore,
        maxScore: evaluation.maxScore,
        normalizedScore: evaluation.normalizedScore,
        feedback: (evaluation.feedback || '').slice(0, 1000),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loginWithCredentials(
  identifier: string,
  password: string
): Promise<UserAccount> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data.user;
}

export async function registerParticipant(payload: {
  name: string;
  surname: string;
  grade: string;
  email: string;
  password: string;
}): Promise<UserAccount> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data.user;
}

export async function createStaffAccount(payload: {
  adminUid: string;
  name: string;
  surname: string;
  login: string;
  password: string;
  isJury: boolean;
  isSoftwareTutor: boolean;
  isHardwareTutor: boolean;
}): Promise<{ user: UserAccount; users: UserAccount[] }> {
  const res = await fetch('/api/admin/create-staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register Jury/Tutor account');
  }
  return data;
}

export async function syncGoogleLogin(payload: {
  uid: string;
  email: string;
  displayName?: string;
}): Promise<UserAccount> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Google login sync failed');
  }
  await syncUserToFirestoreIfSignedIn(data.user);
  return data.user;
}

export async function changeUserPassword(payload: {
  uid: string;
  currentPassword?: string;
  newPassword: string;
  adminOverrideUid?: string;
}): Promise<void> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password change failed');
  }
}

export async function updateRolePromotions(payload: {
  adminUid: string;
  targetUid: string;
  isJury: boolean;
  isSoftwareTutor: boolean;
  isHardwareTutor: boolean;
}): Promise<UserAccount[]> {
  const res = await fetch('/api/admin/promote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Promotion failed');
  }
  return data.users;
}

export async function saveProjectSubmission(
  payload: Partial<ProjectSubmission> & { leaderId: string }
): Promise<{ project: ProjectSubmission; projects: ProjectSubmission[] }> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save project');
  }
  await syncProjectToFirestoreIfSignedIn(data.project);
  return data;
}

export async function respondToTeamInvite(payload: {
  projectId: string;
  userId: string;
  decision: 'approved' | 'declined';
}): Promise<{
  project: ProjectSubmission;
  projects: ProjectSubmission[];
  users: UserAccount[];
}> {
  const res = await fetch(`/api/projects/${payload.projectId}/invite-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: payload.userId, decision: payload.decision }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to respond to invitation');
  }
  return data;
}

export async function submitJuryEvaluation(payload: {
  projectId: string;
  juryId: string;
  mvpScore: number;
  ideaScore: number;
  presentationScore: number;
  technicalScore: number;
  activenessScore?: number;
  feedback?: string;
}): Promise<{ evaluation: Evaluation; evaluations: Evaluation[] }> {
  const res = await fetch('/api/evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit evaluation');
  }
  await syncEvaluationToFirestoreIfSignedIn(data.evaluation);
  return data;
}

export async function postTutorMessage(payload: {
  projectId: string;
  senderId: string;
  targetTutor: 'software' | 'hardware' | 'both';
  content: string;
}): Promise<{ message: TutorMessage; messages: TutorMessage[] }> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send message');
  }
  return data;
}

export function computeProjectRankings(
  projects: ProjectSubmission[],
  evaluations: Evaluation[]
): ProjectRankingSummary[] {
  const summaries: ProjectRankingSummary[] = projects.map((project) => {
    const projEvals = evaluations.filter((e) => e.projectId === project.id);
    const tutorEvals = projEvals.filter((e) => e.isTutorEvaluation);
    const regularEvals = projEvals.filter((e) => !e.isTutorEvaluation);

    const avg =
      projEvals.length > 0
        ? Number(
            (
              projEvals.reduce((acc, curr) => acc + curr.normalizedScore, 0) /
              projEvals.length
            ).toFixed(2)
          )
        : 0;

    return {
      project,
      evaluations: projEvals,
      tutorEvaluations: tutorEvals,
      regularEvaluations: regularEvals,
      averageNormalizedScore: avg,
      rank: null,
    };
  });

  summaries.sort((a, b) => b.averageNormalizedScore - a.averageNormalizedScore);

  summaries.forEach((item, index) => {
    if (item.evaluations.length > 0) {
      item.rank = index + 1;
    }
  });

  return summaries;
}
