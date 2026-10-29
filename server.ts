import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  CompetitionState,
  Evaluation,
  ProjectSubmission,
  TutorMessage,
  UserAccount,
  UserRole,
} from './src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'competition_store.json');
const ALLOWED_GRADES = new Set(['8-sinf', '9-sinf', '10-sinf']);

function generateSevenDigitId(existingIds: Set<string>): string {
  let candidate = '';
  do {
    candidate = String(Math.floor(1000000 + Math.random() * 9000000));
  } while (existingIds.has(candidate));
  existingIds.add(candidate);
  return candidate;
}

// Standard CRC32 + Uncompressed ZIP builder for downloading all project files
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipBuffer(files: { relPath: string; content: Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.relPath.replace(/\\/g, '/'), 'utf-8');
    const dataBuf = file.content;
    const crc = crc32(dataBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // store (uncompressed)
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0, 12); // mod date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    localHeaders.push(local, dataBuf);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(dataBuf.length, 20);
    central.writeUInt32LE(dataBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    centralHeaders.push(central);
    offset += local.length + dataBuf.length;
  }

  const centralSize = centralHeaders.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

function collectProjectFiles(rootDir: string): { relPath: string; content: Buffer }[] {
  const results: { relPath: string; content: Buffer }[] = [];
  const ignoreDirs = new Set(['node_modules', 'dist', '.git', '.aistudio']);

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoreDirs.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push({
          relPath,
          content: fs.readFileSync(fullPath),
        });
      }
    }
  }

  walk(rootDir);
  return results;
}

function createInitialState(): CompetitionState {
  const now = new Date().toISOString();
  const users: UserAccount[] = [
    {
      uid: 'admin_root',
      sevenDigitId: '1000001',
      username: 'AsrorbekAbdujalilov',
      email: 'nosirovkamron622@gmail.com',
      password: '1234',
      name: 'Admin',
      surname: 'Jury',
      grade: 'Administration',
      role: 'admin',
      isAdmin: true,
      isJury: true,
      isSoftwareTutor: false,
      isHardwareTutor: false,
      teamId: '',
      createdAt: now,
    },
  ];

  return {
    users,
    projects: [],
    evaluations: [],
    messages: [],
    registrationDeadlineIso: '2026-11-20T23:59:59-05:00',
    demoDayLabel: 'January 2027',
    resultsPublished: true,
  };
}

function loadState(): CompetitionState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = createInitialState();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as CompetitionState;
  } catch (err) {
    console.error('Error loading competition state, initializing fresh state:', err);
    return createInitialState();
  }
}

function saveState(state: CompetitionState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving competition state:', err);
  }
}

