import type { Language, SubjectKey } from './types';

export const SUBJECT_LIST: SubjectKey[] = [
  'chemistry',
  'biology',
  'physics',
  'mathematics',
  'informatics',
  'geography_ecology',
  'economics',
  'engineering_design',
  'literature_languages',
  'history_social',
];

export const GRADE_OPTIONS = ['8-sinf', '9-sinf', '10-sinf'];

export const translations: Record<
  Language,
  {
    brandTitle: string;
    subtitle: string;
    navOverview: string;
    navRegistration: string;
    navMentorship: string;
    navJuryGrading: string;
    navRankings: string;
    navAdmin: string;
    signIn: string;
    signOut: string;
    register: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    nameLabel: string;
    surnameLabel: string;
    gradeLabel: string;
    emailLabel: string;
    submitLogin: string;
    submitRegister: string;
    googleSignIn: string;
    deadlineBannerTitle: string;
    deadlineDateText: string;
    deadlinePassed: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    demoDayBadge: string;
    yourSevenDigitId: string;
    sevenDigitIdHint: string;
    copied: string;
    copyId: string;
    roleAdmin: string;
    roleSoftwareTutor: string;
    roleHardwareTutor: string;
    roleJury: string;
    roleParticipant: string;
    startCompetitionBtn: string;
    pendingInvitesTitle: string;
    invitedByLeader: string;
    approveAndJoin: string;
    declineInvite: string;
    approvedStatus: string;
    pendingStatus: string;
    declinedStatus: string;
    section1Title: string;
    section1Subtitle: string;
    teamNameLabel: string;
    teamNamePlaceholder: string;
    teamSizeLabel: string;
    teamSizeHelper: string;
    teamLogoLabel: string;
    optionalTag: string;
    requiredTag: string;
    teammatesSectionLabel: string;
    teammatesSectionDesc: string;
    enterTeammateIdPlaceholder: string;
    lookupIdBtn: string;
    section2Title: string;
    section2Subtitle: string;
    projectNameLabel: string;
    projectNamePlaceholder: string;
    projectLogoLabel: string;
    projectTypeLabel: string;
    projectDescLabel: string;
    projectDescPlaceholder: string;
    subjectsLabel: string;
    subjectsHelper: string;
    githubRepoLabel: string;
    githubRepoPlaceholder: string;
    presentationLabel: string;
    presentationPlaceholder: string;
    uploadFileBtn: string;
    videoMaterialLabel: string;
    videoMaterialPlaceholder: string;
    saveRegistrationBtn: string;
    registrationSavedMsg: string;
    waitingTeammateApprovalNote: string;
    allTeammatesApprovedNote: string;
    mentorshipHubTitle: string;
    mentorshipHubSubtitle: string;
    softwareTutorCard: string;
    hardwareTutorCard: string;
    sendMessagePlaceholder: string;
    sendBtn: string;
    targetBothTutors: string;
    targetSoftwareTutor: string;
    targetHardwareTutor: string;
    juryPortalTitle: string;
    juryPortalSubtitle: string;
    rubricMvp: string;
    rubricMvpDesc: string;
    rubricIdea: string;
    rubricIdeaDesc: string;
    rubricPresentation: string;
    rubricPresentationDesc: string;
    rubricTechnical: string;
    rubricTechnicalDesc: string;
    rubricActiveness: string;
    rubricActivenessDesc: string;
    feedbackLabel: string;
    feedbackPlaceholder: string;
    submitGradeBtn: string;
    rawScoreLabel: string;
    normalizedScoreLabel: string;
    rankingsTitle: string;
    rankingsSubtitle: string;
    rank1st: string;
    rank2nd: string;
    rank3rd: string;
    yourGroupResultTitle: string;
    tutorAvgLabel: string;
    regularJuryAvgLabel: string;
    finalCombinedAvgLabel: string;
    adminPanelTitle: string;
    adminPanelSubtitle: string;
    createJuryTutorTitle: string;
    createJuryTutorSubtitle: string;
    staffLoginLabel: string;
    staffLoginPlaceholder: string;
    createStaffBtn: string;
    staffCreatedMsg: string;
    changePasswordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    updatePasswordBtn: string;
    passwordUpdatedMsg: string;
    userPromotionsTitle: string;
    userPromotionsDesc: string;
    toggleJury: string;
    toggleSoftwareTutor: string;
    toggleHardwareTutor: string;
    subjects: Record<SubjectKey, string>;
  }
