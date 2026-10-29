import React, { useState } from 'react';
import {
  Check,
  Download,
  KeyRound,
  ShieldCheck,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { translations } from '../i18n';
import {
  changeUserPassword,
  createStaffAccount,
  updateRolePromotions,
} from '../services/competitionService';
import type { Language, UserAccount } from '../types';

interface AdminViewProps {
  lang: Language;
  currentUser: UserAccount;
  users: UserAccount[];
  onRefreshState: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  currentUser,
  users,
  onRefreshState,
}) => {
  const t = translations[lang];

  // Create New Jury / Tutor Account State
  const [staffName, setStaffName] = useState('');
  const [staffSurname, setStaffSurname] = useState('');
  const [staffLogin, setStaffLogin] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffIsJury, setStaffIsJury] = useState(true);
  const [staffIsSoftware, setStaffIsSoftware] = useState(false);
  const [staffIsHardware, setStaffIsHardware] = useState(false);
  const [staffMsg, setStaffMsg] = useState('');
  const [staffErr, setStaffErr] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffErr('');
    setStaffMsg('');
    setCreatingStaff(true);
    try {
      await createStaffAccount({
        adminUid: currentUser.uid,
        name: staffName,
        surname: staffSurname,
        login: staffLogin,
        password: staffPassword,
        isJury: staffIsJury || staffIsSoftware || staffIsHardware,
        isSoftwareTutor: staffIsSoftware,
        isHardwareTutor: staffIsHardware,
      });
      setStaffMsg(t.staffCreatedMsg);
      setStaffName('');
      setStaffSurname('');
      setStaffLogin('');
      setStaffPassword('');
      setStaffIsSoftware(false);
      setStaffIsHardware(false);
      setStaffIsJury(true);
      await onRefreshState();
    } catch (err) {
      setStaffErr(
        err instanceof Error ? err.message : 'Failed to create account'
      );
    } finally {
      setCreatingStaff(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    try {
      await changeUserPassword({
        uid: currentUser.uid,
        currentPassword,
        newPassword,
        adminOverrideUid: currentUser.isAdmin ? currentUser.uid : undefined,
      });
      setPwMessage(t.passwordUpdatedMsg);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    }
  };

  const handleTogglePrivilege = async (
    target: UserAccount,
    field: 'isJury' | 'isSoftwareTutor' | 'isHardwareTutor'
  ) => {
    setUpdatingUid(target.uid);
    try {
      const nextSoft =
        field === 'isSoftwareTutor'
          ? !target.isSoftwareTutor
          : target.isSoftwareTutor;
      const nextHard =
        field === 'isHardwareTutor'
          ? !target.isHardwareTutor
          : target.isHardwareTutor;
      const nextJury =
        field === 'isJury'
          ? !target.isJury
          : target.isJury || nextSoft || nextHard;

      await updateRolePromotions({
        adminUid: currentUser.uid,
        targetUid: target.uid,
        isJury: nextJury,
        isSoftwareTutor: nextSoft,
        isHardwareTutor: nextHard,
      });
      await onRefreshState();
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Row: Register Jury/Tutor Form + Change Admin Password */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Directly Register Jury / Software Teacher / Hardware Teacher */}
        <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl lg:col-span-7">
          <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-4">
            <UserPlus className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.createJuryTutorTitle}
              </h2>
              <p className="text-xs text-indigo-200/80">
                {t.createJuryTutorSubtitle}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateStaff} className="mt-5 space-y-4">
            {staffErr && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-xs text-rose-200">
                {staffErr}
              </div>
            )}
            {staffMsg && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-200">
                {staffMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-indigo-200">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-200">
                  {t.surnameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={staffSurname}
                  onChange={(e) => setStaffSurname(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-indigo-200">
                  {t.staffLoginLabel}
                </label>
                <input
                  type="text"
                  required
                  value={staffLogin}
                  onChange={(e) => setStaffLogin(e.target.value)}
                  placeholder={t.staffLoginPlaceholder}
                  className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-200">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={3}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••"
                  className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Role Checkboxes: Jury, Software Teacher, Hardware Teacher */}
            <div>
              <label className="block text-xs font-semibold text-indigo-200">
                Assign Roles & Specialties
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setStaffIsJury((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    staffIsJury || staffIsSoftware || staffIsHardware
                      ? 'border-indigo-400 bg-indigo-600/80 text-white'
                      : 'border-indigo-500/30 bg-[#0b1021] text-slate-300'
                  }`}
                >
                  {(staffIsJury || staffIsSoftware || staffIsHardware) && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>{t.toggleJury} (50p)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffIsSoftware((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    staffIsSoftware
                      ? 'border-cyan-400 bg-cyan-600/80 text-white'
                      : 'border-indigo-500/30 bg-[#0b1021] text-slate-300'
                  }`}
                >
                  {staffIsSoftware && <Check className="h-3.5 w-3.5" />}
                  <span>{t.toggleSoftwareTutor} (60p)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffIsHardware((v) => !v)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    staffIsHardware
                      ? 'border-emerald-400 bg-emerald-600/80 text-white'
                      : 'border-indigo-500/30 bg-[#0b1021] text-slate-300'
                  }`}
                >
                  {staffIsHardware && <Check className="h-3.5 w-3.5" />}
                  <span>{t.toggleHardwareTutor} (60p)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingStaff}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50"
            >
              {creatingStaff ? '...' : t.createStaffBtn}
            </button>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl lg:col-span-5">
          <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-4">
            <KeyRound className="h-4 w-4 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {t.changePasswordTitle}
              </h3>
              <p className="text-xs text-indigo-200/80">
                {t.adminPanelSubtitle}
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            {pwError && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-xs text-rose-200">
                {pwError}
              </div>
            )}
            {pwMessage && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-200">
                {pwMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-indigo-200">
                {t.currentPasswordLabel}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••"
                className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-200">
                {t.newPasswordLabel}
              </label>
              <input
                type="password"
                required
                minLength={3}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="mt-1 w-full rounded-lg border border-indigo-500/30 bg-[#0b1021] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:from-amber-400 hover:to-orange-500"
            >
              {t.updatePasswordBtn}
            </button>
          </form>

          <div className="mt-6 border-t border-indigo-500/20 pt-4">
            <a
              href="/api/download-zip"
              download="gulistanps-startup-competition-26-27.zip"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/50 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-900/60 hover:text-white"
            >
              <Download className="h-4 w-4" />
              <span>Barcha loyiha fayllarini yuklab olish (.ZIP)</span>
            </a>
          </div>
        </section>
      </div>

      {/* Role Promotions & Teacher Designation Matrix */}
      <section className="rounded-2xl border border-indigo-500/25 bg-[#131b33] p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-4">
          <UserCog className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              {t.userPromotionsTitle}
            </h3>
            <p className="text-xs text-indigo-200/80">{t.userPromotionsDesc}</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-indigo-500/20 text-indigo-300">
                <th className="py-3 pr-4 font-semibold">Account</th>
                <th className="py-3 pr-4 font-semibold">Login / Email</th>
                <th className="py-3 pr-4 font-semibold">7-Digit ID</th>
                <th className="py-3 pr-4 font-semibold">Max Grading Scale</th>
                <th className="py-3 pr-4 font-semibold text-center">
                  {t.toggleJury}
                </th>
                <th className="py-3 pr-4 font-semibold text-center">
                  {t.toggleSoftwareTutor}
                </th>
                <th className="py-3 font-semibold text-center">
                  {t.toggleHardwareTutor}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/15">
              {users.map((u) => {
                const isBusy = updatingUid === u.uid;
                const scale =
                  u.isSoftwareTutor || u.isHardwareTutor
                    ? '60 pts → /100'
                    : u.isJury || u.isAdmin
                    ? '50 pts → /100'
                    : 'Participant';
                return (
                  <tr key={u.uid} className="hover:bg-indigo-950/40">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-white">
                        {u.name} {u.surname}
                      </div>
                      <div className="text-indigo-300">{u.grade}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-slate-300">
                      {u.username || u.email}
                    </td>
                    <td className="py-3 pr-4 font-mono text-cyan-300 tabular-nums">
                      {u.sevenDigitId}
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold text-amber-300 tabular-nums">
                      {scale}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <button
                        type="button"
                        disabled={isBusy || u.isAdmin}
                        onClick={() => handleTogglePrivilege(u, 'isJury')}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          u.isJury
                            ? 'bg-indigo-600 text-white'
                            : 'border border-indigo-500/30 bg-[#0b1021] text-slate-300 hover:bg-indigo-950'
                        }`}
                      >
                        {u.isJury && <Check className="h-3 w-3" />}
                        <span>{u.isJury ? 'Jury Active' : 'Set Jury'}</span>
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleTogglePrivilege(u, 'isSoftwareTutor')
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          u.isSoftwareTutor
                            ? 'bg-cyan-600 text-white'
                            : 'border border-indigo-500/30 bg-[#0b1021] text-slate-300 hover:bg-indigo-950'
                        }`}
                      >
                        {u.isSoftwareTutor && <Check className="h-3 w-3" />}
                        <span>
                          {u.isSoftwareTutor
                            ? 'Software Teacher'
                            : 'Set Software'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleTogglePrivilege(u, 'isHardwareTutor')
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          u.isHardwareTutor
                            ? 'bg-emerald-600 text-white'
                            : 'border border-indigo-500/30 bg-[#0b1021] text-slate-300 hover:bg-indigo-950'
                        }`}
                      >
                        {u.isHardwareTutor && <Check className="h-3 w-3" />}
                        <span>
                          {u.isHardwareTutor
                            ? 'Hardware Teacher'
                            : 'Set Hardware'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
