export type Language = 'uz' | 'en' | 'ru';

export type UserRole =
  | 'participant'
  | 'jury'
  | 'software_tutor'
  | 'hardware_tutor'
  | 'admin';

export interface UserAccount {
  uid: string;
  sevenDigitId: string;
  username?: string;
  email: string;
  password?: string;
  name: string;
  surname: string;
  grade: string;
  role: UserRole;
  isAdmin: boolean;
  isJury: boolean;
  isSoftwareTutor: boolean;
  isHardwareTutor: boolean;
  teamId: string;
  createdAt: string;
}

export interface TeamMemberInvite {
  sevenDigitId: string;
  userId: string;
  name: string;
  surname: string;
  grade: string;
  status: 'pending' | 'approved' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

export type ProjectType = 'Robotics' | 'Software' | 'Hardware+Software';

export type SubjectKey =
  | 'chemistry'
  | 'biology'
  | 'physics'
  | 'mathematics'
  | 'informatics'
  | 'geography_ecology'
  | 'economics'
  | 'engineering_design'
  | 'literature_languages'
  | 'history_social';

export interface TutorMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  targetTutor: 'software' | 'hardware' | 'both';
  content: string;
  createdAt: string;
}

export interface ProjectSubmission {
  id: string;
  leaderId: string;
  leaderName: string;
  leaderSevenDigitId: string;
  leaderGrade: string;
  teamName: string;
  targetTeamSize: 2 | 3 | 4;
  teamLogoUrl: string;
  teammates: TeamMemberInvite[];
  projectName: string;
  projectLogoUrl: string;
  projectType: ProjectType;
  description: string;
  subjects: SubjectKey[];
  githubRepo: string;
  presentationUrl: string;
  presentationFileName?: string;
  videoUrl: string;
  videoFileName?: string;
  status: 'waiting_teammates' | 'draft_project' | 'submitted';
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  juryId: string;
  juryName: string;
  isTutorEvaluation: boolean;
  tutorSpecialty?: 'software' | 'hardware' | 'both';
  mvpScore: number; // 0 - 15
  ideaScore: number; // 0 - 15
  presentationScore: number; // 0 - 10
  technicalScore: number; // 0 - 10 (API, backend, behind the scenes)
  activenessScore: number; // 0 - 10 (only for Software/Hardware tutor juries)
  rawTotal: number; // out of 50 or 60
  maxScore: 50 | 60;
  normalizedScore: number; // (rawTotal / maxScore) * 100
  feedback: string;
  updatedAt: string;
}

export interface ProjectRankingSummary {
  project: ProjectSubmission;
  evaluations: Evaluation[];
  tutorEvaluations: Evaluation[];
  regularEvaluations: Evaluation[];
  averageNormalizedScore: number; // 0 - 100
  rank: number | null; // 1, 2, 3, ...
}

export interface CompetitionState {
  users: UserAccount[];
  projects: ProjectSubmission[];
  evaluations: Evaluation[];
  messages: TutorMessage[];
  registrationDeadlineIso: string; // 2026-11-20T23:59:59-05:00 (EST)
  demoDayLabel: string; // January 2027
  resultsPublished: boolean;
}
