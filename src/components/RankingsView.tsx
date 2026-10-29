import React from 'react';
import { Award, Medal, Trophy } from 'lucide-react';
import { translations } from '../i18n';
import { computeProjectRankings } from '../services/competitionService';
import type {
  Evaluation,
  Language,
  ProjectSubmission,
  UserAccount,
} from '../types';

interface RankingsViewProps {
  lang: Language;
  currentUser: UserAccount | null;
  projects: ProjectSubmission[];
  evaluations: Evaluation[];
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  lang,
  currentUser,
  projects,
  evaluations,
}) => {
  const t = translations[lang];
  const rankings = computeProjectRankings(projects, evaluations);

  const isJuryOrAdmin = Boolean(
    currentUser?.isAdmin ||
      currentUser?.isJury ||
      currentUser?.isSoftwareTutor ||
      currentUser?.isHardwareTutor
  );

  const myGroupRanking = currentUser
    ? rankings.find(
        (r) =>
          r.project.leaderId === currentUser.uid ||
          r.project.teammates.some(
            (tm) =>
              tm.userId === currentUser.uid ||
              tm.sevenDigitId === currentUser.sevenDigitId
          )
      )
    : undefined;

  const getRankLabel = (rank: number | null) => {
    if (rank === 1) return t.rank1st;
    if (rank === 2) return t.rank2nd;
    if (rank === 3) return t.rank3rd;
    return rank ? `#${rank}` : 'Pending';
  };

  return (
    <div className="space-y-8">
      {/* Header & Podium */}
      <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white">{t.rankingsTitle}</h2>
        <p className="mt-1 text-xs text-indigo-200/80">{t.rankingsSubtitle}</p>

        {rankings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-[#0b1021]/80 p-8 text-center text-xs text-indigo-200">
            No startup projects have been registered yet. Once teams submit
            their projects and juries evaluate them, 1st, 2nd, and 3rd place
            podium rankings will appear here.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {rankings.slice(0, 3).map((item) => {
              const rank = item.rank;
              const tutorAvg =
                item.tutorEvaluations.length > 0
                  ? (
                      item.tutorEvaluations.reduce(
                        (s, e) => s + e.normalizedScore,
                        0
                      ) / item.tutorEvaluations.length
                    ).toFixed(2)
                  : '—';
              const regAvg =
                item.regularEvaluations.length > 0
                  ? (
                      item.regularEvaluations.reduce(
                        (s, e) => s + e.normalizedScore,
                        0
                      ) / item.regularEvaluations.length
                    ).toFixed(2)
                  : '—';

              return (
                <div
                  key={item.project.id}
                  className={`rounded-2xl border p-5 ${
                    rank === 1
                      ? 'border-amber-400/50 bg-gradient-to-br from-amber-950/60 via-[#0b1021] to-indigo-950/60'
                      : rank === 2
                      ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-950/50 via-[#0b1021] to-indigo-950/50'
                      : 'border-emerald-400/40 bg-gradient-to-br from-emerald-950/50 via-[#0b1021] to-indigo-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                      {rank === 1 ? (
                        <Trophy className="h-4 w-4 text-amber-400" />
                      ) : rank === 2 ? (
                        <Medal className="h-4 w-4 text-cyan-300" />
                      ) : (
                        <Award className="h-4 w-4 text-emerald-400" />
                      )}
                      <span>{getRankLabel(rank)}</span>
                    </span>
                    <span className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                      {item.averageNormalizedScore} / 100
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-white">
                    {item.project.projectName}
                  </h3>
                  <div className="mt-0.5 text-xs text-indigo-200">
                    {item.project.teamName} · {item.project.projectType}
                  </div>

                  <div className="mt-4 space-y-1 border-t border-indigo-500/20 pt-3 text-xs text-indigo-200">
                    <div className="flex justify-between">
                      <span>{t.tutorAvgLabel}:</span>
                      <span className="font-mono font-semibold text-white tabular-nums">
                        {tutorAvg} / 100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.regularJuryAvgLabel}:</span>
                      <span className="font-mono font-semibold text-white tabular-nums">
                        {regAvg} / 100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Participant's Specific Group Result Banner */}
      {myGroupRanking && (
        <section className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-indigo-950/80 via-[#131b33] to-cyan-950/70 p-6 shadow-lg">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-bold text-cyan-300">
                {t.yourGroupResultTitle}
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">
                {myGroupRanking.project.teamName} —{' '}
                {myGroupRanking.project.projectName}
              </h3>
              <p className="mt-1 text-xs text-indigo-200">
                Placement:{' '}
                <strong className="text-amber-300">
                  {getRankLabel(myGroupRanking.rank)}
                </strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-indigo-300">
                {t.finalCombinedAvgLabel}
              </div>
              <div className="font-mono text-2xl font-bold text-cyan-300 tabular-nums">
                {myGroupRanking.averageNormalizedScore} / 100
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Group Results & Jury Breakdown Table */}
      {rankings.length > 0 && (
        <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <h3 className="text-base font-bold text-white">
              {isJuryOrAdmin
                ? 'Full Jury Rankings & Calculation Matrix'
                : 'Group Results & Standings'}
            </h3>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {rankings.length} projects
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-indigo-500/20 text-indigo-300">
                  <th className="py-3 pr-4 font-semibold">Rank</th>
                  <th className="py-3 pr-4 font-semibold">Team & Project</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold text-right">
                    Software & Hardware Tutors (x/60 → x/100)
                  </th>
                  <th className="py-3 pr-4 font-semibold text-right">
                    Juries (x/50 → x/100)
                  </th>
                  <th className="py-3 pl-4 font-semibold text-right">
                    Final Average (/100)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/15">
                {rankings.map((item) => {
                  const isTop3 =
                    item.rank === 1 || item.rank === 2 || item.rank === 3;
                  return (
                    <tr
                      key={item.project.id}
                      className="hover:bg-indigo-950/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-mono font-bold text-amber-300 tabular-nums whitespace-nowrap">
                        {isTop3
                          ? getRankLabel(item.rank)
                          : `#${item.rank || '—'}`}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-white">
                          {item.project.projectName}
                        </div>
                        <div className="text-indigo-300">
                          {item.project.teamName}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-indigo-200 whitespace-nowrap">
                        {item.project.projectType}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono text-slate-300 tabular-nums">
                        {item.tutorEvaluations.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.tutorEvaluations.map((ev) => (
                              <div key={ev.id}>
                                {ev.rawTotal}/60 →{' '}
                                <strong className="text-cyan-300">
                                  {ev.normalizedScore}/100
                                </strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-mono text-slate-300 tabular-nums">
                        {item.regularEvaluations.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.regularEvaluations.map((ev) => (
                              <div key={ev.id}>
                                {ev.rawTotal}/50 →{' '}
                                <strong className="text-emerald-300">
                                  {ev.normalizedScore}/100
                                </strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono text-sm font-bold text-amber-300 tabular-nums whitespace-nowrap">
                        {item.averageNormalizedScore} / 100
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
