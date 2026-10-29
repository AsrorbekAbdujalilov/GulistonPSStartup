import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Globe,
  LogOut,
  Shield,
  Sliders,
} from 'lucide-react';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { JuryGradingView } from './components/JuryGradingView';
import { MentorshipView } from './components/MentorshipView';
import { RankingsView } from './components/RankingsView';
import { RegistrationView } from './components/RegistrationView';
import { translations } from './i18n';
import {
  computeProjectRankings,
  fetchCompetitionState,
} from './services/competitionService';
import type { CompetitionState, Language, UserAccount } from './types';

type ActiveTab =
  | 'overview'
  | 'registration'
  | 'mentorship'
  | 'jury'
  | 'rankings'
  | 'admin';

export default function App() {
  // Default language is Uzbek ('uz')
  const [lang, setLang] = useState<Language>('uz');
  const t = translations[lang];

  const [state, setState] = useState<CompetitionState | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | null
  >(null);
  const [copiedId, setCopiedId] = useState(false);

  // Live countdown to November 20, 2026 23:59:59 EST
  const [timeLeft, setTimeLeft] = useState({
    days: 23,
    hours: 12,
    minutes: 25,
    seconds: 10,
    passed: false,
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchCompetitionState();
      setState(data);
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated = data.users.find((u) => u.uid === prev.uid);
        return updated || prev;
      });
    } catch (err) {
      console.error('Error loading competition state:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const deadlineMs = new Date(
      state?.registrationDeadlineIso || '2026-11-20T23:59:59-05:00'
    ).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadlineMs - now;
      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          passed: true,
        });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, passed: false });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [state?.registrationDeadlineIso]);

  const handleCopySevenDigitId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.sevenDigitId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Route Admin and Jury directly to Markings & Jury Management instead of Participant Registration
    if (user.isAdmin) {
      setActiveTab('overview');
    } else if (user.isJury || user.isSoftwareTutor || user.isHardwareTutor) {
      setActiveTab('jury');
    } else {
      setActiveTab('registration');
    }
    loadData();
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const canAccessJury = Boolean(
    currentUser?.isAdmin ||
      currentUser?.isJury ||
      currentUser?.isSoftwareTutor ||
      currentUser?.isHardwareTutor
  );

  const isParticipantOnly = Boolean(currentUser && !canAccessJury);

  const rankings = state
    ? computeProjectRankings(state.projects, state.evaluations)
    : [];

  return (
    <div className="min-h-screen bg-[#0b1021] text-slate-100">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 border-b border-indigo-500/25 bg-[#0e152b] px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('overview');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: Role-specific single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-indigo-200">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'overview'
                ? 'font-semibold text-cyan-300 underline underline-offset-8'
                : ''
            }`}
          >
            {t.navOverview}
          </a>

          {/* Participant Registration is ONLY visible to student participants, NEVER to Admin or Jury */}
          {isParticipantOnly && (
            <a
              href="#registration"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('registration');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                activeTab === 'registration'
                  ? 'font-semibold text-cyan-300 underline underline-offset-8'
                  : ''
              }`}
            >
              {t.navRegistration}
            </a>
          )}

          {/* Jury Markings & Admin Jury Login Management for Admin / Juries */}
          {canAccessJury && (
            <a
              href="#jury"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('jury');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                activeTab === 'jury'
                  ? 'font-semibold text-cyan-300 underline underline-offset-8'
                  : ''
              }`}
            >
              {t.navJuryGrading}
            </a>
          )}

          {currentUser?.isAdmin && (
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('admin');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                activeTab === 'admin'
                  ? 'font-semibold text-cyan-300 underline underline-offset-8'
                  : ''
              }`}
            >
              {t.navAdmin}
            </a>
          )}

          {currentUser && (
            <a
              href="#mentorship"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('mentorship');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                activeTab === 'mentorship'
                  ? 'font-semibold text-cyan-300 underline underline-offset-8'
                  : ''
              }`}
            >
              {t.navMentorship}
            </a>
          )}

          <a
            href="#rankings"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('rankings');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'rankings'
                ? 'font-semibold text-cyan-300 underline underline-offset-8'
                : ''
            }`}
          >
            {t.navRankings}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-[#131b33] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-950 whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5 text-cyan-300" />
              <span>{t.signOut}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:from-indigo-500 hover:to-cyan-500 whitespace-nowrap shrink-0"
            >
              {t.signIn}
            </button>
          )}
        </div>
      </header>

      {/* WORKSPACE SUB-HEADER: Language Selector & Role Controls */}
      <div className="border-b border-indigo-500/20 bg-[#111830] px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {currentUser && (
              <span className="text-xs font-semibold text-indigo-200">
                {currentUser.name} {currentUser.surname} ·{' '}
                <span className="text-cyan-300">
                  {currentUser.isAdmin
                    ? t.roleAdmin
                    : currentUser.isSoftwareTutor
                    ? t.roleSoftwareTutor
                    : currentUser.isHardwareTutor
                    ? t.roleHardwareTutor
                    : currentUser.isJury
                    ? t.roleJury
                    : t.roleParticipant}
                </span>
              </span>
            )}

            {/* 7-Digit ID is only shown to Participants who need to share it with their Team Leader */}
            {isParticipantOnly && currentUser && (
              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-[#0b1021] px-3 py-1 text-xs text-indigo-200">
                <span>{t.yourSevenDigitId}:</span>
                <strong className="font-mono text-cyan-300 tabular-nums">
                  {currentUser.sevenDigitId}
                </strong>
                <button
                  type="button"
                  onClick={handleCopySevenDigitId}
                  className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:underline whitespace-nowrap"
                >
                  {copiedId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>{t.copyId}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Mode Buttons for Admin / Jury */}
            {canAccessJury && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('jury')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'jury'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                      : 'border border-cyan-400/30 bg-[#0b1021] text-cyan-300 hover:bg-indigo-950'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{t.navJuryGrading}</span>
                </button>

                {currentUser?.isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'admin'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'border border-amber-400/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{t.createJuryTutorTitle}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Download All Files (.ZIP) & Language Switcher (UZ default, EN, RU) */}
          <div className="flex items-center gap-3">
            <a
              href="/api/download-zip"
              download="gulistanps-startup-competition-26-27.zip"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-900/60 hover:text-white whitespace-nowrap"
            >
              <span>Download Files (.ZIP)</span>
            </a>
            <div className="flex items-center gap-1 rounded-xl border border-indigo-500/30 bg-[#0b1021] p-1">
              <Globe className="ml-2 h-3.5 w-3.5 text-cyan-400" />
              {(
                [
                  ['uz', 'O‘zbek'],
                  ['en', 'English'],
                  ['ru', 'Русский'],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    lang === code
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* IF NOT LOGGED IN: Visitor Registration / Sign-In Split View */}
        {!currentUser ? (
          <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left Column: Vibrant Competition Hero & EST Countdown */}
            <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#131b33] via-[#172142] to-[#0f243c] p-8 shadow-2xl lg:col-span-7">
              <div>
                <div className="text-xs font-semibold text-cyan-300">
                  {t.subtitle} · {t.demoDayBadge}
                </div>
                <h1
                  className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  GulistanPS Startup Competition 26/27
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-indigo-100/90">
                  Register your participant profile to receive your unique
                  7-digit ID. Form a team of 2–4 students, collaborate with
                  Software and Hardware Teachers, and pitch your Robotics,
                  Software, or Hardware+Software project on Demo Day in January
                  2027.
                </p>

                {/* Registration Deadline Countdown (Nov 20, 2026 EST) */}
                <div className="mt-8 rounded-xl border border-indigo-400/25 bg-[#0b1021]/90 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      {t.deadlineBannerTitle}
                    </span>
                    <span className="font-mono text-xs text-cyan-300">
                      {t.deadlineDateText}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                    <div className="rounded-lg border border-indigo-500/30 bg-[#131b33] py-2.5">
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        {timeLeft.days}
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        {t.days}
                      </div>
                    </div>
                    <div className="rounded-lg border border-indigo-500/30 bg-[#131b33] py-2.5">
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        {t.hours}
                      </div>
                    </div>
                    <div className="rounded-lg border border-indigo-500/30 bg-[#131b33] py-2.5">
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        {t.minutes}
                      </div>
                    </div>
                    <div className="rounded-lg border border-indigo-500/30 bg-[#131b33] py-2.5">
                      <div className="font-mono text-xl font-bold text-cyan-300 tabular-nums">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        {t.seconds}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-indigo-500/20 pt-5 text-xs">
                <div>
                  <div className="font-mono text-base font-bold text-cyan-300 tabular-nums">
                    2 – 4
                  </div>
                  <div className="text-indigo-200">Team Members</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-emerald-300 tabular-nums">
                    50 / 60 pts
                  </div>
                  <div className="text-indigo-200">Jury & Tutor Scale</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-amber-300 tabular-nums">
                    x / 100
                  </div>
                  <div className="text-indigo-200">Normalized Average</div>
                </div>
              </div>
            </div>

            {/* Right Column: Inline Participant Registration & Sign In Card */}
            <div className="flex items-center justify-center lg:col-span-5">
              <AuthModal
                lang={lang}
                initialMode="register"
                isInline={true}
                onSuccess={handleAuthSuccess}
              />
            </div>
          </section>
        ) : (
          <>
            {/* OVERVIEW TAB: Different for Admin/Jury vs Participant */}
            {activeTab === 'overview' && state && (
              <div className="space-y-8">
                {/* KPI Strip */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-5">
                    <div className="text-xs text-indigo-300">
                      Registered Startups
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                      {state.projects.length}
                    </div>
                    <div className="mt-1 text-xs text-cyan-300">
                      Robotics · Software · Hardware+Software
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-5">
                    <div className="text-xs text-indigo-300">
                      Juries & Active Tutors
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                      {state.users.filter((u) => u.isJury).length}
                    </div>
                    <div className="mt-1 text-xs text-emerald-300">
                      Software & Hardware Teachers + Juries
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-5">
                    <div className="text-xs text-indigo-300">
                      Registration Deadline (EST)
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-amber-300 tabular-nums">
                      {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}
                      h {String(timeLeft.minutes).padStart(2, '0')}m
                    </div>
                    <div className="mt-1 text-xs text-indigo-200">
                      Nov 20, 2026
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-5">
                    <div className="text-xs text-indigo-300">
                      Current #1 Leader
                    </div>
                    <div className="mt-1 text-lg font-bold text-amber-300 truncate">
                      {rankings[0]?.project.teamName || '—'}
                    </div>
                    <div className="mt-1 font-mono text-xs font-semibold text-cyan-300 tabular-nums">
                      {rankings[0]?.averageNormalizedScore || 0} / 100 avg
                    </div>
                  </div>
                </section>

                {/* IF ADMIN OR JURY: Show Markings (Jury Grading) AND Adding Jury Logins (Admin) — NEVER Participant Registration */}
                {canAccessJury ? (
                  <div className="space-y-10">
                    {currentUser.isAdmin && (
                      <AdminView
                        lang={lang}
                        currentUser={currentUser}
                        users={state.users}
                        onRefreshState={loadData}
                      />
                    )}
                    <JuryGradingView
                      lang={lang}
                      currentUser={currentUser}
                      projects={state.projects}
                      evaluations={state.evaluations}
                      messages={state.messages}
                      onRefreshState={loadData}
                    />
                  </div>
                ) : (
                  /* IF PARTICIPANT: Show Competition Registration & Team Invitations */
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#131b33] via-[#182246] to-[#10263f] p-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          GulistanPS Startup Competition 26/27
                        </h2>
                        <p className="mt-1 text-xs text-indigo-200">
                          {t.sevenDigitIdHint}:{' '}
                          <strong className="font-mono text-cyan-300">
                            {currentUser.sevenDigitId}
                          </strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('registration')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-500 whitespace-nowrap"
                      >
                        <span>{t.startCompetitionBtn}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <RegistrationView
                      lang={lang}
                      currentUser={currentUser}
                      projects={state.projects}
                      isDeadlinePassed={timeLeft.passed}
                      onRefreshState={loadData}
                    />
                  </div>
                )}
              </div>
            )}

            {/* PARTICIPANT REGISTRATION TAB (Only for Participants) */}
            {activeTab === 'registration' && state && isParticipantOnly && (
              <RegistrationView
                lang={lang}
                currentUser={currentUser}
                projects={state.projects}
                isDeadlinePassed={timeLeft.passed}
                onRefreshState={loadData}
              />
            )}

            {/* MENTORSHIP / TUTOR COMMUNICATION TAB */}
            {activeTab === 'mentorship' && state && (
              <MentorshipView
                lang={lang}
                currentUser={currentUser}
                users={state.users}
                projects={state.projects}
                messages={state.messages}
                onRefreshState={loadData}
              />
            )}

            {/* DEMO DAY JURY GRADING TAB */}
            {activeTab === 'jury' && state && canAccessJury && (
              <JuryGradingView
                lang={lang}
                currentUser={currentUser}
                projects={state.projects}
                evaluations={state.evaluations}
                messages={state.messages}
                onRefreshState={loadData}
              />
            )}

            {/* RANKINGS & RESULTS TAB */}
            {activeTab === 'rankings' && state && (
              <RankingsView
                lang={lang}
                currentUser={currentUser}
                projects={state.projects}
                evaluations={state.evaluations}
              />
            )}

            {/* ADMIN CONTROLS TAB */}
            {activeTab === 'admin' && state && currentUser.isAdmin && (
              <AdminView
                lang={lang}
                currentUser={currentUser}
                users={state.users}
                onRefreshState={loadData}
              />
            )}
          </>
        )}

        {/* Public Rankings View if clicked while unauthenticated */}
        {!currentUser && activeTab === 'rankings' && state && (
          <RankingsView
            lang={lang}
            currentUser={null}
            projects={state.projects}
            evaluations={state.evaluations}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-indigo-500/20 bg-[#0e152b] px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-indigo-300 sm:flex-row">
          <div>
            GulistanPS Startup Competition 26/27 · Gulistan Presidential School
          </div>
          <div className="flex items-center gap-4">
            <span>Registration Deadline: Nov 20, 2026 (EST)</span>
            <span aria-hidden="true">·</span>
            <span>Demo Day: January 2027</span>
          </div>
        </div>
      </footer>

      {/* Modal Auth when triggered from Top Bar */}
      {authModalMode && (
        <AuthModal
          lang={lang}
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