> = {
  uz: {
    brandTitle: 'GulistanPS Startup 26/27',
    subtitle: 'Guliston Prezident maktabi startap tanlovi rasmiy platformasi',
    navOverview: 'Bosh sahifa',
    navRegistration: 'Tanlovda qatnashish',
    navMentorship: 'Ustozlar bilan muloqot',
    navJuryGrading: 'Hakamlar baholashi',
    navRankings: 'Natijalar va Reyting',
    navAdmin: 'Admin boshqaruvi',
    signIn: 'Kirish',
    signOut: 'Chiqish',
    register: 'Ro‘yxatdan o‘tish',
    loginTitle: 'Hisobga kirish',
    loginSubtitle: 'Ishtirokchi, ustoz yoki hakam hisobingizga kiring',
    registerTitle: 'GulistanPS Startup Competition 26/27 — Ro‘yxatdan o‘tish',
    registerSubtitle: 'Yangi foydalanuvchi ishtirokchi sifatida ro‘yxatdan o‘tadi va unga 7 xonali maxsus ID beriladi',
    identifierLabel: 'Login, Email yoki 7 xonali ID',
    identifierPlaceholder: 'Email yoki login kiriting',
    passwordLabel: 'Parol',
    nameLabel: 'Ism',
    surnameLabel: 'Familiya',
    gradeLabel: 'Sinf',
    emailLabel: 'Email manzili',
    submitLogin: 'Tizimga kirish',
    submitRegister: 'Ishtirokchi sifatida ro‘yxatdan o‘tish',
    googleSignIn: 'Google orqali davom etish',
    deadlineBannerTitle: 'Ro‘yxatdan o‘tish yakunlanish vaqti (20-noyabr, EST)',
    deadlineDateText: '2026-yil 20-noyabr, 23:59 EST',
    deadlinePassed: 'Ro‘yxatdan o‘tish muddati yakunlangan',
    days: 'kun',
    hours: 'soat',
    minutes: 'daq',
    seconds: 'son',
    demoDayBadge: 'Demo Day: 2027-yil Yanvar',
    yourSevenDigitId: 'Sizning 7 xonali shaxsiy ID raqamingiz',
    sevenDigitIdHint: 'Jamoa sardori sizni jamoaga qo‘shishi uchun ushbu 7 xonali kodni ulashing',
    copied: 'Nusxalandi',
    copyId: 'ID nusxalash',
    roleAdmin: 'Bosh Admin va Hakam',
    roleSoftwareTutor: 'Software ustozi va Hakam (60 ball)',
    roleHardwareTutor: 'Hardware ustozi va Hakam (60 ball)',
    roleJury: 'Hakamlar hay’ati a’zosi (50 ball)',
    roleParticipant: 'Ishtirokchi',
    startCompetitionBtn: 'GulistanPS Startup Competition 26/27 uchun ro‘yxatdan o‘tish',
    pendingInvitesTitle: 'Sizga yuborilgan jamoa taklifnomasi (Tasdiqlash talab etiladi)',
    invitedByLeader: 'Jamoa sardori:',
    approveAndJoin: 'Tasdiqlash va Qo‘shilish',
    declineInvite: 'Rad etish',
    approvedStatus: 'Tasdiqlangan va qo‘shilgan',
    pendingStatus: 'Tasdiqlash kutilmoqda',
    declinedStatus: 'Rad etilgan',
    section1Title: '01. Jamoa ma’lumotlari va a’zolarni 7 xonali ID orqali qo‘shish',
    section1Subtitle: 'Jamoada 2 tadan 4 tagacha ishtirokchi bo‘lishi shart. Jamoa a’zolarining 7 xonali ID raqamini kiriting — ular o‘z hisobidan tasdiqlagach jamoaga qo‘shiladi.',
    teamNameLabel: 'Jamoa nomi',
    teamNamePlaceholder: 'Jamoa nomini kiriting',
    teamSizeLabel: 'Jamoadagi ishtirokchilar soni (2 – 4 kishi)',
    teamSizeHelper: 'Sardor bilan birga 2, 3 yoki 4 kishi bo‘lishi shart (tashqaridagi sonlar qabul qilinmaydi)',
    teamLogoLabel: 'Jamoa logotipi',
    optionalTag: 'Ixtiyoriy',
    requiredTag: 'Majburiy',
    teammatesSectionLabel: 'Jamoa a’zolarining 7 xonali ID raqamlari',
    teammatesSectionDesc: 'Sheriklaringizning 7 xonali ID kodini kiriting. Ularga taklifnoma boradi va ular o‘z hisobidan tasdiqlashi shart.',
    enterTeammateIdPlaceholder: '7 xonali ID kiriting (masalan: 1234567)',
    lookupIdBtn: 'ID tekshirish',
    section2Title: '02. Startap loyiha ma’lumotlari va materiallar',
    section2Subtitle: 'Loyiha nomi, yo‘nalishi, fanlar integratsiyasi, GitHub repozitoriy va taqdimot materiallarini kiriting.',
    projectNameLabel: 'Loyiha nomi',
    projectNamePlaceholder: 'Loyiha nomini kiriting',
    projectLogoLabel: 'Loyiha logotipi',
    projectTypeLabel: 'Loyiha turi',
    projectDescLabel: 'Loyiha tavsifi (maksimum 250 belgi)',
    projectDescPlaceholder: 'Loyiha haqida qisqacha ma’lumot (250 belgigacha)...',
    subjectsLabel: 'Loyiha qaysi fanlar bilan uyg‘unlashgan? (Bir nechta tanlash mumkin)',
    subjectsHelper: 'Kamida bitta fanni tanlang (ko‘p tanlovli)',
    githubRepoLabel: 'GitHub repozitoriy havolasi',
    githubRepoPlaceholder: 'https://github.com/username/project',
    presentationLabel: 'Taqdimot (Presentation havola yoki fayl)',
    presentationPlaceholder: 'Taqdimot havolasi (Google Slides, Canva, PDF)',
    uploadFileBtn: 'Fayl yuklash',
    videoMaterialLabel: 'Qo‘shimcha video material',
    videoMaterialPlaceholder: 'Video havolasi yoki video fayl yuklang',
    saveRegistrationBtn: 'Jamoa va loyiha arizasini yuborish',
    registrationSavedMsg: 'Loyiha arizasi saqlandi! Jamoa a’zolariga tasdiqlash so‘rovi yuborildi.',
    waitingTeammateApprovalNote: 'Eslatma: Kiritilgan 7 xonali ID egalari o‘z hisoblariga kirib taklifnomani tasdiqlashi kerak.',
    allTeammatesApprovedNote: 'Barcha jamoa a’zolari tasdiqlagan va loyiha to‘liq ro‘yxatdan o‘tkazilgan!',
    mentorshipHubTitle: 'Software va Hardware ustozlar bilan muloqot',
    mentorshipHubSubtitle: 'Ishtirokchilar Software va Hardware ustozlari bilan g‘oya almashishi shart. Ustozlar ushbu faollikni 10 ballik mezonda baholaydi.',
    softwareTutorCard: 'Software ustozi (Dasturiy ta’minot, API, Backend)',
    hardwareTutorCard: 'Hardware ustozi (Robototexnika, Elektronika, Sensorlar)',
    sendMessagePlaceholder: 'Ustozlarga loyiha arxitekturasi, savollar yoki yangi g‘oyangizni yozing...',
    sendBtn: 'Yuborish',
    targetBothTutors: 'Ikkala ustozga (Software + Hardware)',
    targetSoftwareTutor: 'Software ustozga',
    targetHardwareTutor: 'Hardware ustozga',
    juryPortalTitle: 'Demo Day (Yanvar 2027) — Real vaqtda baholash',
    juryPortalSubtitle: 'Oddiy hakamlar 50 ballik, Software va Hardware ustoz-hakamlar 60 ballik tizimda baholaydi va natija x/100 ga o‘giriladi.',
    rubricMvp: 'MVP tayyorlik darajasi (Readiness of MVP)',
    rubricMvpDesc: 'Ishchi prototip yoki dasturiy mahsulotning amalda ishlash holati (0–15 ball)',
    rubricIdea: 'Loyiha g‘oyasi va yangiligi (Idea)',
    rubricIdeaDesc: 'Muammoning dolzarbligi, ilmiy-amaliy qiymati va innovatsion yondashuv (0–15 ball)',
    rubricPresentation: 'Taqdimot mahorati (Presentation)',
    rubricPresentationDesc: 'Slaydlar sifati, nutq ravonligi va savollarga aniq javob berish (0–10 ball)',
    rubricTechnical: 'Ichki texnik arxitektura tushuntirishi (API, Backend va b.)',
    rubricTechnicalDesc: 'Ishtirokchilarning loyiha ichki ishlashi, API, ma’lumotlar bazasi va sxemalarni tushuntirib berishi (0–10 ball)',
    rubricActiveness: 'Ustoz bilan faol muloqot va g‘oya almashinuvi (Activeness / Networking)',
    rubricActivenessDesc: 'Faqat Software va Hardware ustozlari uchun: jamoaning tayyorgarlik davomida ustoz bilan ishlashi (0–10 ball)',
    feedbackLabel: 'Hakam izohi va tavsiyalari',
    feedbackPlaceholder: 'Loyiha bo‘yicha fikr-mulohazalaringizni yozing...',
    submitGradeBtn: 'Bahoni saqlash va yangilash',
    rawScoreLabel: 'Umumiy ball',
    normalizedScoreLabel: '100 ballik tizimda (x/100)',
    rankingsTitle: 'Demo Day Natijalari va Umumiy Reyting',
    rankingsSubtitle: 'Ustozlar (x/60 -> x/100) va Hakamlar (x/50 -> x/100) baholarining o‘rtacha qiymati asosida hisoblangan natijalar.',
    rank1st: '1-O‘RIN G‘OLIBI',
    rank2nd: '2-O‘RIN SOVRINDORI',
    rank3rd: '3-O‘RIN SOVRINDORI',
    yourGroupResultTitle: 'Jamoangizning Demo Day natijasi',
    tutorAvgLabel: 'Ustoz-hakamlar (60 -> 100)',
    regularJuryAvgLabel: 'Hakamlar (50 -> 100)',
    finalCombinedAvgLabel: 'Yakuniy o‘rtacha natija (/100)',
    adminPanelTitle: 'Bosh Admin boshqaruv markazi',
    adminPanelSubtitle: 'Hakamlar, Software ustozi va Hardware ustozini ro‘yxatdan o‘tkazish, maqom berish hamda parolni yangilash.',
    createJuryTutorTitle: 'Yangi Hakam yoki Ustoz (Software / Hardware) qo‘shish',
    createJuryTutorSubtitle: 'Hakam yoki ustoz uchun login, parol va uning yo‘nalishini (Jury, Software, Hardware) belgilab hisob yarating:',
    staffLoginLabel: 'Login yoki Email',
    staffLoginPlaceholder: 'Masalan: software_teacher',
    createStaffBtn: 'Hakam / Ustoz hisobini yaratish',
    staffCreatedMsg: 'Yangi hakam/ustoz hisobi muvaffaqiyatli yaratildi!',
    changePasswordTitle: 'Parolni o‘zgartirish',
    currentPasswordLabel: 'Joriy parol',
    newPasswordLabel: 'Yangi parol',
    updatePasswordBtn: 'Parolni yangilash',
    passwordUpdatedMsg: 'Parol muvaffaqiyatli yangilandi!',
    userPromotionsTitle: 'Ro‘yxatdan o‘tgan hisoblarni boshqarish va maqom berish',
    userPromotionsDesc: 'Qaysi hisob Hakam (50 ball), Software ustozi (60 ball) yoki Hardware ustozi (60 ball) bo‘lishini belgilang:',
    toggleJury: 'Hakam (Jury)',
    toggleSoftwareTutor: 'Software ustozi',
    toggleHardwareTutor: 'Hardware ustozi',
    subjects: {
      chemistry: 'Kimyo',
      biology: 'Biologiya',
      physics: 'Fizika',
      mathematics: 'Matematika',
      informatics: 'Informatika',
      geography_ecology: 'Geografiya va Ekologiya',
      economics: 'Iqtisodiyot',
      engineering_design: 'Muhandislik va Dizayn',
      literature_languages: 'Adabiyot va Tillar',
      history_social: 'Tarix va Ijtimoiy fanlar',
    },
  },
  en: {
    brandTitle: 'GulistanPS Startup 26/27',
    subtitle: 'Official Portal for Gulistan Presidential School Startup Competition',
    navOverview: 'Overview',
    navRegistration: 'Competition Registration',
    navMentorship: 'Tutor Exchange',
    navJuryGrading: 'Demo Day Grading',
    navRankings: 'Results & Rankings',
    navAdmin: 'Admin Controls',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    register: 'Register',
    loginTitle: 'Sign In to Your Account',
    loginSubtitle: 'Sign in with your participant, tutor, jury, or admin credentials',
    registerTitle: 'GulistanPS Startup Competition 26/27 — Participant Registration',
    registerSubtitle: 'New users register as participants and automatically receive a unique 7-digit ID',
    identifierLabel: 'Login, Email, or 7-Digit ID',
    identifierPlaceholder: 'Enter your login or email',
    passwordLabel: 'Password',
    nameLabel: 'First Name',
    surnameLabel: 'Surname',
    gradeLabel: 'Grade',
    emailLabel: 'Email Address',
    submitLogin: 'Sign In',
    submitRegister: 'Register as Participant',
    googleSignIn: 'Continue with Google',
    deadlineBannerTitle: 'Registration Deadline (Nov 20, EST)',
    deadlineDateText: 'November 20, 2026, 11:59 PM EST',
    deadlinePassed: 'Registration Deadline Passed',
    days: 'days',
    hours: 'hrs',
    minutes: 'min',
    seconds: 'sec',
    demoDayBadge: 'Demo Day: January 2027',
    yourSevenDigitId: 'Your Unique 7-Digit Participant ID',
    sevenDigitIdHint: 'Share this 7-digit code with your Team Leader so they can invite you to their team',
    copied: 'Copied',
    copyId: 'Copy ID',
    roleAdmin: 'Admin & Lead Jury',
    roleSoftwareTutor: 'Software Teacher & Jury (60 pts)',
    roleHardwareTutor: 'Hardware Teacher & Jury (60 pts)',
    roleJury: 'Jury Member (50 pts)',
    roleParticipant: 'Participant',
    startCompetitionBtn: 'Register for GulistanPS Startup Competition 26/27',
    pendingInvitesTitle: 'Team Invitations Sent to Your 7-Digit ID (Approval Required)',
    invitedByLeader: 'Invited by Team Leader:',
    approveAndJoin: 'Approve & Join Team',
    declineInvite: 'Decline',
    approvedStatus: 'Approved & Joined',
    pendingStatus: 'Awaiting Teammate Approval',
    declinedStatus: 'Declined',
    section1Title: '01. Team Formation & 7-Digit ID Invitations',
    section1Subtitle: 'Teams must have between 2 and 4 members. Enter each teammate’s 7-digit ID; they will receive the request in their account to approve and join.',
    teamNameLabel: 'Team Name',
    teamNamePlaceholder: 'Enter your team name',
    teamSizeLabel: 'Number of People in Team (2 – 4 members)',
    teamSizeHelper: 'Must be strictly 2, 3, or 4 people including the Team Leader (outside this range is not considered)',
    teamLogoLabel: 'Team Logo',
    optionalTag: 'Optional',
    requiredTag: 'Required',
    teammatesSectionLabel: 'Invite Teammates by Unique 7-Digit ID',
    teammatesSectionDesc: 'Enter the 7-digit ID of each teammate. Once submitted, that student will see the invite in their account and approve to join.',
    enterTeammateIdPlaceholder: 'Enter 7-digit ID (e.g., 1234567)',
    lookupIdBtn: 'Verify ID',
    section2Title: '02. Startup Project Details & Deliverables',
    section2Subtitle: 'Provide your project name, category, subject integration, GitHub repository, presentation, and optional video.',
    projectNameLabel: 'Project Name',
    projectNamePlaceholder: 'Enter your project name',
    projectLogoLabel: 'Project Logo',
    projectTypeLabel: 'Project Type',
    projectDescLabel: 'Project Summary (up to 250 characters)',
    projectDescPlaceholder: 'Describe your startup project in up to 250 characters...',
    subjectsLabel: 'Blended School Subjects (Multiple Selection Allowed)',
    subjectsHelper: 'Select at least one school subject your project blends into',
    githubRepoLabel: 'GitHub Repository URL',
    githubRepoPlaceholder: 'https://github.com/username/repository',
    presentationLabel: 'Presentation (Slide Deck Link or Upload)',
    presentationPlaceholder: 'Presentation URL (Google Slides, Canva, PDF)',
    uploadFileBtn: 'Upload File',
    videoMaterialLabel: 'Additional Video Material',
    videoMaterialPlaceholder: 'Video URL or upload video demonstration',
    saveRegistrationBtn: 'Submit Team & Project Registration',
    registrationSavedMsg: 'Registration saved! Invitations have been sent to your teammates’ 7-digit IDs.',
    waitingTeammateApprovalNote: 'Note: Invited teammates must log into their accounts and click "Approve & Join Team".',
    allTeammatesApprovedNote: 'All teammates have approved and joined! Your project is ready for Demo Day.',
    mentorshipHubTitle: 'Tutor Communication & Idea Exchange',
    mentorshipHubSubtitle: 'Communicate and exchange ideas with the Software Teacher and Hardware Teacher. Tutors grade team activeness/networking out of 10 points.',
    softwareTutorCard: 'Software Teacher (API, Backend, Architecture)',
    hardwareTutorCard: 'Hardware Teacher (Robotics, Sensors, Electronics)',
    sendMessagePlaceholder: 'Share your progress, backend/hardware design, or ask a question...',
    sendBtn: 'Send Message',
    targetBothTutors: 'Both Tutors (Software + Hardware)',
    targetSoftwareTutor: 'Software Teacher Only',
    targetHardwareTutor: 'Hardware Teacher Only',
    juryPortalTitle: 'Demo Day (January 2027) — Real-Time Jury Grading',
    juryPortalSubtitle: 'Standard Juries grade out of 50 pts; Software & Hardware Tutors grade out of 60 pts. All scores are converted into x/100 and averaged.',
    rubricMvp: 'Readiness of MVP',
    rubricMvpDesc: 'Working prototype quality, completeness, and functional reliability (0–15 pts)',
    rubricIdea: 'Idea & Innovation',
    rubricIdeaDesc: 'Problem relevance, originality, and real-world impact (0–15 pts)',
    rubricPresentation: 'Presentation Delivery',
    rubricPresentationDesc: 'Clarity of pitch, slide design, and Q&A handling (0–10 pts)',
    rubricTechnical: 'Behind-the-Scenes Explanation (API, Backend & Architecture)',
    rubricTechnicalDesc: 'Participants explaining how the project works under the hood: API, backend, hardware logic (0–10 pts)',
    rubricActiveness: 'Activeness & Networking with Tutor',
    rubricActivenessDesc: 'For Software & Hardware Tutors only: frequency and quality of idea exchange & mentorship (0–10 pts)',
    feedbackLabel: 'Jury Feedback & Notes',
    feedbackPlaceholder: 'Write constructive feedback for the team...',
    submitGradeBtn: 'Save Real-Time Score',
    rawScoreLabel: 'Raw Total',
    normalizedScoreLabel: 'Converted Score (x/100)',
    rankingsTitle: 'Demo Day Results & Rankings',
    rankingsSubtitle: 'Calculated by converting Tutor scores (x/60 -> x/100) and Jury scores (x/50 -> x/100) and taking the overall average.',
    rank1st: '1ST PLACE WINNER',
    rank2nd: '2ND PLACE RUNNER-UP',
    rank3rd: '3RD PLACE HONOREE',
    yourGroupResultTitle: 'Your Group’s Demo Day Result',
    tutorAvgLabel: 'Tutors Converted (60 -> 100)',
    regularJuryAvgLabel: 'Juries Converted (50 -> 100)',
    finalCombinedAvgLabel: 'Final Combined Average (/100)',
    adminPanelTitle: 'Admin Control Center',
    adminPanelSubtitle: 'Register Jury, Software Teacher, and Hardware Teacher accounts, promote users, and manage security.',
    createJuryTutorTitle: 'Register New Jury / Tutor Account',
    createJuryTutorSubtitle: 'Directly create an account for a Jury member, Software Teacher, or Hardware Teacher with login and password:',
    staffLoginLabel: 'Login / Username or Email',
    staffLoginPlaceholder: 'e.g., software_tutor',
    createStaffBtn: 'Create Jury / Tutor Account',
    staffCreatedMsg: 'Jury / Tutor account created successfully!',
    changePasswordTitle: 'Change Password',
    currentPasswordLabel: 'Current Password',
    newPasswordLabel: 'New Password',
    updatePasswordBtn: 'Update Password',
    passwordUpdatedMsg: 'Password updated successfully!',
    userPromotionsTitle: 'Manage Accounts & Promote Roles',
    userPromotionsDesc: 'Assign Jury mode (50 pts max), Software Teacher (60 pts max), and Hardware Teacher (60 pts max):',
    toggleJury: 'Jury Mode',
    toggleSoftwareTutor: 'Software Teacher',
    toggleHardwareTutor: 'Hardware Teacher',
    subjects: {
      chemistry: 'Chemistry',
      biology: 'Biology',
      physics: 'Physics',
      mathematics: 'Mathematics',
      informatics: 'Informatics / CS',
      geography_ecology: 'Geography & Ecology',
      economics: 'Economics',
      engineering_design: 'Engineering & Design',
      literature_languages: 'Literature & Languages',
      history_social: 'History & Social Studies',
    },
  },
  ru: {
    brandTitle: 'GulistanPS Startup 26/27',
    subtitle: 'Официальная платформа конкурса стартапов Президентской школы в Гулистане',
    navOverview: 'Обзор',
    navRegistration: 'Регистрация проекта',
    navMentorship: 'Связь с менторами',
    navJuryGrading: 'Оценка жюри',
    navRankings: 'Результаты и Рейтинг',
    navAdmin: 'Панель админа',
    signIn: 'Войти',
    signOut: 'Выйти',
    register: 'Регистрация',
    loginTitle: 'Вход в систему',
    loginSubtitle: 'Войдите в свой аккаунт участника, ментора или члена жюри',
    registerTitle: 'GulistanPS Startup Competition 26/27 — Регистрация участника',
    registerSubtitle: 'Каждый новый пользователь регистрируется как участник и получает уникальный 7-значный ID',
    identifierLabel: 'Логин, Email или 7-значный ID',
    identifierPlaceholder: 'Введите логин или email',
    passwordLabel: 'Пароль',
    nameLabel: 'Имя',
    surnameLabel: 'Фамилия',
    gradeLabel: 'Класс',
    emailLabel: 'Электронная почта',
    submitLogin: 'Войти',
    submitRegister: 'Зарегистрироваться как участник',
    googleSignIn: 'Продолжить через Google',
    deadlineBannerTitle: 'Дедлайн регистрации (20 ноября, EST)',
    deadlineDateText: '20 ноября 2026 г., 23:59 EST',
    deadlinePassed: 'Срок регистрации истек',
    days: 'дн',
    hours: 'ч',
    minutes: 'мин',
    seconds: 'сек',
    demoDayBadge: 'Demo Day: Январь 2027',
    yourSevenDigitId: 'Ваш уникальный 7-значный ID участника',
    sevenDigitIdHint: 'Передайте этот 7-значный код лидеру команды, чтобы он пригласил вас в команду',
    copied: 'Скопировано',
    copyId: 'Копировать ID',
    roleAdmin: 'Главный Админ и Жюри',
    roleSoftwareTutor: 'Учитель Software и Жюри (60 б.)',
    roleHardwareTutor: 'Учитель Hardware и Жюри (60 б.)',
    roleJury: 'Член жюри (50 б.)',
    roleParticipant: 'Участник',
    startCompetitionBtn: 'Зарегистрироваться на GulistanPS Startup Competition 26/27',
    pendingInvitesTitle: 'Приглашения в команду по вашему 7-значному ID',
    invitedByLeader: 'Лидер команды:',
    approveAndJoin: 'Подтвердить и вступить',
    declineInvite: 'Отклонить',
    approvedStatus: 'Подтверждено',
    pendingStatus: 'Ожидает подтверждения',
    declinedStatus: 'Отклонено',
    section1Title: '01. Формирование команды по 7-значному ID',
    section1Subtitle: 'В команде должно быть от 2 до 4 человек. Введите 7-значный ID каждого сокомандника — он получит приглашение и подтвердит вход.',
    teamNameLabel: 'Название команды',
    teamNamePlaceholder: 'Введите название команды',
    teamSizeLabel: 'Количество человек в команде (от 2 до 4)',
    teamSizeHelper: 'Строго 2, 3 или 4 человека включая лидера (вне этого диапазона не рассматривается)',
    teamLogoLabel: 'Логотип команды',
    optionalTag: 'Необязательно',
    requiredTag: 'Обязательно',
    teammatesSectionLabel: 'Приглашение участников по 7-значному ID',
    teammatesSectionDesc: 'Введите 7-значный ID каждого участника команды. Участник увидит приглашение в своем профиле и подтвердит его.',
    enterTeammateIdPlaceholder: 'Введите 7-значный ID (напр.: 1234567)',
    lookupIdBtn: 'Проверить ID',
    section2Title: '02. Описание стартап-проекта и материалы',
    section2Subtitle: 'Укажите название проекта, тип, интеграцию со школьными предметами, GitHub и презентацию.',
    projectNameLabel: 'Название проекта',
    projectNamePlaceholder: 'Введите название проекта',
    projectLogoLabel: 'Логотип проекта',
    projectTypeLabel: 'Тип проекта',
    projectDescLabel: 'Краткое описание проекта (до 250 символов)',
    projectDescPlaceholder: 'Опишите суть и архитектуру вашего проекта (максимум 250 символов)...',
    subjectsLabel: 'Интеграция со школьными предметами (множественный выбор)',
    subjectsHelper: 'Выберите минимум один предмет, с которым связан ваш проект',
    githubRepoLabel: 'Ссылка на GitHub репозиторий',
    githubRepoPlaceholder: 'https://github.com/username/project',
    presentationLabel: 'Презентация (ссылка или файл)',
    presentationPlaceholder: 'Ссылка на презентацию (Google Slides, Canva, PDF)',
    uploadFileBtn: 'Загрузить файл',
    videoMaterialLabel: 'Дополнительный видеоматериал',
    videoMaterialPlaceholder: 'Ссылка на видео или загрузка видеофайла',
    saveRegistrationBtn: 'Отправить заявку команды и проекта',
    registrationSavedMsg: 'Заявка сохранена! Приглашения отправлены участникам по их 7-значным ID.',
    waitingTeammateApprovalNote: 'Важно: Приглашенные участники должны войти в свои аккаунты и нажать «Подтвердить и вступить».',
    allTeammatesApprovedNote: 'Все участники подтвердили участие! Проект полностью зарегистрирован.',
    mentorshipHubTitle: 'Общение и обмен идеями с Software и Hardware учителями',
    mentorshipHubSubtitle: 'Участники должны общаться и обмениваться идеями с тьюторами. Тьюторы оценивают активность взаимодействия до 10 баллов.',
    softwareTutorCard: 'Учитель Software (Код, API, Backend)',
    hardwareTutorCard: 'Учитель Hardware (Робототехника, Электроника, Датчики)',
    sendMessagePlaceholder: 'Напишите вопрос, идею или отчет о прогрессе для учителей...',
    sendBtn: 'Отправить',
    targetBothTutors: 'Обоим учителям (Software + Hardware)',
    targetSoftwareTutor: 'Учителю Software',
    targetHardwareTutor: 'Учителю Hardware',
    juryPortalTitle: 'Demo Day (Январь 2027) — Оценивание в реальном времени',
    juryPortalSubtitle: 'Обычное жюри оценивает из 50 баллов, учителя-тьюторы — из 60 баллов. Все оценки переводятся в x/100 и усредняются.',
    rubricMvp: 'Готовность MVP (Readiness of MVP)',
    rubricMvpDesc: 'Работоспособность и завершенность прототипа (0–15 баллов)',
    rubricIdea: 'Идея и актуальность (Idea)',
    rubricIdeaDesc: 'Новизна, практическая значимость и ценность идеи (0–15 баллов)',
    rubricPresentation: 'Презентация (Presentation)',
    rubricPresentationDesc: 'Качество выступления, слайдов и ответов на вопросы (0–10 баллов)',
    rubricTechnical: 'Объяснение внутренней части (API, Backend и др.)',
    rubricTechnicalDesc: 'Понимание участниками технической реализации: API, бэкенд, логика работы (0–10 баллов)',
    rubricActiveness: 'Активность и общение с тьютором (Activeness / Networking)',
    rubricActivenessDesc: 'Только для Software и Hardware учителей: регулярность обмена идеями и консультаций (0–10 баллов)',
    feedbackLabel: 'Комментарий члена жюри',
    feedbackPlaceholder: 'Оставьте отзыв по проекту...',
    submitGradeBtn: 'Сохранить оценку',
    rawScoreLabel: 'Первичный балл',
    normalizedScoreLabel: 'В 100-балльной шкале (x/100)',
    rankingsTitle: 'Результаты Demo Day и Полный Рейтинг',
    rankingsSubtitle: 'Оценки тьюторов (x/60 -> x/100) и жюри (x/50 -> x/100) конвертируются и вычисляется среднее арифметическое.',
    rank1st: '1 МЕСТО — ПОБЕДИТЕЛЬ',
    rank2nd: '2 МЕСТО — ПРИЗЕР',
    rank3rd: '3 МЕСТО — ПРИЗЕР',
    yourGroupResultTitle: 'Результат вашей команды на Demo Day',
    tutorAvgLabel: 'Тьюторы (60 -> 100)',
    regularJuryAvgLabel: 'Жюри (50 -> 100)',
    finalCombinedAvgLabel: 'Итоговый средний балл (/100)',
    adminPanelTitle: 'Панель Администратора',
    adminPanelSubtitle: 'Регистрация аккаунтов жюри, учителей Software и Hardware, назначение ролей и смена пароля.',
    createJuryTutorTitle: 'Зарегистрировать члена Жюри / Тьютора',
    createJuryTutorSubtitle: 'Создайте аккаунт для члена жюри, учителя Software или учителя Hardware с логином и паролем:',
    staffLoginLabel: 'Логин или Email',
    staffLoginPlaceholder: 'Напр.: software_tutor',
    createStaffBtn: 'Создать аккаунт жюри / учителя',
    staffCreatedMsg: 'Аккаунт жюри/учителя успешно создан!',
    changePasswordTitle: 'Изменить пароль',
    currentPasswordLabel: 'Текущий пароль',
    newPasswordLabel: 'Новый пароль',
    updatePasswordBtn: 'Обновить пароль',
    passwordUpdatedMsg: 'Пароль успешно обновлен!',
    userPromotionsTitle: 'Управление аккаунтами и назначение ролей',
    userPromotionsDesc: 'Укажите, кто является членом Жюри (50 б.), учителем Software (60 б.) и учителем Hardware (60 б.):',
    toggleJury: 'Член жюри',
    toggleSoftwareTutor: 'Software учитель',
    toggleHardwareTutor: 'Hardware учитель',
    subjects: {
      chemistry: 'Химия',
      biology: 'Биология',
      physics: 'Физика',
      mathematics: 'Математика',
      informatics: 'Информатика',
      geography_ecology: 'География и Экология',
      economics: 'Экономика',
      engineering_design: 'Инженерия и Дизайн',
      literature_languages: 'Литература и Языки',
      history_social: 'История и Обществознание',
    },
  },
};
