import React, { useState } from 'react';
import { Code2, Cpu, MessageSquare, Send } from 'lucide-react';
import { translations } from '../i18n';
import { postTutorMessage } from '../services/competitionService';
import type {
  Language,
  ProjectSubmission,
  TutorMessage,
  UserAccount,
} from '../types';

interface MentorshipViewProps {
  lang: Language;
  currentUser: UserAccount;
  users: UserAccount[];
  projects: ProjectSubmission[];
  messages: TutorMessage[];
  onRefreshState: () => Promise<void>;
}

export const MentorshipView: React.FC<MentorshipViewProps> = ({
  lang,
  currentUser,
  users,
  projects,
  messages,
  onRefreshState,
}) => {
  const t = translations[lang];

  const softwareTutors = users.filter((u) => u.isSoftwareTutor);
  const hardwareTutors = users.filter((u) => u.isHardwareTutor);

  const myProject = projects.find(
    (p) =>
      p.leaderId === currentUser.uid ||
      p.teammates.some((tm) => tm.userId === currentUser.uid)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    myProject?.id || projects[0]?.id || ''
  );
  const [targetTutor, setTargetTutor] = useState<
    'both' | 'software' | 'hardware'
  >('both');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const projectMessages = messages.filter(
    (m) => m.projectId === selectedProjectId
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedProjectId) return;
    setSending(true);
    try {
      await postTutorMessage({
        projectId: selectedProjectId,
        senderId: currentUser.uid,
        targetTutor,
        content,
      });
      setContent('');
      await onRefreshState();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Designated Tutors Overview */}
      <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white">{t.mentorshipHubTitle}</h2>
        <p className="mt-1 text-xs text-indigo-200/80">
          {t.mentorshipHubSubtitle}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Software Teacher Card */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#0b1021]/90 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>{t.softwareTutorCard}</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              {softwareTutors.length > 0 ? (
                softwareTutors.map((st) => (
                  <div
                    key={st.uid}
                    className="flex items-center justify-between"
                  >
                    <span className="font-semibold text-white">
                      {st.name} {st.surname}
                    </span>
                    <span className="font-mono text-cyan-400">60 pts Jury</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">
                  Assigned by Admin in Admin Controls
                </span>
              )}
            </div>
          </div>

          {/* Hardware Teacher Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-[#0b1021]/90 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>{t.hardwareTutorCard}</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              {hardwareTutors.length > 0 ? (
                hardwareTutors.map((ht) => (
                  <div
                    key={ht.uid}
                    className="flex items-center justify-between"
                  >
                    <span className="font-semibold text-white">
                      {ht.name} {ht.surname}
                    </span>
                    <span className="font-mono text-emerald-400">
                      60 pts Jury
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">
                  Assigned by Admin in Admin Controls
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-8 text-center text-xs text-indigo-200">
          Register your team and project first to start exchanging ideas with
          the Software and Hardware Teachers.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Project List */}
          <div className="space-y-2 lg:col-span-4">
            {projects.map((proj) => {
              const msgCount = messages.filter(
                (m) => m.projectId === proj.id
              ).length;
              const isSelected = proj.id === selectedProjectId;
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate">
                      {proj.projectName}
                    </span>
                    <span className="font-mono text-xs text-cyan-200 tabular-nums">
                      {msgCount} msgs
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-indigo-200">
                    <span>{proj.teamName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{proj.projectType}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Conversation Thread */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 lg:col-span-8">
            {activeProject ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {activeProject.projectName} ({activeProject.teamName})
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-indigo-200">
                        <span>{activeProject.projectType}</span>
                        <span aria-hidden="true">·</span>
                        <span>Leader: {activeProject.leaderName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
                    {projectMessages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-indigo-300/70">
                        <MessageSquare className="mx-auto mb-2 h-6 w-6 opacity-50" />
                        <p>
                          No mentorship messages yet. Start exchanging ideas
                          below!
                        </p>
                      </div>
                    ) : (
                      projectMessages.map((msg) => {
                        const isTutorMsg =
                          msg.senderRole === 'software_tutor' ||
                          msg.senderRole === 'hardware_tutor' ||
                          msg.senderRole === 'admin';
                        return (
                          <div
                            key={msg.id}
                            className={`rounded-xl border p-3.5 ${
                              isTutorMsg
                                ? 'border-cyan-500/40 bg-cyan-950/30'
                                : 'border-indigo-500/25 bg-[#0b1021]/90'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">
                                {msg.senderName}
                              </span>
                              <span className="text-indigo-300">
                                Target: {msg.targetTutor} ·{' '}
                                <span className="font-mono tabular-nums">
                                  {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                              {msg.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Message Composer */}
                <form
                  onSubmit={handleSend}
                  className="mt-6 border-t border-indigo-500/20 pt-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        ['both', t.targetBothTutors],
                        ['software', t.targetSoftwareTutor],
                        ['hardware', t.targetHardwareTutor],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetTutor(val)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          targetTutor === val
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                            : 'bg-[#0b1021] text-slate-300 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t.sendMessagePlaceholder}
                      className="w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{t.sendBtn}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