function sanitizeUser(u: UserAccount): Omit<UserAccount, 'password'> {
  const { password: _p, ...rest } = u;
  return rest;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  let state = loadState();

  // GET download all project source files as a .ZIP archive
  app.get('/api/download-zip', (_req, res) => {
    try {
      const files = collectProjectFiles(process.cwd());
      const zipBuf = buildZipBuffer(files);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="gulistanps-startup-competition-26-27.zip"'
      );
      res.send(zipBuf);
    } catch (err) {
      console.error('Error building zip archive:', err);
      res.status(500).json({ error: 'Failed to generate zip archive.' });
    }
  });

  // GET competition state (passwords stripped)
  app.get('/api/state', (_req, res) => {
    res.json({
      ...state,
      users: state.users.map(sanitizeUser),
    });
  });

  // GET lookup a single participant by their exact 7-digit ID
  app.get('/api/users/lookup/:sevenDigitId', (req, res) => {
    const cleanId = (req.params.sevenDigitId || '').trim();
    if (!/^[0-9]{7}$/.test(cleanId)) {
      res.status(400).json({ found: false, error: 'Invalid 7-digit ID format.' });
      return;
    }
    const found = state.users.find(
      (u) => u.sevenDigitId === cleanId && !u.isAdmin
    );
    if (!found) {
      res.status(404).json({ found: false });
      return;
    }
    res.json({
      found: true,
      participant: {
        uid: found.uid,
        sevenDigitId: found.sevenDigitId,
        name: found.name,
        surname: found.surname,
        grade: found.grade,
      },
    });
  });

  // POST login
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body as {
      identifier?: string;
      password?: string;
    };
    if (!identifier || !password) {
      res.status(400).json({ error: 'Login and password are required.' });
      return;
    }
    const cleanId = identifier.trim().toLowerCase();
    const compactId = cleanId.replace(/\s+/g, '');

    const found = state.users.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uName = (u.username || '').toLowerCase();
      const fullNameCompact = `${u.name}${u.surname}`
        .toLowerCase()
        .replace(/\s+/g, '');
      return (
        uEmail === cleanId ||
        uName === cleanId ||
        fullNameCompact === compactId ||
        u.sevenDigitId === identifier.trim()
      );
    });

    if (!found || found.password !== password) {
      res.status(401).json({ error: 'Invalid login or password.' });
      return;
    }

    res.json({ user: sanitizeUser(found) });
  });

  // POST Google login sync
  app.post('/api/auth/google', (req, res) => {
    const { uid, email, displayName } = req.body as {
      uid: string;
      email: string;
      displayName?: string;
    };
    if (!uid || !email) {
      res.status(400).json({ error: 'Missing Google Auth info.' });
      return;
    }

    const isOwnerEmail = email.toLowerCase() === 'nosirovkamron622@gmail.com';
    let user = state.users.find(
      (u) => u.uid === uid || u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      const existingIds = new Set(state.users.map((u) => u.sevenDigitId));
      const parts = (displayName || email.split('@')[0]).trim().split(/\s+/);
      const firstName = parts[0] || 'Participant';
      const lastName = parts.slice(1).join(' ') || 'User';

      user = {
        uid,
        sevenDigitId: generateSevenDigitId(existingIds),
        username: `${firstName}${lastName}`.replace(/\s+/g, ''),
        email,
        password: '1234',
        name: firstName,
        surname: lastName,
        grade: isOwnerEmail ? 'Administration' : '10-sinf',
        role: isOwnerEmail ? 'admin' : 'participant',
        isAdmin: isOwnerEmail,
        isJury: isOwnerEmail,
        isSoftwareTutor: false,
        isHardwareTutor: false,
        teamId: '',
        createdAt: new Date().toISOString(),
      };
      state.users.push(user);
      saveState(state);
    } else if (isOwnerEmail && !user.isAdmin) {
      user.isAdmin = true;
      user.isJury = true;
      user.role = 'admin';
      saveState(state);
    }

    res.json({ user: sanitizeUser(user) });
  });

  // POST register new participant (restricted strictly to 8-sinf, 9-sinf, 10-sinf)
  app.post('/api/auth/register', (req, res) => {
    const { name, surname, grade, email, password } = req.body as {
      name?: string;
      surname?: string;
      grade?: string;
      email?: string;
      password?: string;
    };

    if (
      !name?.trim() ||
      !surname?.trim() ||
      !grade?.trim() ||
      !email?.trim() ||
      !password
    ) {
      res.status(400).json({
        error:
          'All fields (Name, Surname, Grade, Email, Password) are required.',
      });
      return;
    }

    const cleanGrade = grade.trim();
    if (!ALLOWED_GRADES.has(cleanGrade)) {
      res.status(400).json({
        error: 'Only 8-sinf, 9-sinf, and 10-sinf are allowed to register.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res
        .status(409)
        .json({ error: 'An account with this email already exists.' });
      return;
    }

    const existingIds = new Set(state.users.map((u) => u.sevenDigitId));
    const sevenDigitId = generateSevenDigitId(existingIds);
    const newUser: UserAccount = {
      uid: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sevenDigitId,
      username: `${name.trim()}${surname.trim()}`.replace(/\s+/g, ''),
      email: cleanEmail,
      password,
      name: name.trim().slice(0, 80),
      surname: surname.trim().slice(0, 80),
      grade: cleanGrade,
      role: 'participant',
      isAdmin: false,
      isJury: false,
      isSoftwareTutor: false,
      isHardwareTutor: false,
      teamId: '',
      createdAt: new Date().toISOString(),
    };

    state.users.push(newUser);
    saveState(state);
    res.json({ user: sanitizeUser(newUser) });
  });

  // POST Admin directly registers a Jury / Software Teacher / Hardware Teacher account
  app.post('/api/admin/create-staff', (req, res) => {
    const {
      adminUid,
      name,
      surname,
      login,
      password,
      isJury,
      isSoftwareTutor,
      isHardwareTutor,
    } = req.body as {
      adminUid: string;
      name?: string;
      surname?: string;
      login?: string;
      password?: string;
      isJury?: boolean;
      isSoftwareTutor?: boolean;
      isHardwareTutor?: boolean;
    };

    const admin = state.users.find((u) => u.uid === adminUid && u.isAdmin);
    if (!admin) {
      res
        .status(403)
        .json({ error: 'Only the Admin can register Jury & Tutor accounts.' });
      return;
    }

    if (
      !name?.trim() ||
      !surname?.trim() ||
      !login?.trim() ||
      !password?.trim()
    ) {
      res
        .status(400)
        .json({ error: 'Name, Surname, Login, and Password are required.' });
      return;
    }

    const cleanLogin = login.trim().toLowerCase();
    const exists = state.users.some(
      (u) =>
        (u.username || '').toLowerCase() === cleanLogin ||
        (u.email || '').toLowerCase() === cleanLogin
    );
    if (exists) {
      res
        .status(409)
        .json({ error: 'An account with this login or email already exists.' });
      return;
    }

    const existingIds = new Set(state.users.map((u) => u.sevenDigitId));
    const sevenDigitId = generateSevenDigitId(existingIds);

    const soft = Boolean(isSoftwareTutor);
    const hard = Boolean(isHardwareTutor);
    const juryFlag = Boolean(isJury || soft || hard);

    let derivedRole: UserRole = 'jury';
    let title = 'Jury Member';
    if (soft && hard) {
      derivedRole = 'software_tutor';
      title = 'Software & Hardware Teacher';
    } else if (soft) {
      derivedRole = 'software_tutor';
      title = 'Software Teacher';
    } else if (hard) {
      derivedRole = 'hardware_tutor';
      title = 'Hardware Teacher';
    } else if (!juryFlag) {
      derivedRole = 'participant';
      title = '10-sinf';
    }

    const staffUser: UserAccount = {
      uid: `staff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sevenDigitId,
      username: login.trim(),
      email: login.includes('@')
        ? login.trim()
        : `${login.trim()}@gulistanps.uz`,
      password: password.trim(),
      name: name.trim().slice(0, 80),
      surname: surname.trim().slice(0, 80),
      grade: title,
      role: derivedRole,
      isAdmin: false,
      isJury: juryFlag,
      isSoftwareTutor: soft,
      isHardwareTutor: hard,
      teamId: '',
      createdAt: new Date().toISOString(),
    };

    state.users.push(staffUser);
    saveState(state);
    res.json({
      user: sanitizeUser(staffUser),
      users: state.users.map(sanitizeUser),
    });
  });

  // POST change password
  app.post('/api/auth/change-password', (req, res) => {
    const { uid, currentPassword, newPassword, adminOverrideUid } = req.body as {
      uid: string;
      currentPassword?: string;
      newPassword?: string;
      adminOverrideUid?: string;
    };

    if (!uid || !newPassword || newPassword.trim().length < 3) {
      res.status(400).json({ error: 'Valid new password is required.' });
      return;
    }

    const targetUser = state.users.find((u) => u.uid === uid);
    if (!targetUser) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }

    const adminCaller = adminOverrideUid
      ? state.users.find((u) => u.uid === adminOverrideUid && u.isAdmin)
      : undefined;

    if (!adminCaller && targetUser.password !== currentPassword) {
      res.status(403).json({ error: 'Current password does not match.' });
      return;
    }

    targetUser.password = newPassword.trim();
    saveState(state);
    res.json({ success: true, user: sanitizeUser(targetUser) });
  });

  // POST Admin promote/update roles (Jury, Software Teacher/Tutor, Hardware Teacher/Tutor)
  app.post('/api/admin/promote', (req, res) => {
    const { adminUid, targetUid, isJury, isSoftwareTutor, isHardwareTutor } =
      req.body as {
        adminUid: string;
        targetUid: string;
        isJury: boolean;
        isSoftwareTutor: boolean;
        isHardwareTutor: boolean;
      };

    const admin = state.users.find((u) => u.uid === adminUid && u.isAdmin);
    if (!admin) {
      res
        .status(403)
        .json({ error: 'Only Highest-Level Admin can promote accounts.' });
      return;
    }

    const target = state.users.find((u) => u.uid === targetUid);
    if (!target) {
      res.status(404).json({ error: 'Target user not found.' });
      return;
    }

    const effectiveJury = Boolean(
      isJury || isSoftwareTutor || isHardwareTutor || target.isAdmin
    );
    target.isSoftwareTutor = Boolean(isSoftwareTutor);
    target.isHardwareTutor = Boolean(isHardwareTutor);
    target.isJury = effectiveJury;

    let derivedRole: UserRole = 'participant';
    if (target.isAdmin) {
      derivedRole = 'admin';
    } else if (target.isSoftwareTutor) {
      derivedRole = 'software_tutor';
    } else if (target.isHardwareTutor) {
      derivedRole = 'hardware_tutor';
    } else if (target.isJury) {
      derivedRole = 'jury';
    }
    target.role = derivedRole;

    saveState(state);
    res.json({
      user: sanitizeUser(target),
      users: state.users.map(sanitizeUser),
    });
  });

  // POST create or update a project & team registration
  app.post('/api/projects', (req, res) => {
    const payload = req.body as Partial<ProjectSubmission> & {
      leaderId: string;
    };
    const leader = state.users.find((u) => u.uid === payload.leaderId);
    if (!leader) {
      res.status(404).json({ error: 'Leader user not found.' });
      return;
    }

    const targetTeamSize = Number(payload.targetTeamSize);
    if (![2, 3, 4].includes(targetTeamSize)) {
      res
        .status(400)
        .json({ error: 'Team size must be between 2 and 4 members.' });
      return;
    }

    const requiredTeammateCount = targetTeamSize - 1;
    const incomingTeammates = Array.isArray(payload.teammates)
      ? payload.teammates
      : [];
    if (incomingTeammates.length !== requiredTeammateCount) {
      res.status(400).json({
        error: `For a team of ${targetTeamSize}, you must specify ${requiredTeammateCount} teammate(s) by their 7-digit ID.`,
      });
      return;
    }

    const seenIds = new Set<string>([leader.sevenDigitId]);
    const existingProject = state.projects.find(
      (p) => p.id === payload.id || p.leaderId === leader.uid
    );

    const validatedTeammates = [];
    for (const tm of incomingTeammates) {
      const clean7 = (tm.sevenDigitId || '').trim();
      if (!/^[0-9]{7}$/.test(clean7)) {
        res.status(400).json({ error: `Invalid 7-digit ID: ${clean7}` });
        return;
      }
      if (seenIds.has(clean7)) {
        res
          .status(400)
          .json({ error: `Duplicate 7-digit ID in team: ${clean7}` });
        return;
      }
      seenIds.add(clean7);

      const userMatch = state.users.find((u) => u.sevenDigitId === clean7);
      if (!userMatch) {
        res.status(404).json({
          error: `No registered participant found with 7-digit ID ${clean7}. Ask your teammate to register first and share their 7-digit ID.`,
        });
        return;
      }

      const prevInvite = existingProject?.teammates.find(
        (prev) => prev.sevenDigitId === clean7
      );
      validatedTeammates.push({
        sevenDigitId: clean7,
        userId: userMatch.uid,
        name: userMatch.name,
        surname: userMatch.surname,
        grade: userMatch.grade,
        status: prevInvite ? prevInvite.status : ('pending' as const),
        invitedAt: prevInvite ? prevInvite.invitedAt : new Date().toISOString(),
        respondedAt: prevInvite?.respondedAt,
      });
    }

    const description = (payload.description || '').trim();
    if (description.length > 250) {
      res
        .status(400)
        .json({ error: 'Project description cannot exceed 250 characters.' });
      return;
    }

    const projectId = existingProject
      ? existingProject.id
      : `proj_${Date.now()}`;
    const allApproved = validatedTeammates.every(
      (t) => t.status === 'approved'
    );
    const hasSection2 =
      Boolean(payload.projectName?.trim()) &&
      Boolean(payload.projectType) &&
      Boolean(description) &&
      Array.isArray(payload.subjects) &&
      payload.subjects.length > 0 &&
      Boolean(payload.githubRepo?.trim()) &&
      Boolean(payload.presentationUrl?.trim());

    const status: ProjectSubmission['status'] =
      hasSection2 && allApproved
        ? 'submitted'
        : allApproved
        ? 'draft_project'
        : 'waiting_teammates';

    const now = new Date().toISOString();
    const updatedProject: ProjectSubmission = {
      id: projectId,
      leaderId: leader.uid,
      leaderName: `${leader.name} ${leader.surname}`,
      leaderSevenDigitId: leader.sevenDigitId,
      leaderGrade: leader.grade,
      teamName: (payload.teamName || '').trim().slice(0, 100),
      targetTeamSize: targetTeamSize as 2 | 3 | 4,
      teamLogoUrl: payload.teamLogoUrl || '',
      teammates: validatedTeammates,
      projectName: (payload.projectName || '').trim().slice(0, 120),
      projectLogoUrl: payload.projectLogoUrl || '',
      projectType: payload.projectType || 'Software',
      description,
      subjects: Array.isArray(payload.subjects) ? payload.subjects : [],
      githubRepo: (payload.githubRepo || '').trim().slice(0, 500),
      presentationUrl: payload.presentationUrl || '',
      presentationFileName: payload.presentationFileName || '',
      videoUrl: payload.videoUrl || '',
      videoFileName: payload.videoFileName || '',
      status,
      createdAt: existingProject ? existingProject.createdAt : now,
      updatedAt: now,
    };

    if (existingProject) {
      state.projects = state.projects.map((p) =>
        p.id === projectId ? updatedProject : p
      );
    } else {
      state.projects.push(updatedProject);
    }

    leader.teamId = projectId;
    saveState(state);
    res.json({ project: updatedProject, projects: state.projects });
  });

  // POST Teammate approve or decline invitation
  app.post('/api/projects/:projectId/invite-response', (req, res) => {
    const { projectId } = req.params;
    const { userId, decision } = req.body as {
      userId: string;
      decision: 'approved' | 'declined';
    };

    const project = state.projects.find((p) => p.id === projectId);
    if (!project) {
      res.status(404).json({ error: 'Project team not found.' });
      return;
    }

    const user = state.users.find((u) => u.uid === userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const invite = project.teammates.find(
      (t) => t.userId === user.uid || t.sevenDigitId === user.sevenDigitId
    );
    if (!invite) {
      res.status(403).json({ error: 'No invitation found for this user.' });
      return;
    }

    invite.status = decision === 'approved' ? 'approved' : 'declined';
    invite.respondedAt = new Date().toISOString();

    if (decision === 'approved') {
      user.teamId = project.id;
    } else if (user.teamId === project.id) {
      user.teamId = '';
    }

    const allApproved = project.teammates.every(
      (t) => t.status === 'approved'
    );
    const hasSection2 =
      Boolean(project.projectName.trim()) &&
      Boolean(project.description.trim()) &&
      project.subjects.length > 0 &&
      Boolean(project.githubRepo.trim()) &&
      Boolean(project.presentationUrl.trim());

    project.status =
      allApproved && hasSection2
        ? 'submitted'
        : allApproved
        ? 'draft_project'
        : 'waiting_teammates';
    project.updatedAt = new Date().toISOString();

    saveState(state);
    res.json({
      project,
      projects: state.projects,
      users: state.users.map(sanitizeUser),
    });
  });

  // POST Demo Day Jury / Tutor Evaluation
  app.post('/api/evaluations', (req, res) => {
    const {
      projectId,
      juryId,
      mvpScore,
      ideaScore,
      presentationScore,
      technicalScore,
      activenessScore,
      feedback,
    } = req.body as {
      projectId: string;
      juryId: string;
      mvpScore: number;
      ideaScore: number;
      presentationScore: number;
      technicalScore: number;
      activenessScore?: number;
      feedback?: string;
    };

    const jury = state.users.find((u) => u.uid === juryId);
    if (
      !jury ||
      (!jury.isJury &&
        !jury.isAdmin &&
        !jury.isSoftwareTutor &&
        !jury.isHardwareTutor)
    ) {
      res.status(403).json({
        error: 'Only authorized Jury and Tutor members can submit scores.',
      });
      return;
    }

    const project = state.projects.find((p) => p.id === projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const mvp = Math.max(0, Math.min(15, Number(mvpScore) || 0));
    const idea = Math.max(0, Math.min(15, Number(ideaScore) || 0));
    const pres = Math.max(0, Math.min(10, Number(presentationScore) || 0));
    const tech = Math.max(0, Math.min(10, Number(technicalScore) || 0));

    const isTutor = Boolean(jury.isSoftwareTutor || jury.isHardwareTutor);
    const active = isTutor
      ? Math.max(0, Math.min(10, Number(activenessScore) || 0))
      : 0;
    const maxScore: 50 | 60 = isTutor ? 60 : 50;
    const rawTotal = mvp + idea + pres + tech + active;
    const normalizedScore = Number(((rawTotal / maxScore) * 100).toFixed(2));

    const tutorSpecialty: Evaluation['tutorSpecialty'] =
      jury.isSoftwareTutor && jury.isHardwareTutor
        ? 'both'
        : jury.isSoftwareTutor
        ? 'software'
        : jury.isHardwareTutor
        ? 'hardware'
        : undefined;

    const roleSuffix =
      jury.isSoftwareTutor && jury.isHardwareTutor
        ? ' (Software & Hardware Teacher)'
        : jury.isSoftwareTutor
        ? ' (Software Teacher)'
        : jury.isHardwareTutor
        ? ' (Hardware Teacher)'
        : jury.isAdmin
        ? ' (Lead Jury)'
        : '';

    const evalId = `eval_${projectId}_${jury.uid}`;
    const existingIdx = state.evaluations.findIndex(
      (e) => e.projectId === projectId && e.juryId === jury.uid
    );

    const evaluationRecord: Evaluation = {
      id: evalId,
      projectId,
      juryId: jury.uid,
      juryName: `${jury.name} ${jury.surname}${roleSuffix}`,
      isTutorEvaluation: isTutor,
      tutorSpecialty,
      mvpScore: mvp,
      ideaScore: idea,
      presentationScore: pres,
      technicalScore: tech,
      activenessScore: active,
      rawTotal,
      maxScore,
      normalizedScore,
      feedback: (feedback || '').trim().slice(0, 1000),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      state.evaluations[existingIdx] = evaluationRecord;
    } else {
      state.evaluations.push(evaluationRecord);
    }

    saveState(state);
    res.json({ evaluation: evaluationRecord, evaluations: state.evaluations });
  });

  // POST Tutor & Participant Mentorship / Idea Exchange Message
  app.post('/api/messages', (req, res) => {
    const { projectId, senderId, targetTutor, content } = req.body as {
      projectId: string;
      senderId: string;
      targetTutor?: 'software' | 'hardware' | 'both';
      content?: string;
    };

    const sender = state.users.find((u) => u.uid === senderId);
    if (!sender || !content?.trim()) {
      res
        .status(400)
        .json({ error: 'Valid sender and message content required.' });
      return;
    }

    const msg: TutorMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      senderId: sender.uid,
      senderName: `${sender.name} ${sender.surname}`,
      senderRole: sender.role,
      targetTutor: targetTutor || 'both',
      content: content.trim().slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    state.messages.push(msg);
    saveState(state);
    res.json({ message: msg, messages: state.messages });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `GulistanPS Startup Competition 26/27 server running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
