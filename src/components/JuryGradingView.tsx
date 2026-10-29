import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Presentation,
  Save,
  Video,
} from 'lucide-react';
import { translations } from '../i18n';
import { submitJuryEvaluation } from '../services/competitionService';
import type {
  Evaluation,
  Language,
  ProjectSubmission,
  TutorMessage,
  UserAccount,
} from '../types';

interface JuryGradingViewProps {
  lang: Language;
  currentUser: UserAccount;
  projects: ProjectSubmission[];
  evaluations: Evaluation[];
  messages: TutorMessage[];
  onRefreshState: () => Promise<void>;
}

export const JuryGradingView: React.FC<JuryGradingViewProps> = ({
  lang,
  currentUser,
  projects,
  evaluations,
  messages,
  onRefreshState,
}) => {
  const t = translations[lang];

  const isTutorJury = Boolean(
    currentUser.isSoftwareTutor || currentUser.isHardwareTutor
  );
  const maxRawScore = isTutorJury ? 60 : 50;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredProjects = projects.filter(
    (p) => filterType === 'ALL' || p.projectType === filterType
  );

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || filteredProjects[0];

  const existingEval = evaluations.find(
    (e) => e.projectId === activeProject?.id && e.juryId === currentUser.uid
  );

  const [mvpScore, setMvpScore] = useState<number>(
    existingEval?.mvpScore ?? 12
  );
  const [ideaScore, setIdeaScore] = useState<number>(
    existingEval?.ideaScore ?? 12
  );
  const [presentationScore, setPresentationScore] = useState<number>(
    existingEval?.presentationScore ?? 8
  );
  const [technicalScore, setTechnicalScore] = useState<number>(
    existingEval?.technicalScore ?? 8
  );
  const [activenessScore, setActivenessScore] = useState<number>(
    existingEval?.activenessScore ?? 8
  );
  const [feedback, setFeedback] = useState<string>(
    existingEval?.feedback ?? ''
  );
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const ev = evaluations.find(
      (e) => e.projectId === activeProject.id && e.juryId === currentUser.uid
    );
    if (ev) {
      setMvpScore(ev.mvpScore);
      setIdeaScore(ev.ideaScore);
      setPresentationScore(ev.presentationScore);
      setTechnicalScore(ev.technicalScore);
      setActivenessScore(ev.activenessScore);
      setFeedback(ev.feedback);
    } else {
      setMvpScore(12);
      setIdeaScore(12);
      setPresentationScore(8);
      setTechnicalScore(8);
      setActivenessScore(isTutorJury ? 8 : 0);
      setFeedback('');
    }
    setSavedNotice(false);
  }, [activeProject?.id, currentUser.uid, evaluations.length]);

  const rawTotal =
    mvpScore +
    ideaScore +
    presentationScore +
    technicalScore +
    (isTutorJury ? activenessScore : 0);
  const normalizedPreview = Number(((rawTotal / maxRawScore) * 100).toFixed(2));

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    setSaving(true);
    setSavedNotice(false);
    try {
      await submitJuryEvaluation({
        projectId: activeProject.id,
        juryId: currentUser.uid,
        mvpScore,
        ideaScore,
        presentationScore,
        technicalScore,
        activenessScore: isTutorJury ? activenessScore : 0,
        feedback,
      });
      await onRefreshState();
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  const teamMessageCount = activeProject
    ? messages.filter((m) => m.projectId === activeProject.id).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-white">{t.juryPortalTitle}</h2>
          <p className="mt-1 text-xs text-indigo-200/80">
            {t.juryPortalSubtitle}
          </p>
        </div>

        {/* Interactive Filter Segmented Control */}
        <div className="flex items-center gap-1 rounded-xl bg-[#0b1021] p-1 border border-indigo-500/20 shrink-0">
          {(
            ['ALL', 'Robotics', 'Software', 'Hardware+Software'] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                filterType === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </section>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-10 text-center text-xs text-indigo-200">
          No projects registered in this category yet. As participants submit
          their teams and projects, they will appear here for real-time Demo Day
          grading.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: All Projects List with Logos, Team & Project Name */}
          <div className="space-y-3 lg:col-span-4">
            {filteredProjects.map((proj) => {
              const myEval = evaluations.find(
                (e) => e.projectId === proj.id && e.juryId === currentUser.uid
              );
              const isSelected = activeProject?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-gradient-to-r from-indigo-700 to-cyan-700 text-white'
                      : 'border-indigo-500/25 bg-[#131b33] text-white hover:bg-indigo-950/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-400/30 bg-[#0b1021] text-xs font-bold text-cyan-300">
                      {proj.projectLogoUrl || proj.teamLogoUrl ? (
                        <img
                          src={proj.projectLogoUrl || proj.teamLogoUrl}
                          alt={proj.projectName}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{proj.teamName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate">
                          {proj.projectName}
                        </span>
                        {myEval ? (
                          <span className="font-mono text-xs font-semibold text-emerald-300 tabular-nums whitespace-nowrap">
                            {myEval.normalizedScore}/100
                          </span>
                        ) : (
                          <span className="text-xs text-indigo-300 whitespace-nowrap">
                            Ungraded
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-200">
                        <span className="truncate">{proj.teamName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">
                          {proj.projectType}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Project Dossier & Real-Time Rubric Grading */}
          {activeProject ? (
            <div className="space-y-6 lg:col-span-8">
              {/* Project Dossier Card */}
              <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
                <div className="flex flex-col justify-between gap-4 border-b border-indigo-500/20 pb-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-indigo-400/30 bg-[#0b1021] text-sm font-bold text-cyan-300">
                        {activeProject.projectLogoUrl ? (
                          <img
                            src={activeProject.projectLogoUrl}
                            alt={activeProject.projectName}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {activeProject.projectName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {activeProject.teamLogoUrl && (
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-indigo-400/30 bg-[#0b1021]">
                          <img
                            src={activeProject.teamLogoUrl}
                            alt={activeProject.teamName}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {activeProject.projectName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-indigo-200">
                        <span className="font-semibold text-cyan-300">
                          Team: {activeProject.teamName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activeProject.projectType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {activeProject.targetTeamSize} members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverable Links */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={activeProject.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-[#0b1021] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-indigo-950 whitespace-nowrap"
                    >
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                    <a
                      href={activeProject.presentationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-[#0b1021] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-indigo-950 whitespace-nowrap"
                    >
                      <Presentation className="h-3.5 w-3.5" />
                      <span>Presentation</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                    {activeProject.videoUrl && (
                      <a
                        href={activeProject.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-[#0b1021] px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-indigo-950 whitespace-nowrap"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Video Demo</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  {activeProject.description}
                </p>

                <div className="mt-4 space-y-2 border-t border-indigo-500/20 pt-3 text-xs text-indigo-200">
                  <div>
                    <strong className="text-white">Subjects: </strong>
                    {activeProject.subjects
                      .map((s) => t.subjects[s] || s)
                      .join(' · ')}
                  </div>
                  <div>
                    <strong className="text-white">Team Members: </strong>
                    <span>
                      {activeProject.leaderName} (Leader, ID:{' '}
                      <span className="font-mono text-cyan-300">
                        {activeProject.leaderSevenDigitId}
                      </span>
                      )
                    </span>
                    {activeProject.teammates.map((tm) => (
                      <span key={tm.sevenDigitId}>
                        {' · '}
                        {tm.name} {tm.surname} (ID:{' '}
                        <span className="font-mono text-cyan-300">
                          {tm.sevenDigitId}
                        </span>
                        , {tm.status})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Demo Day Grading Form */}
              <form
                onSubmit={handleSaveScore}
                className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Demo Day Live Evaluation Sheet
                    </h3>
                    <p className="mt-0.5 text-xs text-indigo-200">
                      Evaluator:{' '}
                      <strong>
                        {currentUser.name} {currentUser.surname}
                      </strong>{' '}
                      ·{' '}
                      {isTutorJury
                        ? 'Tutor & Jury Mode (60 pts max -> converted to /100)'
                        : 'Standard Jury Mode (50 pts max -> converted to /100)'}
                    </p>
                  </div>

                  {/* Live Score Conversion Display */}
                  <div className="flex items-center gap-4 rounded-xl border border-indigo-500/30 bg-[#0b1021] px-4 py-2">
                    <div>
                      <div className="text-xs text-indigo-300">
                        {t.rawScoreLabel}
                      </div>
                      <div className="font-mono text-base font-bold text-white tabular-nums">
                        {rawTotal} / {maxRawScore}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-indigo-500/30" />
                    <div>
                      <div className="text-xs text-indigo-300">
                        {t.normalizedScoreLabel}
                      </div>
                      <div className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                        {normalizedPreview} / 100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criterion 1: Readiness of MVP (15) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white">
                        01. {t.rubricMvp}
                      </label>
                      <p className="text-xs text-indigo-200/80">
                        {t.rubricMvpDesc}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                      {mvpScore} / 15
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={mvpScore}
                    onChange={(e) => setMvpScore(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Criterion 2: Idea (15) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white">
                        02. {t.rubricIdea}
                      </label>
                      <p className="text-xs text-indigo-200/80">
                        {t.rubricIdeaDesc}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                      {ideaScore} / 15
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={ideaScore}
                    onChange={(e) => setIdeaScore(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Criterion 3: Presentation (10) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white">
                        03. {t.rubricPresentation}
                      </label>
                      <p className="text-xs text-indigo-200/80">
                        {t.rubricPresentationDesc}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                      {presentationScore} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={presentationScore}
                    onChange={(e) =>
                      setPresentationScore(Number(e.target.value))
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Criterion 4: Behind the scenes API, backend, and technical explanation (10) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white">
                        04. {t.rubricTechnical}
                      </label>
                      <p className="text-xs text-indigo-200/80">
                        {t.rubricTechnicalDesc}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                      {technicalScore} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={technicalScore}
                    onChange={(e) => setTechnicalScore(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Criterion 5 (Only for Software Teacher & Hardware Teacher): Activeness / Networking (10) */}
                {isTutorJury && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-emerald-300">
                          05. {t.rubricActiveness}
                        </label>
                        <p className="text-xs text-emerald-200/80">
                          {t.rubricActivenessDesc} ({teamMessageCount} idea
                          exchange messages logged)
                        </p>
                      </div>
                      <span className="font-mono text-sm font-bold text-emerald-300 tabular-nums">
                        {activenessScore} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={activenessScore}
                      onChange={(e) =>
                        setActivenessScore(Number(e.target.value))
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>
                )}

                {/* Feedback */}
                <div>
                  <label className="block text-xs font-bold text-indigo-200">
                    {t.feedbackLabel}
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-indigo-500/20 pt-4">
                  <div>
                    {savedNotice && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Score saved: {rawTotal}/{maxRawScore} (
                          {normalizedPreview}/100)
                        </span>
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? '...' : t.submitGradeBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
