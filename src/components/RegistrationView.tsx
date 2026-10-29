import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileUp,
  FolderGit2,
  Image as ImageIcon,
  Presentation,
  Save,
  Search,
  UserCheck,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { SUBJECT_LIST, translations } from '../i18n';
import {
  lookupParticipantBySevenDigitId,
  respondToTeamInvite,
  saveProjectSubmission,
} from '../services/competitionService';
import type {
  Language,
  ProjectSubmission,
  ProjectType,
  SubjectKey,
  TeamMemberInvite,
  UserAccount,
} from '../types';

interface RegistrationViewProps {
  lang: Language;
  currentUser: UserAccount;
  projects: ProjectSubmission[];
  isDeadlinePassed: boolean;
  onRefreshState: () => Promise<void>;
}

interface VerifiedTeammateInfo {
  uid: string;
  sevenDigitId: string;
  name: string;
  surname: string;
  grade: string;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  lang,
  currentUser,
  projects,
  isDeadlinePassed,
  onRefreshState,
}) => {
  const t = translations[lang];

  const leaderProject = projects.find((p) => p.leaderId === currentUser.uid);

  // Any projects where currentUser was invited by their 7-digit ID
  const invitedProjects = projects.filter((p) =>
    p.teammates.some(
      (tm) =>
        tm.sevenDigitId === currentUser.sevenDigitId ||
        tm.userId === currentUser.uid
    )
  );

  // Section 1 state
  const [teamName, setTeamName] = useState(leaderProject?.teamName || '');
  const [targetTeamSize, setTargetTeamSize] = useState<2 | 3 | 4>(
    leaderProject?.targetTeamSize || 2
  );
  const [teamLogoUrl, setTeamLogoUrl] = useState(
    leaderProject?.teamLogoUrl || ''
  );
  const [teammateIds, setTeammateIds] = useState<string[]>(() => {
    if (leaderProject && leaderProject.teammates.length > 0) {
      return leaderProject.teammates.map((tm) => tm.sevenDigitId);
    }
    return [''];
  });

  // Lookup cache for entered 7-digit IDs (only resolves exact 7-digit IDs entered by user)
  const [verifiedMap, setVerifiedMap] = useState<
    Record<string, VerifiedTeammateInfo | null>
  >({});

  // Section 2 state
  const [projectName, setProjectName] = useState(
    leaderProject?.projectName || ''
  );
  const [projectLogoUrl, setProjectLogoUrl] = useState(
    leaderProject?.projectLogoUrl || ''
  );
  const [projectType, setProjectType] = useState<ProjectType>(
    leaderProject?.projectType || 'Hardware+Software'
  );
  const [description, setDescription] = useState(
    leaderProject?.description || ''
  );
  const [subjects, setSubjects] = useState<SubjectKey[]>(
    leaderProject?.subjects && leaderProject.subjects.length > 0
      ? leaderProject.subjects
      : []
  );
  const [githubRepo, setGithubRepo] = useState(leaderProject?.githubRepo || '');
  const [presentationUrl, setPresentationUrl] = useState(
    leaderProject?.presentationUrl || ''
  );
  const [presentationFileName, setPresentationFileName] = useState(
    leaderProject?.presentationFileName || ''
  );
  const [videoUrl, setVideoUrl] = useState(leaderProject?.videoUrl || '');
  const [videoFileName, setVideoFileName] = useState(
    leaderProject?.videoFileName || ''
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (leaderProject) {
      setTeamName(leaderProject.teamName);
      setTargetTeamSize(leaderProject.targetTeamSize);
      setTeamLogoUrl(leaderProject.teamLogoUrl);
      setTeammateIds(leaderProject.teammates.map((tm) => tm.sevenDigitId));
      setProjectName(leaderProject.projectName);
      setProjectLogoUrl(leaderProject.projectLogoUrl);
      setProjectType(leaderProject.projectType);
      setDescription(leaderProject.description);
      setSubjects(leaderProject.subjects);
      setGithubRepo(leaderProject.githubRepo);
      setPresentationUrl(leaderProject.presentationUrl);
      setPresentationFileName(leaderProject.presentationFileName || '');
      setVideoUrl(leaderProject.videoUrl);
      setVideoFileName(leaderProject.videoFileName || '');

      const initialVerified: Record<string, VerifiedTeammateInfo> = {};
      leaderProject.teammates.forEach((tm) => {
        initialVerified[tm.sevenDigitId] = {
          uid: tm.userId,
          sevenDigitId: tm.sevenDigitId,
          name: tm.name,
          surname: tm.surname,
          grade: tm.grade,
        };
      });
      setVerifiedMap((prev) => ({ ...prev, ...initialVerified }));
    }
  }, [leaderProject?.id, leaderProject?.updatedAt]);

  const verifySingleId = async (sevenDigitId: string) => {
    if (sevenDigitId.length !== 7) return;
    const res = await lookupParticipantBySevenDigitId(sevenDigitId);
    setVerifiedMap((prev) => ({
      ...prev,
      [sevenDigitId]: res.found && res.participant ? res.participant : null,
    }));
  };

  const handleTeamSizeChange = (newSize: 2 | 3 | 4) => {
    setTargetTeamSize(newSize);
    const needed = newSize - 1;
    setTeammateIds((prev) => {
      const copy = [...prev];
      while (copy.length < needed) {
        copy.push('');
      }
      return copy.slice(0, needed);
    });
  };

  const handleTeammateIdChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(0, 7);
    setTeammateIds((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean.length === 7) {
      verifySingleId(clean);
    }
  };

  const toggleSubject = (subj: SubjectKey) => {
    setSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileAttachment = (
    e: React.ChangeEvent<HTMLInputElement>,
    urlSetter: (val: string) => void,
    nameSetter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    nameSetter(file.name);
    if (file.size <= 100000) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          urlSetter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      urlSetter(`uploaded://${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleRespondInvite = async (
    projectId: string,
    decision: 'approved' | 'declined'
  ) => {
    setError('');
    try {
      await respondToTeamInvite({
        projectId,
        userId: currentUser.uid,
        decision,
      });
      await onRefreshState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to respond to invite'
      );
    }
  };

  const handleSaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!teamName.trim()) {
      setError('Team Name is required.');
      return;
    }
    if (![2, 3, 4].includes(targetTeamSize)) {
      setError('Team size must be between 2 and 4.');
      return;
    }
    if (teammateIds.some((id) => id.length !== 7)) {
      setError('Every teammate slot must have a valid 7-digit ID.');
      return;
    }
    if (!projectName.trim()) {
      setError('Project Name is required.');
      return;
    }
    if (!description.trim() || description.length > 250) {
      setError(
        'Project description is required and must be up to 250 characters.'
      );
      return;
    }
    if (subjects.length === 0) {
      setError('Please select at least one school subject.');
      return;
    }
    if (!githubRepo.trim()) {
      setError('GitHub Repository URL is required.');
      return;
    }
    if (!presentationUrl.trim()) {
      setError('Presentation link or uploaded file is required.');
      return;
    }

    setSaving(true);
    try {
      const formattedTeammates: TeamMemberInvite[] = teammateIds.map((id) => {
        const existing = leaderProject?.teammates.find(
          (tm) => tm.sevenDigitId === id
        );
        const info = verifiedMap[id];
        return {
          sevenDigitId: id,
          userId: info?.uid || existing?.userId || '',
          name: info?.name || existing?.name || '',
          surname: info?.surname || existing?.surname || '',
          grade: info?.grade || existing?.grade || '',
          status: existing ? existing.status : 'pending',
          invitedAt: existing ? existing.invitedAt : new Date().toISOString(),
          respondedAt: existing?.respondedAt,
        };
      });

      await saveProjectSubmission({
        id: leaderProject?.id,
        leaderId: currentUser.uid,
        teamName,
        targetTeamSize,
        teamLogoUrl,
        teammates: formattedTeammates,
        projectName,
        projectLogoUrl,
        projectType,
        description,
        subjects,
        githubRepo,
        presentationUrl,
        presentationFileName,
        videoUrl,
        videoFileName,
      });

      await onRefreshState();
      setSuccessMsg(t.registrationSavedMsg);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save registration'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Invitations Received by This User's 7-Digit ID */}
      {invitedProjects.length > 0 && (
        <section className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/60 via-[#131b33] to-indigo-950/60 p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-amber-200">
                {t.pendingInvitesTitle}
              </h2>
              <p className="mt-0.5 text-xs text-amber-100/80">
                ID:{' '}
                <span className="font-mono font-semibold text-white">
                  {currentUser.sevenDigitId}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-amber-400/20">
            {invitedProjects.map((proj) => {
              const myInvite = proj.teammates.find(
                (tm) =>
                  tm.sevenDigitId === currentUser.sevenDigitId ||
                  tm.userId === currentUser.uid
              );
              return (
                <div
                  key={proj.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-bold text-white">
                      {proj.teamName} — {proj.projectName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-indigo-200">
                      <span>
                        {t.invitedByLeader} <strong>{proj.leaderName}</strong>{' '}
                        (ID:{' '}
                        <span className="font-mono">
                          {proj.leaderSevenDigitId}
                        </span>
                        )
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{proj.projectType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-amber-300">
                        {myInvite?.status === 'approved'
                          ? t.approvedStatus
                          : myInvite?.status === 'declined'
                          ? t.declinedStatus
                          : t.pendingStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {myInvite?.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleRespondInvite(proj.id, 'approved')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t.approveAndJoin}</span>
                      </button>
                    )}
                    {myInvite?.status !== 'declined' && (
                      <button
                        type="button"
                        onClick={() => handleRespondInvite(proj.id, 'declined')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-[#0b1021] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-indigo-950 whitespace-nowrap"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>{t.declineInvite}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Two-Section Registration Form */}
      <form onSubmit={handleSaveSubmission} className="space-y-8">
        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/70 px-4 py-3 text-xs font-semibold text-rose-200">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-4 py-3 text-xs font-semibold text-emerald-200">
            {successMsg}
          </div>
        )}

        {/* SECTION 1: TEAM FORMATION & 7-DIGIT ID INVITATIONS */}
        <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
          <div className="border-b border-indigo-500/20 pb-4">
            <h2 className="text-lg font-bold text-white">{t.section1Title}</h2>
            <p className="mt-1 text-xs text-indigo-200/80">
              {t.section1Subtitle}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Team Name, Size (2-4), Optional Logo */}
            <div className="space-y-5 lg:col-span-7">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.teamNameLabel}
                  </label>
                  <span className="text-xs text-cyan-400">{t.requiredTag}</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={t.teamNamePlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.teamSizeLabel}
                  </label>
                  <span className="font-mono text-xs text-cyan-400">2 – 4</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {t.teamSizeHelper}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-[#0b1021] p-1 border border-indigo-500/20">
                  {([2, 3, 4] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleTeamSizeChange(sz)}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        targetTeamSize === sz
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-mono tabular-nums">{sz}</span>
                      <span>({sz - 1} + Leader)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Logo (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.teamLogoLabel}
                  </label>
                  <span className="text-xs text-slate-400">
                    {t.optionalTag}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-500/30 bg-[#0b1021]">
                    {teamLogoUrl ? (
                      <img
                        src={teamLogoUrl}
                        alt={teamName || 'Team Logo'}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={teamLogoUrl}
                    onChange={(e) => setTeamLogoUrl(e.target.value)}
                    placeholder="https://... or upload logo"
                    className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/60 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 whitespace-nowrap shrink-0">
                    <FileUp className="h-3.5 w-3.5" />
                    <span>{t.uploadFileBtn}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setTeamLogoUrl)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Entering Teammates by 7-Digit ID */}
            <div className="rounded-xl border border-indigo-500/25 bg-[#0b1021]/90 p-5 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">
                  {t.teammatesSectionLabel}
                </h3>
                <span className="font-mono text-xs text-cyan-400 tabular-nums">
                  {teammateIds.length} teammate(s)
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {t.teammatesSectionDesc}
              </p>

              {/* Team Leader Card */}
              <div className="mt-4 rounded-lg border border-indigo-500/30 bg-[#131b33] px-3.5 py-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    1. {currentUser.name} {currentUser.surname} (Leader)
                  </span>
                  <span className="font-mono text-cyan-300 tabular-nums">
                    ID: {currentUser.sevenDigitId}
                  </span>
                </div>
              </div>

              {/* Dynamic Teammate 7-Digit ID Inputs */}
              <div className="mt-3 space-y-3">
                {teammateIds.map((idVal, idx) => {
                  const verifiedUser = verifiedMap[idVal];
                  const savedInvite = leaderProject?.teammates.find(
                    (tm) => tm.sevenDigitId === idVal
                  );
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-indigo-500/25 bg-[#131b33] p-3.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                        <span>Teammate #{idx + 2} — 7-Digit ID</span>
                        {savedInvite ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              savedInvite.status === 'approved'
                                ? 'text-emerald-400'
                                : savedInvite.status === 'declined'
                                ? 'text-rose-400'
                                : 'text-amber-300'
                            }`}
                          >
                            {savedInvite.status === 'approved' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {savedInvite.status === 'approved'
                                ? t.approvedStatus
                                : savedInvite.status === 'declined'
                                ? t.declinedStatus
                                : t.pendingStatus}
                            </span>
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          required
                          maxLength={7}
                          value={idVal}
                          onChange={(e) =>
                            handleTeammateIdChange(idx, e.target.value)
                          }
                          placeholder={t.enterTeammateIdPlaceholder}
                          className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 font-mono text-xs text-white placeholder-slate-500 tabular-nums focus:border-cyan-400 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => verifySingleId(idVal)}
                          disabled={idVal.length !== 7}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-950/80 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-indigo-900 disabled:opacity-40 whitespace-nowrap shrink-0"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>{t.lookupIdBtn}</span>
                        </button>
                      </div>

                      {verifiedUser ? (
                        <div className="mt-2 flex items-center justify-between text-xs text-emerald-300">
                          <span>
                            <UserCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
                            <strong className="text-white">
                              {verifiedUser.name} {verifiedUser.surname}
                            </strong>{' '}
                            · {verifiedUser.grade}
                          </span>
                        </div>
                      ) : idVal.length === 7 && verifiedMap[idVal] === null ? (
                        <p className="mt-1.5 text-xs text-rose-400">
                          No registered participant found with 7-digit ID{' '}
                          {idVal}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROJECT DETAILS & DELIVERABLES */}
        <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
          <div className="border-b border-indigo-500/20 pb-4">
            <h2 className="text-lg font-bold text-white">{t.section2Title}</h2>
            <p className="mt-1 text-xs text-indigo-200/80">
              {t.section2Subtitle}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              {/* Project Name */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.projectNameLabel}
                  </label>
                  <span className="text-xs text-cyan-400">{t.requiredTag}</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t.projectNamePlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              {/* Project Type: Robotics | Software | Hardware+Software */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.projectTypeLabel}
                  </label>
                  <span className="text-xs text-cyan-400">{t.requiredTag}</span>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2 rounded-xl bg-[#0b1021] p-1 border border-indigo-500/20">
                  {(
                    [
                      'Robotics',
                      'Software',
                      'Hardware+Software',
                    ] as ProjectType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectType(type)}
                      className={`rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        projectType === type
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Summary up to 250 characters */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.projectDescLabel}
                  </label>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      description.length >= 240
                        ? 'font-bold text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {description.length} / 250
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={250}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                  placeholder={t.projectDescPlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              {/* Blended School Subjects (Multi-select required) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.subjectsLabel}
                  </label>
                  <span className="font-mono text-xs text-cyan-400 tabular-nums">
                    {subjects.length} selected ({t.requiredTag})
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {t.subjectsHelper}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {SUBJECT_LIST.map((subj) => {
                    const active = subjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? 'border-cyan-400 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                            : 'border-indigo-500/25 bg-[#0b1021] text-slate-300 hover:border-indigo-400/50 hover:text-white'
                        }`}
                      >
                        {t.subjects[subj]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Logos, GitHub Repo, Presentation, Optional Video */}
            <div className="space-y-5 lg:col-span-5">
              {/* Project Logo (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-indigo-200">
                    {t.projectLogoLabel}
                  </label>
                  <span className="text-xs text-slate-400">
                    {t.optionalTag}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-500/30 bg-[#0b1021]">
                    {projectLogoUrl ? (
                      <img
                        src={projectLogoUrl}
                        alt={projectName || 'Project Logo'}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={projectLogoUrl}
                    onChange={(e) => setProjectLogoUrl(e.target.value)}
                    placeholder="https://... or upload logo"
                    className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/60 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 whitespace-nowrap shrink-0">
                    <FileUp className="h-3.5 w-3.5" />
                    <span>{t.uploadFileBtn}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setProjectLogoUrl)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* GitHub Repository (Required) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{t.githubRepoLabel}</span>
                  </label>
                  <span className="text-xs text-cyan-400">{t.requiredTag}</span>
                </div>
                <input
                  type="url"
                  required
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder={t.githubRepoPlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              {/* Presentation (Required) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <Presentation className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{t.presentationLabel}</span>
                  </label>
                  <span className="text-xs text-cyan-400">{t.requiredTag}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={presentationUrl}
                    onChange={(e) => setPresentationUrl(e.target.value)}
                    placeholder={t.presentationPlaceholder}
                    className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/60 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 whitespace-nowrap shrink-0">
                    <FileUp className="h-3.5 w-3.5" />
                    <span>{t.uploadFileBtn}</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.key"
                      onChange={(e) =>
                        handleFileAttachment(
                          e,
                          setPresentationUrl,
                          setPresentationFileName
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                {presentationFileName && (
                  <p className="mt-1 text-xs text-cyan-300">
                    File: {presentationFileName}
                  </p>
                )}
              </div>

              {/* Additional Video Material (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200">
                    <Video className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{t.videoMaterialLabel}</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {t.optionalTag}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={t.videoMaterialPlaceholder}
                    className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/60 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 whitespace-nowrap shrink-0">
                    <FileUp className="h-3.5 w-3.5" />
                    <span>{t.uploadFileBtn}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        handleFileAttachment(e, setVideoUrl, setVideoFileName)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                {videoFileName && (
                  <p className="mt-1 text-xs text-cyan-300">
                    Video: {videoFileName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-indigo-500/20 pt-5 sm:flex-row sm:items-center">
            <div className="text-xs text-indigo-200/80">
              {leaderProject?.status === 'submitted' ? (
                <span className="font-semibold text-emerald-400">
                  {t.allTeammatesApprovedNote}
                </span>
              ) : (
                <span>{t.waitingTeammateApprovalNote}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || (isDeadlinePassed && !currentUser.isAdmin)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-6 py-3 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? '...' : t.saveRegistrationBtn}</span>
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};
