# Security Specification — GulistanPS Startup Competition 26/27

## 1. Data Invariants
1. **Default-Deny Catch-All**: All unmatched paths in Firestore are unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication**: Every write operation requires an authenticated user with `request.auth.token.email_verified == true`.
3. **PII Isolation**: User email addresses are stored exclusively in `/users_private/{userId}` and readable only by the document owner (`request.auth.uid == userId`) or a verified Admin (`isAdmin()`).
4. **Role & Privilege Escalation Guard**: Regular users creating `/users_public/{userId}` must initialize `role == 'participant'`, `isJury == false`, `isSoftwareTutor == false`, and `isHardwareTutor == false` unless `isAdmin()`. Only `isAdmin()` can promote users to jury or tutor roles.
5. **Project Constraints**: A project in `/projects/{projectId}` must have `leaderId == request.auth.uid`, `targetTeamSize >= 2 && targetTeamSize <= 4`, `description.size() <= 250`, valid `projectType` in `['Robotics', 'Software', 'Hardware+Software']`, and `subjects.size() >= 1 && subjects.size() <= 10`.
6. **Evaluation Integrity**: An evaluation in `/evaluations/{evaluationId}` can only be created or updated by a verified jury/tutor (`juryId == request.auth.uid`), referencing an existing `/projects/{projectId}`, with bounded rubric scores (`mvpScore` 0–15, `ideaScore` 0–15, `presentationScore` 0–10, `technicalScore` 0–10, `activenessScore` 0–10).
7. **Temporal & Identity Immutability**: `createdAt` must equal `request.time` on creation and remain immutable on updates. Owner/leader/jury UIDs are immutable across updates.

## 2. The "Dirty Dozen" Payloads

1. **Unverified Email Spoof**: Authenticated token with `email: "nosirovkamron622@gmail.com"` but `email_verified: false` attempting to promote a user.
2. **Self-Assigned Jury Privilege**: New user creating `/users_public/user1` with `isJury: true` or `role: "admin"`.
3. **PII Blanket Read**: Authenticated user `user2` attempting `get` on `/users_private/user1`.
4. **Shadow Field Injection on Project**: Creating `/projects/proj1` with an undeclared field `isWinner: true`.
5. **Team Size Out of Bounds**: Creating `/projects/proj1` with `targetTeamSize: 1` or `targetTeamSize: 5` (must be 2–4).
6. **Description Overflow**: Updating `/projects/proj1` with a `description` of 251 characters (exceeds 250-char limit).
7. **Identity Spoofing on Project**: User `user1` creating `/projects/proj1` with `leaderId: "user2"`.
8. **Orphaned Evaluation Write**: Jury creating `/evaluations/eval1` for a non-existent `projectId: "ghost_project"`.
9. **Score Out-of-Bounds Injection**: Jury submitting `mvpScore: 25` (exceeds max 15).
10. **Immortal Field Tampering**: Updating `/projects/proj1` while altering `createdAt` or `leaderId`.
11. **Path ID Poisoning**: Creating `/projects/invalid$id!@#` with non-alphanumeric characters or >128 chars.
12. **Client Timestamp Forgery**: Creating `/users_public/user1` with a forged past/future `createdAt` instead of `request.time`.
