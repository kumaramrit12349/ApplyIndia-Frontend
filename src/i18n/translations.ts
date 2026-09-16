import type { Language } from "../context/LanguageContext";

export interface GuidanceTranslations {
  cardTitle: string;
  intro: string;
  step1Title: string;
  step1Desc: string;
  watchVideo: string;
  videoUnavailable: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  sessionsUsed: (used: number, max: number) => string;
  upcomingSession: string;
  manageBooking: string;
  usedUp: string;
  bookSlot: string;
  readTestimonials: string;
}

export interface FooterTranslations {
  about: string;
  legalTitle: string;
  privacyPolicy: string;
  termsConditions: string;
  disclaimer: string;
  aboutUs: string;
  connectTitle: string;
  successStories: string;
  sendFeedback: string;
  rightsReserved: string;
  backToTop: string;
}

export interface NavTranslations {
  login: string;
  signup: string;
  myDashboard: string;
  myGuidanceBookings: string;
  profile: string;
  notificationPreferences: string;
  logout: string;
}

export interface HomeTranslations {
  searchResults: string;
  noMatchingNotifications: string;
  noMoreResults: string;
  centralOnly: string;
  stateAndCentral: (state: string) => string;
  allStates: string;
  setStatePrompt: string;
  setYourState: string;
  signInStatePrompt: string;
  signIn: string;
}

export interface HeroTranslations {
  kickerJobs: string;
  kickerAdmissions: string;
  kickerScholarships: string;
  kickerExams: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  browseNotifications: string;
  exploreOpenOpportunities: string;
  verifiedSources: string;
  updatedDaily: string;
  free: string;
}

export interface WhyChooseTranslations {
  title: string;
  subtitle: string;
  reasons: { title: string; description: string }[];
}

export interface FaqTranslations {
  title: string;
  items: { question: string; answer: string }[];
}

export interface JobBannerTranslations {
  latestUpdates: string;
  noActive: string;
  lastDate: string;
}

export interface SearchTranslations {
  placeholder: string;
  categoriesHeader: string;
  statesHeader: string;
  home: string;
  search: string;
  clearSearch: string;
}

export interface GuidanceModalTranslations {
  title: string;
  application: string;
  failedToLoadSlots: string;
  loadingSlots: string;
  noSlotsTitle: string;
  noSlotsDesc: string;
  selectDate: string;
  selectDatePlaceholder: string;
  slotCount: (n: number) => string;
  selectTime: string;
  selectTimePlaceholder: string;
  confirmDate: string;
  confirmTimeLabel: string;
  confirmMode: string;
  googleMeet: string;
  free: string;
  issueNoteLabel: string;
  issueNotePlaceholder: string;
  close: string;
  continueBtn: string;
  back: string;
  booking: string;
  confirmBooking: string;
  done: string;
  bookingLimitReached: string;
  activeBookingExists: string;
  slotAlreadyBooked: string;
  bookingFailed: string;
  successTitle: string;
  successDesc: string;
}

export interface MyBookingsTranslations {
  statusUpcoming: string;
  statusCompleted: string;
  statusNoShow: string;
  statusCancelled: string;
  statusCancelledByAdmin: string;
  today: string;
  joinMeeting: string;
  joinAvailableHint: (minutes: number) => string;
  cancel: string;
  giveFeedback: string;
  loadFailed: string;
  cancelledToast: string;
  cancelWindowPassed: (minutes: number) => string;
  cancelFailed: string;
  emptyTitle: string;
  emptyDesc: string;
  maxSessionsNote: (max: number) => string;
  cancelModalTitle: string;
  cancelModalConfirm: string;
  cancelModalMessage: string;
  cancelModalNote: (max: number) => string;
}

export interface FeedbackModalTranslations {
  title: string;
  application: string;
  rating: string;
  starLabel: (n: number) => string;
  problemSolvedLabel: string;
  topicsLabel: string;
  messageLabel: string;
  consentLabel: string;
  cancel: string;
  submitting: string;
  submitFeedback: string;
  thankYou: string;
  alreadySubmitted: string;
  submitFailed: string;
}

export interface TestimonialsTranslations {
  title: string;
  subtitle: string;
  empty: string;
}

export interface ListViewTranslations {
  loading: string;
  noNotifications: string;
  seeMore: string;
  seeLess: string;
  statusClosed: string;
  statusClosingSoon: string;
  statusOpen: string;
  addToWishlist: string;
  removeFromWishlist: string;
  applicationsClosedTooltip: string;
  loginToWishlist: string;
  removedFromWishlist: string;
  applicationsClosedToast: string;
  wishlistUpdateFailed: string;
  wishlistAddedTitle: string;
  wishlistAddedDesc: string;
  goToMyDashboard: string;
  close: string;
  categoryNames: Record<string, string>;
}

export interface BrowseTranslations {
  allNotifications: string;
  eligibleNotifications: string;
  showingResultsFor: (query: string) => string;
  completeProfileTitle: string;
  completeProfileDesc: string;
  completeProfileCta: string;
  noEligibleFound: string;
  noNotificationsAvailable: string;
  noMoreNotifications: string;
}

export interface OpenBrowserTranslations {
  acceptingApplications: (n: number) => string;
  searchByTitle: string;
  allCategories: string;
  allStatesShort: string;
  searchState: string;
  closingIn2Days: string;
  noMatch: string;
  noMoreNotifications: string;
  vacancies: string;
  fee: string;
  free: string;
  lastDateToApply: string;
  viewDetails: string;
}

export interface DetailViewTranslations {
  notReleased: string;
  notSpecified: string;
  notAvailable: string;
  minAge: (n: number) => string;
  maxAge: (n: number) => string;
  ageRange: (min: number, max: number) => string;
  applicationsClosed: string;
  lastDayToApply: string;
  daysLeft: (n: number) => string;
  wishlisted: string;
  addToWishlist: string;
  checkEligibility: string;
  loginToTrack: string;
  loginToWishlist: string;
  loginToCheckEligibility: string;
  applicationsClosedToast: string;
  completePreviousStep: string;
  trackActivityFailed: string;
  removedFromWishlist: string;
  addedToWishlist: string;
  wishlistUpdateFailed: string;
  eligibilityCheckFailed: string;
  retryTriggered: string;
  retryFailed: string;
  step1Label: string;
  step1CongratsTitle: string;
  step1CongratsMessage: string;
  step2Label: string;
  step2CongratsTitle: string;
  step2CongratsMessage: string;
  step3Label: string;
  step3CongratsTitle: string;
  step3CongratsMessage: string;
  step4Label: string;
  step4CongratsTitle: string;
  step4CongratsMessage: string;
  statWishlisted: string;
  statApplied: string;
  statAdmitCard: string;
  statResult: string;
  statSelected: string;
  quickOverview: string;
  basicDetails: string;
  importantDates: string;
  applicationFees: string;
  eligibilityTitle: string;
  fullNotificationDetails: string;
  importantLinks: string;
  applicantActivity: string;
  category: string;
  department: string;
  stateRegion: string;
  totalVacancies: string;
  startDate: string;
  lastDateToApplyLabel: string;
  examDate: string;
  admitCardDate: string;
  resultDate: string;
  age: string;
  qualification: string;
  specialization: string;
  minimumPercentage: string;
  noApplicationFee: string;
  feeGen: string;
  feeEws: string;
  feeObc: string;
  feeSc: string;
  feeSt: string;
  feePh: string;
  feeFemale: string;
  linkAdmitCard: string;
  linkNotificationPdf: string;
  linkOfficialWebsite: string;
  linkResult: string;
  linkAnswerKey: string;
  linkYoutube: string;
  linkOtherLinks: string;
  applyOnline: string;
  trackYourProgress: string;
  trackSubtitle: string;
  closedNoticeBold: string;
  closedNoticeRest: string;
  noteLabel: string;
  trackNotePart1: string;
  threeTimesLabel: string;
  trackNotePart2: string;
  dashboardBtn: string;
  trackNotePart3: string;
  trackTooltipClosed: string;
  loading: string;
}

export interface Translations {
  guidance: GuidanceTranslations;
  footer: FooterTranslations;
  nav: NavTranslations;
  home: HomeTranslations;
  hero: HeroTranslations;
  whyChoose: WhyChooseTranslations;
  faq: FaqTranslations;
  jobBanner: JobBannerTranslations;
  search: SearchTranslations;
  guidanceModal: GuidanceModalTranslations;
  myBookings: MyBookingsTranslations;
  feedbackModal: FeedbackModalTranslations;
  testimonials: TestimonialsTranslations;
  listView: ListViewTranslations;
  browse: BrowseTranslations;
  openBrowser: OpenBrowserTranslations;
  detail: DetailViewTranslations;
  detailPage: { loading: string; notFound: string };
  dashboard: DashboardTranslations;
  profile: ProfileTranslations;
  notifPrefs: NotifPrefsTranslations;
  contactFeedback: ContactFeedbackTranslations;
  auth: AuthTranslations;
  authFlow: AuthFlowTranslations;
  support: SupportTranslations;
  eligibility: EligibilityTranslations;
  congrats: CongratsTranslations;
  legal: LegalTranslations;
}

export interface LegalTranslations {
  alsoSee: string;
  aboutTitle: string;
  aboutDesc: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
  disclaimerTitle: string;
  disclaimerDesc: string;
  disclaimerIntro: string;
  noGovAffiliationTitle: string;
  noGovAffiliationDesc: string;
  noLegalResponsibilityTitle: string;
  noLegalResponsibilityDesc: string;
  privacyTitle: string;
  privacyDesc: string;
  privacyIntro: string;
  infoWeCollect: string;
  infoWeCollectItem1: string;
  infoWeCollectItem2: string;
  howWeUseInfo: string;
  howWeUseInfoItem1: string;
  howWeUseInfoItem2: string;
  howWeUseInfoItem3: string;
  cookiesAdsense: string;
  cookiesAdsenseDesc: string;
  optOutPrompt: string;
  thirdPartyLinks: string;
  thirdPartyLinksDesc: string;
  contactUs: string;
  contactUsDesc: string;
  termsTitle: string;
  termsDesc: string;
  termsIntro: string;
  contentAccuracy: string;
  contentAccuracyDesc: string;
  userResponsibility: string;
  userResponsibilityItem1: string;
  userResponsibilityItem2: string;
  intellectualProperty: string;
  intellectualPropertyPrefix: string;
  intellectualPropertySuffix: string;
  changes: string;
  changesDesc: string;
}

export interface SupportTranslations {
  limitReached: string;
  limitReachedDesc: string;
  contactPrompt: string;
  close: string;
}

export interface EligibilityTranslations {
  checking: string;
  checkingEllipsis: string;
  completeProfileTitle: string;
  completeProfileDesc: string;
  completeProfileCta: string;
  eligibleTitle: string;
  eligibleDesc: string;
  notEligibleTitle: string;
  disclaimer: string;
}

export interface CongratsTranslations {
  defaultTitle: string;
  defaultMessage: string;
  continueLabel: string;
}

export interface AuthFlowTranslations {
  forgotPasswordTitle: string;
  forgotPasswordDesc: string;
  emailAddress: string;
  sending: string;
  sendResetCode: string;
  resetCodeFailed: string;
  resetPasswordTitle: string;
  resetPasswordDesc: (email: string) => string;
  verificationCode: string;
  enterCode: string;
  newPassword: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  confirmNewPasswordPlaceholder: string;
  passwordsDontMatch: string;
  resetting: string;
  resetPasswordBtn: string;
  resetPasswordFailed: string;
  verifyAccountTitle: string;
  verifyAccountDesc: (email: string) => string;
  verifying: string;
  verify: string;
  resendCode: string;
  accountVerified: string;
  verificationFailed: string;
  codeResent: string;
  resendFailed: string;
}

export interface AuthTranslations {
  logIn: string;
  createAccount: string;
  newUser: string;
  registerNow: string;
  alreadyHaveAccount: string;
  continueWithGoogle: string;
  or: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  selectGender: string;
  male: string;
  female: string;
  other: string;
  preferNotToSay: string;
  forgotPassword: string;
  signingIn: string;
  signingUp: string;
  signIn: string;
  loginFailed: string;
  registrationFailed: string;
}

export interface ContactFeedbackTranslations {
  title: string;
  subtitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  trustLine: string;
  sending: string;
  submit: string;
  thankYou: string;
  submitFailed: string;
}

export interface NotifPrefsTranslations {
  title: string;
  editPreferences: string;
  emailNotifications: string;
  whatsappNotifications: string;
  enabled: string;
  disabled: string;
  subscribedTopics: string;
  allTopics: string;
  topicsHint: string;
  cancel: string;
  saving: string;
  saveChanges: string;
  noChangesToSave: string;
  updated: string;
  updateFailed: string;
  loading: string;
}

export interface ProfileTranslations {
  myProfile: string;
  administrator: string;
  editProfile: string;
  locationNotSpecified: string;
  personalInfo: string;
  fullName: string;
  gender: string;
  dob: string;
  category: string;
  phoneNumber: string;
  notSpecified: string;
  educationSkills: string;
  highestQualification: string;
  specialization: string;
  percentageObtained: string;
  editYourProfile: string;
  firstName: string;
  lastName: string;
  selectGender: string;
  male: string;
  female: string;
  other: string;
  state: string;
  selectState: string;
  selectCategory: string;
  phonePlaceholder: string;
  phoneHint: string;
  selectQualification: string;
  percentagePlaceholder: string;
  percentageHint: string;
  cancel: string;
  saving: string;
  saveChanges: string;
  noChangesToSave: string;
  profileUpdated: string;
  updateFailed: string;
  loading: string;
}

export interface DashboardTranslations {
  title: string;
  subtitle: string;
  myApplications: string;
  exploreOpen: string;
  myGuidanceBookings: string;
  loading: string;
  loadFailed: string;
  statWishlisted: string;
  statApplied: string;
  statAdmitCard: string;
  statResult: string;
  statSelected: string;
  all: (n: number) => string;
  removeTracking: string;
  emptyTitle: string;
  emptyDesc: string;
  browseNotifications: string;
  updated: string;
  entryRemoved: string;
  removeFailed: string;
  removeModalTitle: string;
  removeModalConfirm: string;
  removeModalMessage: string;
  removeModalNote: string;
}

/**
 * Per-feature translation dictionaries. Only the "guidance" namespace is
 * populated today — add a new namespace here (and to both `en`/`hi`
 * entries) as other features adopt useTranslation(). The `Translations`
 * interface keeps both languages' shapes in sync at compile time.
 */
export const translations: Record<Language, Translations> = {
  en: {
    guidance: {
      cardTitle: "Stuck While Applying?",
      intro:
        "Before booking, follow these 3 quick steps — most applicants can finish on their own after watching the video.",
      step1Title: "Watch the guidance video",
      step1Desc: "See a walkthrough of the exact application form and common mistakes to avoid.",
      watchVideo: "Watch: How to Apply",
      videoUnavailable: "Video not available for this notification yet.",
      step2Title: "Try applying yourself",
      step2Desc: "Head to the official application portal and fill the form using what you just watched.",
      step3Title: "Still stuck? Book a free session",
      step3Desc:
        "Get a FREE 15-minute 1:1 online guidance session. You can book up to 3 free sessions for this application.",
      sessionsUsed: (used, max) => `${used} of ${max} free sessions used`,
      upcomingSession: "You have an upcoming session booked for this application.",
      manageBooking: "Manage My Booking",
      usedUp: "You've used all 3 free guidance sessions for this application.",
      bookSlot: "Book Free Guidance Slot",
      readTestimonials: "Read what others say",
    },
    footer: {
      about:
        "provides verified government job, entrance exam, admission, and scholarship notifications across India. We ensure timely, authentic updates sourced from official authorities to help you stay informed and ahead.",
      legalTitle: "Legal",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",
      disclaimer: "Disclaimer",
      aboutUs: "About Us",
      connectTitle: "Connect With Us",
      successStories: "Success Stories",
      sendFeedback: "Send Feedback",
      rightsReserved: "All rights reserved.",
      backToTop: "Back to top",
    },
    nav: {
      login: "Log in",
      signup: "Sign up",
      myDashboard: "My Dashboard",
      myGuidanceBookings: "My Guidance Bookings",
      profile: "Profile",
      notificationPreferences: "Notification Preferences",
      logout: "Logout",
    },
    home: {
      searchResults: "Search Results",
      noMatchingNotifications: "No matching notifications.",
      noMoreResults: "No more results.",
      centralOnly: "Central Only",
      stateAndCentral: (state) => `${state} + Central`,
      allStates: "All States",
      setStatePrompt: "Set your state to see notifications relevant to you, alongside Central Government notifications.",
      setYourState: "Set Your State",
      signInStatePrompt: "Sign in and set your state to personalize your feed with notifications relevant to you.",
      signIn: "Sign In",
    },
    hero: {
      kickerJobs: "Jobs",
      kickerAdmissions: "Admissions",
      kickerScholarships: "Scholarships",
      kickerExams: "Exams",
      titlePrefix: "Your Gateway to",
      titleHighlight: "Government Opportunities",
      subtitle: "One place for every verified government opportunity across India — always free.",
      browseNotifications: "Browse Notifications",
      exploreOpenOpportunities: "Explore Open Opportunities",
      verifiedSources: "Verified sources",
      updatedDaily: "Updated daily",
      free: "100% free",
    },
    whyChoose: {
      title: "Why Choose Apply India",
      subtitle: "Built to cut through the noise of government notification sites.",
      reasons: [
        {
          title: "Verified, Not Just Scraped",
          description:
            "Every notification is reviewed by our team before it goes live — filtering out spam, duplicates, and stale postings.",
        },
        {
          title: "Never Miss a Deadline",
          description:
            "Every listing shows its last date to apply at a glance, with a clear Open, Closing Soon, or Closed status.",
        },
        {
          title: "Everything in One Place",
          description:
            "Jobs, admit cards, results, answer keys, and syllabus — linked together so you don't have to hunt across a dozen sites.",
        },
        {
          title: "Track Your Own Applications",
          description:
            "Wishlist any notification and follow it from Applied through to Result on your personal dashboard.",
        },
      ],
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Is Apply India free to use?",
          answer:
            "Yes. Browsing, searching, and tracking notifications on Apply India is completely free — there's no paywall or premium tier.",
        },
        {
          question: "Do I need an account to browse notifications?",
          answer:
            "No. You can search and read every notification without signing in. An account is only needed if you want to wishlist a notification or track your application progress.",
        },
        {
          question: "How are notifications verified before they're published?",
          answer:
            "Every notification is reviewed by our team before it goes live. We check the source, dates, and details to filter out spam, duplicates, and stale postings.",
        },
        {
          question: "How do I track an application I've applied to?",
          answer:
            "Wishlist any notification from its listing or detail page, then open My Dashboard to move it through Applied, Admit Card, Result, and Selected as your application progresses.",
        },
        {
          question: "Can I filter notifications by my state?",
          answer:
            "Yes. Use the state pills on the homepage or the state filter in search to see notifications specific to your state alongside central government postings.",
        },
        {
          question: "I found incorrect information in a notification — what do I do?",
          answer: "Use the Send Feedback link in the footer to report it, and our team will review and correct it.",
        },
      ],
    },
    jobBanner: {
      latestUpdates: "Latest Updates",
      noActive: "No active application notifications available. New government opportunities will appear here soon.",
      lastDate: "Last Date",
    },
    search: {
      placeholder: "Search notifications...",
      categoriesHeader: "Categories",
      statesHeader: "States / Regions",
      home: "Home",
      search: "Search",
      clearSearch: "Clear search",
    },
    guidanceModal: {
      title: "Free Application Guidance",
      application: "Application:",
      failedToLoadSlots: "Failed to load available slots",
      loadingSlots: "Loading available slots…",
      noSlotsTitle: "No slots available right now",
      noSlotsDesc: "Every guidance slot for this application is currently booked. Please check back later — new slots open up regularly.",
      selectDate: "Select a Date",
      selectDatePlaceholder: "-- Select a date --",
      slotCount: (n) => `${n} slot${n === 1 ? "" : "s"}`,
      selectTime: "Select a Time Slot",
      selectTimePlaceholder: "-- Select a time --",
      confirmDate: "Date",
      confirmTimeLabel: "Time · 15 minutes",
      confirmMode: "Mode",
      googleMeet: "Google Meet",
      free: "100% Free",
      issueNoteLabel: "What do you need help with? (optional)",
      issueNotePlaceholder: "e.g. I am unable to upload my photograph.",
      close: "Close",
      continueBtn: "Continue",
      back: "Back",
      booking: "Booking...",
      confirmBooking: "Confirm Booking",
      done: "Done",
      bookingLimitReached: "You've used all 3 free guidance slots for this application.",
      activeBookingExists: "You already have an upcoming guidance session for this application.",
      slotAlreadyBooked: "Someone just booked this slot. Please pick another.",
      bookingFailed: "Failed to book this slot. Please try again.",
      successTitle: "Guidance Slot Booked!",
      successDesc: "We've sent you a confirmation email with the meeting link. You can join the session — and find this booking anytime — under \"My Guidance Bookings\" in your dashboard once it's time.",
    },
    myBookings: {
      statusUpcoming: "Upcoming",
      statusCompleted: "Completed",
      statusNoShow: "No Show",
      statusCancelled: "Cancelled",
      statusCancelledByAdmin: "Cancelled by Apply India",
      today: "Today",
      joinMeeting: "Join Meeting",
      joinAvailableHint: (minutes) => `Available ${minutes} minutes before your session starts`,
      cancel: "Cancel",
      giveFeedback: "Give Feedback",
      loadFailed: "Failed to load your guidance bookings",
      cancelledToast: "Booking cancelled",
      cancelWindowPassed: (minutes) => `Bookings can only be cancelled up to ${minutes} minutes before the session.`,
      cancelFailed: "Failed to cancel booking",
      emptyTitle: "No guidance sessions booked yet.",
      emptyDesc: "Stuck while applying? Open a notification and look for \"Stuck While Applying?\" to book a free session.",
      maxSessionsNote: (max) => `Up to ${max} free guidance sessions per application.`,
      cancelModalTitle: "Cancel Guidance Session",
      cancelModalConfirm: "Yes, Cancel",
      cancelModalMessage: "Are you sure you want to cancel this guidance session? This slot will become available for other users.",
      cancelModalNote: (max) => `Note: Cancelling will count as 1 of your ${max} free sessions for this application.`,
    },
    feedbackModal: {
      title: "How Was Your Experience?",
      application: "Application:",
      rating: "Rating",
      starLabel: (n) => `${n} star`,
      problemSolvedLabel: "Was your problem solved?",
      topicsLabel: "What did you need help with?",
      messageLabel: "Tell us more (optional)",
      consentLabel: "Would you like to allow Apply India to display your feedback publicly?",
      cancel: "Cancel",
      submitting: "Submitting...",
      submitFeedback: "Submit Feedback",
      thankYou: "Thank you for your feedback!",
      alreadySubmitted: "You've already submitted feedback for this session.",
      submitFailed: "Failed to submit feedback",
    },
    testimonials: {
      title: "What Users Say",
      subtitle: "Genuine feedback from users who booked a free guidance session while applying.",
      empty: "No testimonials published yet — check back soon!",
    },
    listView: {
      loading: "Loading...",
      noNotifications: "No notifications available",
      seeMore: "See More",
      seeLess: "See Less",
      statusClosed: "Closed",
      statusClosingSoon: "Closing Soon",
      statusOpen: "Open",
      addToWishlist: "Add to Wishlist",
      removeFromWishlist: "Remove from Wishlist",
      applicationsClosedTooltip: "Applications closed",
      loginToWishlist: "🔒 Please login to add to wishlist",
      removedFromWishlist: "Removed from wishlist",
      applicationsClosedToast: "Applications for this notification have closed.",
      wishlistUpdateFailed: "Failed to update wishlist.",
      wishlistAddedTitle: "Added to Wishlist!",
      wishlistAddedDesc: "You can check your wishlisted notifications anytime from your Dashboard.",
      goToMyDashboard: "Go to My Dashboard",
      close: "Close",
      categoryNames: {
        all: "Home",
        job: "Job",
        "admit-card": "Admit Card",
        result: "Result",
        "entrance-exam": "Entrance Exam",
        "answer-key": "Answer Key",
        syllabus: "Syllabus",
        admission: "Admission",
        scholarship: "Scholarship",
        "sarkari-yojana": "Sarkari Yojana",
        documents: "Documents",
      },
    },
    browse: {
      allNotifications: "All Notifications",
      eligibleNotifications: "✓ Eligible Notifications",
      showingResultsFor: (query) => `Showing results for "${query}"`,
      completeProfileTitle: "Complete Your Profile",
      completeProfileDesc: "We need a bit more information to calculate your eligibility:",
      completeProfileCta: "Complete Profile",
      noEligibleFound: "No eligible notifications found based on your current profile.",
      noNotificationsAvailable: "No notifications available.",
      noMoreNotifications: "No more notifications.",
    },
    openBrowser: {
      acceptingApplications: (n) => `${n} notification${n === 1 ? "" : "s"} currently accepting applications.`,
      searchByTitle: "Search by title...",
      allCategories: "All Categories",
      allStatesShort: "All",
      searchState: "Search state...",
      closingIn2Days: "⏰ Closing in 2 Days",
      noMatch: "No open notifications match these filters.",
      noMoreNotifications: "No more notifications.",
      vacancies: "Vacancies",
      fee: "Fee",
      free: "Free",
      lastDateToApply: "Last Date to Apply",
      viewDetails: "View Details →",
    },
    detail: {
      notReleased: "Not Released",
      notSpecified: "Not Specified",
      notAvailable: "Not Available",
      minAge: (n) => `Minimum ${n} Years`,
      maxAge: (n) => `Maximum ${n} Years`,
      ageRange: (min, max) => `${min} – ${max} Years`,
      applicationsClosed: "Applications Closed",
      lastDayToApply: "Last Day to Apply",
      daysLeft: (n) => `${n} Day${n === 1 ? "" : "s"} Left`,
      wishlisted: "Wishlisted",
      addToWishlist: "Add to Wishlist",
      checkEligibility: "Check Eligibility",
      loginToTrack: "🔒 Please login to track your progress!",
      loginToWishlist: "🔒 Please login to add to wishlist!",
      loginToCheckEligibility: "🔒 Please login to check your eligibility!",
      applicationsClosedToast: "Applications for this notification have closed.",
      completePreviousStep: "Complete the previous step first!",
      trackActivityFailed: "Failed to track activity",
      removedFromWishlist: "Removed from wishlist",
      addedToWishlist: "Added to wishlist!",
      wishlistUpdateFailed: "Failed to update wishlist",
      eligibilityCheckFailed: "Failed to check eligibility",
      retryTriggered: "Retry triggered",
      retryFailed: "Retry failed",
      step1Label: "Mark as Applied",
      step1CongratsTitle: "🎉 Application Submitted!",
      step1CongratsMessage: "You've taken the first step towards your dream job! Stay focused and keep going!",
      step2Label: "Admit Card Downloaded",
      step2CongratsTitle: "🎉 Admit Card Ready!",
      step2CongratsMessage: "Great progress! Your admit card is secured. Prepare well for the exam!",
      step3Label: "Result Downloaded",
      step3CongratsTitle: "🎉 Result Checked!",
      step3CongratsMessage: "Awesome! You've checked your result. Keep pushing towards the finish line!",
      step4Label: "Selected / Joined",
      step4CongratsTitle: "🏆 You Made It!",
      step4CongratsMessage: "Incredible achievement! You've been selected! This is the start of something amazing!",
      statWishlisted: "Wishlisted",
      statApplied: "Applied",
      statAdmitCard: "Admit Card",
      statResult: "Result Checked",
      statSelected: "Selected",
      quickOverview: "Quick Overview",
      basicDetails: "Basic Details",
      importantDates: "Important Dates",
      applicationFees: "Application Fees",
      eligibilityTitle: "Eligibility",
      fullNotificationDetails: "Full Notification Details",
      importantLinks: "Important Links",
      applicantActivity: "Applicant Activity",
      category: "Category",
      department: "Department",
      stateRegion: "State / Region",
      totalVacancies: "Total Vacancies",
      startDate: "Start Date",
      lastDateToApplyLabel: "Last Date To Apply",
      examDate: "Exam Date",
      admitCardDate: "Admit Card Date",
      resultDate: "Result Date",
      age: "Age",
      qualification: "Qualification",
      specialization: "Specialization",
      minimumPercentage: "Minimum Percentage",
      noApplicationFee: "No Application Fee",
      feeGen: "Gen",
      feeEws: "EWS",
      feeObc: "OBC",
      feeSc: "SC",
      feeSt: "ST",
      feePh: "PH",
      feeFemale: "Female",
      linkAdmitCard: "Admit Card",
      linkNotificationPdf: "Notification PDF",
      linkOfficialWebsite: "Official Website",
      linkResult: "Result",
      linkAnswerKey: "Answer Key",
      linkYoutube: "YouTube",
      linkOtherLinks: "Other Links",
      applyOnline: "Apply Online",
      trackYourProgress: "Track Your Progress",
      trackSubtitle: "Follow your journey step by step — each milestone unlocks the next!",
      closedNoticeBold: "Applications closed",
      closedNoticeRest: "— the last date to apply for this notification has passed, so it can no longer be marked as Applied.",
      noteLabel: "Note:",
      trackNotePart1: "You can track an application a maximum of",
      threeTimesLabel: "3 times",
      trackNotePart2: ". To remove it, go to your",
      dashboardBtn: "Dashboard",
      trackNotePart3: "",
      trackTooltipClosed: "Applications for this notification have closed",
      loading: "Loading...",
    },
    detailPage: { loading: "Loading...", notFound: "Notification not found" },
    dashboard: {
      title: "📋 My Dashboard",
      subtitle: "Track all your applications, or browse what's currently open",
      myApplications: "📊 My Applications",
      exploreOpen: "🚀 Explore Open Opportunities",
      myGuidanceBookings: "🆘 My Guidance Bookings",
      loading: "Loading...",
      loadFailed: "Failed to load your activities",
      statWishlisted: "Wishlisted",
      statApplied: "Applied",
      statAdmitCard: "Admit Card",
      statResult: "Result",
      statSelected: "Selected",
      all: (n) => `All (${n})`,
      removeTracking: "Remove tracking",
      emptyTitle: "No tracked notifications yet",
      emptyDesc: "Start by applying to a notification and tracking your progress!",
      browseNotifications: "Browse Notifications",
      updated: "Updated",
      entryRemoved: "Entry removed",
      removeFailed: "Failed to remove entry",
      removeModalTitle: "Remove Tracking Entry",
      removeModalConfirm: "Yes, Remove",
      removeModalMessage: "Are you sure you want to remove this tracked application from your dashboard?",
      removeModalNote: "Note: You can only remove and re-mark a notification a maximum of 3 times. Reaching this limit will disable tracking for this notification.",
    },
    profile: {
      myProfile: "My Profile",
      administrator: "Administrator",
      editProfile: "Edit Profile",
      locationNotSpecified: "Location not specified",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      gender: "Gender",
      dob: "Date of Birth",
      category: "Category",
      phoneNumber: "Phone Number",
      notSpecified: "Not specified",
      educationSkills: "Education & Skills",
      highestQualification: "Highest Qualification",
      specialization: "Specialization",
      percentageObtained: "Percentage / CGPA Obtained",
      editYourProfile: "Edit Your Profile",
      firstName: "First Name",
      lastName: "Last Name",
      selectGender: "Select Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      state: "State",
      selectState: "Select State",
      selectCategory: "Select Category",
      phonePlaceholder: "e.g. +919876543210",
      phoneHint: "Include country code. Required to receive WhatsApp notifications.",
      selectQualification: "Select Qualification",
      percentagePlaceholder: "e.g. 72.5",
      percentageHint: "Used to check eligibility for notifications with a minimum percentage requirement.",
      cancel: "Cancel",
      saving: "Saving...",
      saveChanges: "Save Changes",
      noChangesToSave: "No changes to save",
      profileUpdated: "Profile updated successfully!",
      updateFailed: "Failed to update profile",
      loading: "Loading...",
    },
    notifPrefs: {
      title: "Notification Preferences",
      editPreferences: "Edit Preferences",
      emailNotifications: "Email Notifications",
      whatsappNotifications: "WhatsApp Notifications",
      enabled: "Enabled",
      disabled: "Disabled",
      subscribedTopics: "Subscribed Topics",
      allTopics: "All topics (no filter)",
      topicsHint: "Leave all unchecked to receive notifications on every topic.",
      cancel: "Cancel",
      saving: "Saving...",
      saveChanges: "Save Changes",
      noChangesToSave: "No changes to save",
      updated: "Notification preferences updated successfully!",
      updateFailed: "Failed to update notification preferences",
      loading: "Loading...",
    },
    contactFeedback: {
      title: "Send Feedback",
      subtitle: "We value your feedback. Share your thoughts or suggestions with us to help improve Apply India.",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      message: "Message",
      messagePlaceholder: "Write your feedback here...",
      trustLine: "We read every message",
      sending: "Sending...",
      submit: "Submit Feedback",
      thankYou: "Thank you! Your feedback has been sent.",
      submitFailed: "Failed to submit feedback",
    },
    auth: {
      logIn: "Log in",
      createAccount: "Create Account",
      newUser: "New user?",
      registerNow: "Register Now",
      alreadyHaveAccount: "Already have an account?",
      continueWithGoogle: "Continue with Google",
      or: "or",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      gender: "Gender",
      selectGender: "Select gender",
      male: "Male",
      female: "Female",
      other: "Other",
      preferNotToSay: "Prefer not to say",
      forgotPassword: "Forgot Password?",
      signingIn: "Signing In...",
      signingUp: "Signing Up...",
      signIn: "Sign In",
      loginFailed: "Login failed",
      registrationFailed: "Registration failed",
    },
    authFlow: {
      forgotPasswordTitle: "Forgot Password",
      forgotPasswordDesc: "Enter your email address and we'll send you a code to reset your password.",
      emailAddress: "Email Address",
      sending: "Sending...",
      sendResetCode: "Send Reset Code",
      resetCodeFailed: "Failed to send reset code",
      resetPasswordTitle: "Reset Password",
      resetPasswordDesc: (email) => `Enter the code sent to ${email} and your new password.`,
      verificationCode: "Verification Code",
      enterCode: "Enter code",
      newPassword: "New Password",
      enterNewPassword: "Enter new password",
      confirmNewPassword: "Confirm New Password",
      confirmNewPasswordPlaceholder: "Confirm new password",
      passwordsDontMatch: "Passwords do not match",
      resetting: "Resetting...",
      resetPasswordBtn: "Reset Password",
      resetPasswordFailed: "Failed to reset password",
      verifyAccountTitle: "Verify your account",
      verifyAccountDesc: (email) => `We have sent a verification code to ${email}. Enter it below to activate your account.`,
      verifying: "Verifying...",
      verify: "Verify",
      resendCode: "Resend code",
      accountVerified: "Account verified. You can now log in.",
      verificationFailed: "Verification failed",
      codeResent: "Verification code resent to your email.",
      resendFailed: "Failed to resend code",
    },
    support: {
      limitReached: "Limit Reached",
      limitReachedDesc: "You have reached the maximum limit of 3 attempts for this notification.",
      contactPrompt: "If you want to track or mark this notification again, please mail us at:",
      close: "Close",
    },
    eligibility: {
      checking: "Checking...",
      checkingEllipsis: "Checking your eligibility…",
      completeProfileTitle: "Complete Your Profile",
      completeProfileDesc: "We need a bit more information to check your eligibility for this notification:",
      completeProfileCta: "Complete Profile",
      eligibleTitle: "You are eligible to apply.",
      eligibleDesc: "Based on your profile, you meet all the eligibility criteria for this notification.",
      notEligibleTitle: "You are not eligible to apply.",
      disclaimer: "This result is informational only and does not guarantee selection or acceptance of your application.",
    },
    congrats: {
      defaultTitle: "🎉 Congratulations!",
      defaultMessage: "You've taken the first step towards your dream!",
      continueLabel: "Continue",
    },
    legal: {
      alsoSee: "Also see:",
      aboutTitle: "About Apply India",
      aboutDesc: "Learn about Apply India Online, a platform for government jobs, sarkari naukri updates, exam notifications, results, admissions, and scholarships across India.",
      aboutP1: "is a platform dedicated to publishing verified government job notifications, exam updates, admit cards, results, admissions, and educational opportunities across India.",
      aboutP2: "Our goal is to simplify access to authentic information and help users stay informed without visiting multiple websites or missing important official deadlines.",
      aboutP3: "We do not charge users for accessing information and always encourage verification from official sources before applying for any job, exam, scholarship, or admission update.",
      disclaimerTitle: "Disclaimer",
      disclaimerDesc: "Important notices about the information published on Apply India.",
      disclaimerIntro: "is an informational website only.",
      noGovAffiliationTitle: "No Government Affiliation",
      noGovAffiliationDesc: "We are not affiliated with any government organization. Users must verify details from official government portals.",
      noLegalResponsibilityTitle: "No Legal Responsibility",
      noLegalResponsibilityDesc: "We are not responsible for any losses arising from the use of information on this website.",
      privacyTitle: "Privacy Policy",
      privacyDesc: "How we collect, use, and protect your information on Apply India.",
      privacyIntro: "we respect your privacy and are committed to protecting your personal information.",
      infoWeCollect: "Information We Collect",
      infoWeCollectItem1: "Basic usage data (pages visited, device type)",
      infoWeCollectItem2: "Cookies for analytics and ads",
      howWeUseInfo: "How We Use Information",
      howWeUseInfoItem1: "Improve website experience",
      howWeUseInfoItem2: "Display relevant advertisements",
      howWeUseInfoItem3: "Analyze traffic and performance",
      cookiesAdsense: "Cookies & Google AdSense",
      cookiesAdsenseDesc: "We use Google AdSense, which uses cookies (including DoubleClick cookie) to serve ads based on your visits to this and other websites.",
      optOutPrompt: "Users may opt out of personalized advertising by visiting:",
      thirdPartyLinks: "Third-Party Links",
      thirdPartyLinksDesc: "Our website may contain links to external websites. We are not responsible for their privacy practices.",
      contactUs: "Contact Us",
      contactUsDesc: "If you have any questions, contact us via the feedback option available on our website.",
      termsTitle: "Terms & Conditions",
      termsDesc: "The terms that govern your use of Apply India.",
      termsIntro: "you agree to be bound by these terms.",
      contentAccuracy: "Content Accuracy",
      contentAccuracyDesc: "We strive to provide accurate information but do not guarantee completeness or correctness.",
      userResponsibility: "User Responsibility",
      userResponsibilityItem1: "Verify details from official sources",
      userResponsibilityItem2: "Do not misuse the website",
      intellectualProperty: "Intellectual Property",
      intellectualPropertyPrefix: "All content is the property of",
      intellectualPropertySuffix: "unless stated otherwise.",
      changes: "Changes",
      changesDesc: "We may update these terms at any time without prior notice.",
    },
  },
  hi: {
    guidance: {
      cardTitle: "आवेदन में अटक गए हैं?",
      intro:
        "बुकिंग करने से पहले ये 3 आसान चरण अपनाएं — वीडियो देखने के बाद ज़्यादातर आवेदक खुद ही आवेदन पूरा कर लेते हैं।",
      step1Title: "गाइडेंस वीडियो देखें",
      step1Desc: "आवेदन फॉर्म को विस्तार से समझें और होने वाली सामान्य गलतियों से बचें।",
      watchVideo: "देखें: आवेदन कैसे करें",
      videoUnavailable: "इस सूचना के लिए वीडियो अभी उपलब्ध नहीं है।",
      step2Title: "पहले खुद आवेदन करने की कोशिश करें",
      step2Desc: "आधिकारिक आवेदन पोर्टल पर जाएं और अभी देखी गई जानकारी की मदद से फॉर्म भरें।",
      step3Title: "फिर भी समस्या हो? मुफ़्त सत्र बुक करें",
      step3Desc:
        "15 मिनट का मुफ़्त 1:1 ऑनलाइन गाइडेंस सत्र पाएं। इस आवेदन के लिए आप 3 सत्र तक मुफ़्त बुक कर सकते हैं।",
      sessionsUsed: (used, max) => `${max} में से ${used} मुफ़्त सत्र उपयोग हो चुके हैं`,
      upcomingSession: "इस आवेदन के लिए आपका एक सत्र पहले से बुक है।",
      manageBooking: "मेरी बुकिंग प्रबंधित करें",
      usedUp: "आपने इस आवेदन के लिए सभी 3 मुफ़्त सत्र उपयोग कर लिए हैं।",
      bookSlot: "मुफ़्त गाइडेंस स्लॉट बुक करें",
      readTestimonials: "दूसरों की राय पढ़ें",
    },
    footer: {
      about:
        "पूरे भारत में सरकारी नौकरी, प्रवेश परीक्षा, दाखिला (एडमिशन) और छात्रवृत्ति (स्कॉलरशिप) की सत्यापित सूचनाएं प्रदान करता है। हम आधिकारिक स्रोतों से समय पर, प्रामाणिक जानकारी सुनिश्चित करते हैं ताकि आप हमेशा अपडेट रहें।",
      legalTitle: "कानूनी जानकारी",
      privacyPolicy: "गोपनीयता नीति",
      termsConditions: "नियम एवं शर्तें",
      disclaimer: "अस्वीकरण",
      aboutUs: "हमारे बारे में",
      connectTitle: "हमसे जुड़ें",
      successStories: "सफलता की कहानियां",
      sendFeedback: "फीडबैक भेजें",
      rightsReserved: "सर्वाधिकार सुरक्षित।",
      backToTop: "ऊपर जाएं",
    },
    nav: {
      login: "लॉग इन करें",
      signup: "साइन अप करें",
      myDashboard: "मेरा डैशबोर्ड",
      myGuidanceBookings: "मेरी गाइडेंस बुकिंग",
      profile: "प्रोफ़ाइल",
      notificationPreferences: "सूचना प्राथमिकताएं",
      logout: "लॉग आउट",
    },
    home: {
      searchResults: "खोज परिणाम",
      noMatchingNotifications: "कोई मिलती-जुलती सूचना नहीं मिली।",
      noMoreResults: "और परिणाम नहीं हैं।",
      centralOnly: "केवल केंद्रीय",
      stateAndCentral: (state) => `${state} + केंद्रीय`,
      allStates: "सभी राज्य",
      setStatePrompt: "केंद्र सरकार की सूचनाओं के साथ-साथ अपने राज्य से जुड़ी सूचनाएं देखने के लिए अपना राज्य सेट करें।",
      setYourState: "अपना राज्य सेट करें",
      signInStatePrompt: "अपने अनुसार सूचनाएं देखने के लिए साइन इन करें और अपना राज्य सेट करें।",
      signIn: "साइन इन करें",
    },
    hero: {
      kickerJobs: "नौकरियां",
      kickerAdmissions: "दाखिला",
      kickerScholarships: "छात्रवृत्ति",
      kickerExams: "परीक्षाएं",
      titlePrefix: "सरकारी अवसरों का",
      titleHighlight: "आपका सीधा रास्ता",
      subtitle: "पूरे भारत की हर सत्यापित सरकारी सूचना एक ही जगह — हमेशा मुफ़्त।",
      browseNotifications: "सूचनाएं देखें",
      exploreOpenOpportunities: "खुले अवसर देखें",
      verifiedSources: "सत्यापित स्रोत",
      updatedDaily: "रोज़ अपडेट",
      free: "100% मुफ़्त",
    },
    whyChoose: {
      title: "Apply India क्यों चुनें",
      subtitle: "सरकारी सूचना वेबसाइटों की उलझन से बचने के लिए बनाया गया।",
      reasons: [
        {
          title: "सत्यापित, केवल स्क्रैप नहीं",
          description:
            "हर सूचना लाइव होने से पहले हमारी टीम द्वारा जांची जाती है — स्पैम, डुप्लीकेट और पुरानी पोस्टिंग को हटाकर।",
        },
        {
          title: "कभी डेडलाइन न चूकें",
          description:
            "हर सूचना पर आवेदन की अंतिम तारीख साफ़ दिखती है, साथ में Open, Closing Soon या Closed का स्पष्ट स्टेटस।",
        },
        {
          title: "सब कुछ एक ही जगह",
          description:
            "नौकरियां, एडमिट कार्ड, परिणाम, उत्तर कुंजी और सिलेबस — सब आपस में जुड़े हुए, ताकि आपको कई वेबसाइटों पर न भटकना पड़े।",
        },
        {
          title: "अपने आवेदन ट्रैक करें",
          description:
            "किसी भी सूचना को विशलिस्ट करें और अपने डैशबोर्ड पर Applied से लेकर Result तक उसकी प्रगति देखें।",
        },
      ],
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      items: [
        {
          question: "क्या Apply India इस्तेमाल करना मुफ़्त है?",
          answer:
            "हां। Apply India पर सूचनाएं ब्राउज़ करना, खोजना और ट्रैक करना पूरी तरह मुफ़्त है — कोई पेवॉल या प्रीमियम प्लान नहीं है।",
        },
        {
          question: "क्या सूचनाएं देखने के लिए खाता ज़रूरी है?",
          answer:
            "नहीं। बिना साइन इन किए भी आप हर सूचना खोज और पढ़ सकते हैं। खाता तभी चाहिए जब आप किसी सूचना को विशलिस्ट करना या अपने आवेदन की प्रगति ट्रैक करना चाहें।",
        },
        {
          question: "सूचनाएं प्रकाशित होने से पहले कैसे सत्यापित की जाती हैं?",
          answer:
            "हर सूचना लाइव होने से पहले हमारी टीम द्वारा जांची जाती है। हम स्रोत, तारीखें और विवरण जांचकर स्पैम, डुप्लीकेट और पुरानी पोस्टिंग हटाते हैं।",
        },
        {
          question: "मैंने जिस आवेदन के लिए आवेदन किया है उसे कैसे ट्रैक करूं?",
          answer:
            "किसी भी सूचना की लिस्टिंग या डिटेल पेज से उसे विशलिस्ट करें, फिर My Dashboard खोलकर उसकी प्रगति को Applied, Admit Card, Result और Selected के ज़रिए आगे बढ़ाएं।",
        },
        {
          question: "क्या मैं अपने राज्य के अनुसार सूचनाएं फ़िल्टर कर सकता हूं?",
          answer:
            "हां। होमपेज पर राज्य के बटन या खोज में राज्य फ़िल्टर का उपयोग करके अपने राज्य से जुड़ी सूचनाएं केंद्र सरकार की सूचनाओं के साथ देखें।",
        },
        {
          question: "मुझे किसी सूचना में गलत जानकारी मिली — मैं क्या करूं?",
          answer: "फ़ुटर में दिए गए Send Feedback लिंक से इसकी जानकारी दें, हमारी टीम इसकी समीक्षा कर सुधार करेगी।",
        },
      ],
    },
    jobBanner: {
      latestUpdates: "नवीनतम अपडेट",
      noActive: "फ़िलहाल कोई सक्रिय आवेदन सूचना उपलब्ध नहीं है। नए सरकारी अवसर जल्द ही यहां दिखेंगे।",
      lastDate: "अंतिम तिथि",
    },
    search: {
      placeholder: "सूचनाएं खोजें...",
      categoriesHeader: "श्रेणियां",
      statesHeader: "राज्य / क्षेत्र",
      home: "होम",
      search: "खोजें",
      clearSearch: "खोज साफ़ करें",
    },
    guidanceModal: {
      title: "मुफ़्त आवेदन गाइडेंस",
      application: "आवेदन:",
      failedToLoadSlots: "उपलब्ध स्लॉट लोड नहीं हो सके",
      loadingSlots: "उपलब्ध स्लॉट लोड हो रहे हैं…",
      noSlotsTitle: "अभी कोई स्लॉट उपलब्ध नहीं है",
      noSlotsDesc: "इस आवेदन के लिए सभी गाइडेंस स्लॉट फ़िलहाल बुक हैं। कृपया बाद में देखें — नए स्लॉट नियमित रूप से खुलते हैं।",
      selectDate: "एक तारीख चुनें",
      selectDatePlaceholder: "-- तारीख चुनें --",
      slotCount: (n) => `${n} स्लॉट`,
      selectTime: "एक समय स्लॉट चुनें",
      selectTimePlaceholder: "-- समय चुनें --",
      confirmDate: "तारीख",
      confirmTimeLabel: "समय · 15 मिनट",
      confirmMode: "माध्यम",
      googleMeet: "Google Meet",
      free: "100% मुफ़्त",
      issueNoteLabel: "आपको किस चीज़ में मदद चाहिए? (वैकल्पिक)",
      issueNotePlaceholder: "जैसे: मैं अपनी फ़ोटो अपलोड नहीं कर पा रहा/रही हूं।",
      close: "बंद करें",
      continueBtn: "आगे बढ़ें",
      back: "पीछे",
      booking: "बुक हो रहा है...",
      confirmBooking: "बुकिंग पक्की करें",
      done: "हो गया",
      bookingLimitReached: "आपने इस आवेदन के लिए सभी 3 मुफ़्त गाइडेंस स्लॉट उपयोग कर लिए हैं।",
      activeBookingExists: "इस आवेदन के लिए आपका पहले से एक आगामी सत्र बुक है।",
      slotAlreadyBooked: "यह स्लॉट अभी किसी और ने बुक कर लिया है। कृपया दूसरा चुनें।",
      bookingFailed: "यह स्लॉट बुक नहीं हो सका। कृपया दोबारा कोशिश करें।",
      successTitle: "गाइडेंस स्लॉट बुक हो गया!",
      successDesc: "हमने आपको मीटिंग लिंक के साथ एक पुष्टिकरण ईमेल भेज दिया है। समय आने पर आप अपने डैशबोर्ड में \"मेरी गाइडेंस बुकिंग\" से इसमें शामिल हो सकते हैं और इसे कभी भी देख सकते हैं।",
    },
    myBookings: {
      statusUpcoming: "आगामी",
      statusCompleted: "पूर्ण",
      statusNoShow: "अनुपस्थित",
      statusCancelled: "रद्द",
      statusCancelledByAdmin: "Apply India द्वारा रद्द",
      today: "आज",
      joinMeeting: "मीटिंग में शामिल हों",
      joinAvailableHint: (minutes) => `आपके सत्र शुरू होने से ${minutes} मिनट पहले उपलब्ध होगा`,
      cancel: "रद्द करें",
      giveFeedback: "फीडबैक दें",
      loadFailed: "आपकी गाइडेंस बुकिंग लोड नहीं हो सकीं",
      cancelledToast: "बुकिंग रद्द कर दी गई",
      cancelWindowPassed: (minutes) => `बुकिंग सत्र शुरू होने से केवल ${minutes} मिनट पहले तक ही रद्द की जा सकती है।`,
      cancelFailed: "बुकिंग रद्द नहीं हो सकी",
      emptyTitle: "अभी तक कोई गाइडेंस सत्र बुक नहीं किया गया है।",
      emptyDesc: "आवेदन करने में परेशानी हो रही है? किसी सूचना को खोलें और मुफ़्त सत्र बुक करने के लिए \"आवेदन में अटक गए हैं?\" देखें।",
      maxSessionsNote: (max) => `प्रति आवेदन ${max} मुफ़्त गाइडेंस सत्र तक।`,
      cancelModalTitle: "गाइडेंस सत्र रद्द करें",
      cancelModalConfirm: "हां, रद्द करें",
      cancelModalMessage: "क्या आप वाकई यह गाइडेंस सत्र रद्द करना चाहते हैं? यह स्लॉट अन्य उपयोगकर्ताओं के लिए उपलब्ध हो जाएगा।",
      cancelModalNote: (max) => `ध्यान दें: रद्द करने पर यह इस आवेदन के लिए आपके ${max} मुफ़्त सत्रों में से 1 माना जाएगा।`,
    },
    feedbackModal: {
      title: "आपका अनुभव कैसा रहा?",
      application: "आवेदन:",
      rating: "रेटिंग",
      starLabel: (n) => `${n} स्टार`,
      problemSolvedLabel: "क्या आपकी समस्या हल हुई?",
      topicsLabel: "आपको किस चीज़ में मदद चाहिए थी?",
      messageLabel: "हमें और बताएं (वैकल्पिक)",
      consentLabel: "क्या आप चाहते हैं कि Apply India आपकी फीडबैक सार्वजनिक रूप से दिखाए?",
      cancel: "रद्द करें",
      submitting: "सबमिट हो रहा है...",
      submitFeedback: "फीडबैक सबमिट करें",
      thankYou: "आपकी फीडबैक के लिए धन्यवाद!",
      alreadySubmitted: "आप इस सत्र के लिए पहले ही फीडबैक दे चुके हैं।",
      submitFailed: "फीडबैक सबमिट नहीं हो सका",
    },
    testimonials: {
      title: "उपयोगकर्ता क्या कहते हैं",
      subtitle: "उन उपयोगकर्ताओं की असली फीडबैक जिन्होंने आवेदन करते समय मुफ़्त गाइडेंस सत्र बुक किया।",
      empty: "अभी तक कोई प्रशंसापत्र प्रकाशित नहीं हुआ — जल्द ही फिर देखें!",
    },
    listView: {
      loading: "लोड हो रहा है...",
      noNotifications: "कोई सूचना उपलब्ध नहीं है",
      seeMore: "और देखें",
      seeLess: "कम देखें",
      statusClosed: "बंद",
      statusClosingSoon: "जल्द बंद हो रहा है",
      statusOpen: "खुला है",
      addToWishlist: "विशलिस्ट में जोड़ें",
      removeFromWishlist: "विशलिस्ट से हटाएं",
      applicationsClosedTooltip: "आवेदन बंद हो चुके हैं",
      loginToWishlist: "🔒 विशलिस्ट में जोड़ने के लिए कृपया लॉग इन करें",
      removedFromWishlist: "विशलिस्ट से हटा दिया गया",
      applicationsClosedToast: "इस सूचना के लिए आवेदन बंद हो चुके हैं।",
      wishlistUpdateFailed: "विशलिस्ट अपडेट नहीं हो सकी।",
      wishlistAddedTitle: "विशलिस्ट में जोड़ा गया!",
      wishlistAddedDesc: "आप अपने डैशबोर्ड से कभी भी अपनी विशलिस्ट की गई सूचनाएं देख सकते हैं।",
      goToMyDashboard: "मेरे डैशबोर्ड पर जाएं",
      close: "बंद करें",
      categoryNames: {
        all: "होम",
        job: "नौकरी",
        "admit-card": "एडमिट कार्ड",
        result: "परिणाम",
        "entrance-exam": "प्रवेश परीक्षा",
        "answer-key": "उत्तर कुंजी",
        syllabus: "सिलेबस",
        admission: "दाखिला",
        scholarship: "छात्रवृत्ति",
        "sarkari-yojana": "सरकारी योजना",
        documents: "दस्तावेज़",
      },
    },
    browse: {
      allNotifications: "सभी सूचनाएं",
      eligibleNotifications: "✓ योग्य सूचनाएं",
      showingResultsFor: (query) => `"${query}" के लिए परिणाम दिखा रहे हैं`,
      completeProfileTitle: "अपनी प्रोफ़ाइल पूरी करें",
      completeProfileDesc: "आपकी योग्यता जानने के लिए हमें थोड़ी और जानकारी चाहिए:",
      completeProfileCta: "प्रोफ़ाइल पूरी करें",
      noEligibleFound: "आपकी वर्तमान प्रोफ़ाइल के आधार पर कोई योग्य सूचना नहीं मिली।",
      noNotificationsAvailable: "कोई सूचना उपलब्ध नहीं है।",
      noMoreNotifications: "और सूचनाएं नहीं हैं।",
    },
    openBrowser: {
      acceptingApplications: (n) => `वर्तमान में ${n} सूचना${n === 1 ? "" : "एं"} आवेदन स्वीकार कर रही ${n === 1 ? "है" : "हैं"}।`,
      searchByTitle: "शीर्षक से खोजें...",
      allCategories: "सभी श्रेणियां",
      allStatesShort: "सभी",
      searchState: "राज्य खोजें...",
      closingIn2Days: "⏰ 2 दिनों में बंद हो रहा है",
      noMatch: "इन फ़िल्टरों से कोई खुली सूचना नहीं मिली।",
      noMoreNotifications: "और सूचनाएं नहीं हैं।",
      vacancies: "रिक्तियां",
      fee: "शुल्क",
      free: "मुफ़्त",
      lastDateToApply: "आवेदन की अंतिम तिथि",
      viewDetails: "विवरण देखें →",
    },
    detail: {
      notReleased: "अभी जारी नहीं हुआ",
      notSpecified: "निर्दिष्ट नहीं",
      notAvailable: "उपलब्ध नहीं",
      minAge: (n) => `न्यूनतम ${n} वर्ष`,
      maxAge: (n) => `अधिकतम ${n} वर्ष`,
      ageRange: (min, max) => `${min} – ${max} वर्ष`,
      applicationsClosed: "आवेदन बंद हो चुके हैं",
      lastDayToApply: "आवेदन का अंतिम दिन",
      daysLeft: (n) => `${n} दिन शेष`,
      wishlisted: "विशलिस्ट में",
      addToWishlist: "विशलिस्ट में जोड़ें",
      checkEligibility: "योग्यता जांचें",
      loginToTrack: "🔒 अपनी प्रगति ट्रैक करने के लिए कृपया लॉग इन करें!",
      loginToWishlist: "🔒 विशलिस्ट में जोड़ने के लिए कृपया लॉग इन करें!",
      loginToCheckEligibility: "🔒 अपनी योग्यता जांचने के लिए कृपया लॉग इन करें!",
      applicationsClosedToast: "इस सूचना के लिए आवेदन बंद हो चुके हैं।",
      completePreviousStep: "पहले पिछला चरण पूरा करें!",
      trackActivityFailed: "गतिविधि ट्रैक नहीं हो सकी",
      removedFromWishlist: "विशलिस्ट से हटा दिया गया",
      addedToWishlist: "विशलिस्ट में जोड़ दिया गया!",
      wishlistUpdateFailed: "विशलिस्ट अपडेट नहीं हो सकी",
      eligibilityCheckFailed: "योग्यता जांच नहीं हो सकी",
      retryTriggered: "पुनः प्रयास शुरू किया गया",
      retryFailed: "पुनः प्रयास असफल रहा",
      step1Label: "आवेदित के रूप में चिह्नित करें",
      step1CongratsTitle: "🎉 आवेदन जमा हो गया!",
      step1CongratsMessage: "आपने अपने सपनों की नौकरी की ओर पहला कदम बढ़ा दिया है! ध्यान केंद्रित रखें और आगे बढ़ते रहें!",
      step2Label: "एडमिट कार्ड डाउनलोड हुआ",
      step2CongratsTitle: "🎉 एडमिट कार्ड तैयार है!",
      step2CongratsMessage: "बहुत बढ़िया प्रगति! आपका एडमिट कार्ड सुरक्षित है। परीक्षा की अच्छी तैयारी करें!",
      step3Label: "परिणाम डाउनलोड हुआ",
      step3CongratsTitle: "🎉 परिणाम देख लिया!",
      step3CongratsMessage: "शानदार! आपने अपना परिणाम देख लिया है। लक्ष्य की ओर बढ़ते रहें!",
      step4Label: "चयनित / शामिल हुए",
      step4CongratsTitle: "🏆 आपने कर दिखाया!",
      step4CongratsMessage: "अविश्वसनीय उपलब्धि! आपका चयन हो गया है! यह कुछ शानदार की शुरुआत है!",
      statWishlisted: "विशलिस्ट में",
      statApplied: "आवेदित",
      statAdmitCard: "एडमिट कार्ड",
      statResult: "परिणाम देखा गया",
      statSelected: "चयनित",
      quickOverview: "त्वरित अवलोकन",
      basicDetails: "बुनियादी जानकारी",
      importantDates: "महत्वपूर्ण तिथियां",
      applicationFees: "आवेदन शुल्क",
      eligibilityTitle: "योग्यता",
      fullNotificationDetails: "पूरी सूचना का विवरण",
      importantLinks: "महत्वपूर्ण लिंक",
      applicantActivity: "आवेदक गतिविधि",
      category: "श्रेणी",
      department: "विभाग",
      stateRegion: "राज्य / क्षेत्र",
      totalVacancies: "कुल रिक्तियां",
      startDate: "प्रारंभ तिथि",
      lastDateToApplyLabel: "आवेदन की अंतिम तिथि",
      examDate: "परीक्षा तिथि",
      admitCardDate: "एडमिट कार्ड तिथि",
      resultDate: "परिणाम तिथि",
      age: "आयु",
      qualification: "शैक्षणिक योग्यता",
      specialization: "विशेषज्ञता",
      minimumPercentage: "न्यूनतम प्रतिशत",
      noApplicationFee: "कोई आवेदन शुल्क नहीं",
      feeGen: "सामान्य",
      feeEws: "EWS",
      feeObc: "OBC",
      feeSc: "SC",
      feeSt: "ST",
      feePh: "PH",
      feeFemale: "महिला",
      linkAdmitCard: "एडमिट कार्ड",
      linkNotificationPdf: "सूचना PDF",
      linkOfficialWebsite: "आधिकारिक वेबसाइट",
      linkResult: "परिणाम",
      linkAnswerKey: "उत्तर कुंजी",
      linkYoutube: "YouTube",
      linkOtherLinks: "अन्य लिंक",
      applyOnline: "ऑनलाइन आवेदन करें",
      trackYourProgress: "अपनी प्रगति ट्रैक करें",
      trackSubtitle: "अपनी यात्रा को चरण दर चरण फॉलो करें — हर पड़ाव अगला अनलॉक करता है!",
      closedNoticeBold: "आवेदन बंद हो चुके हैं",
      closedNoticeRest: "— इस सूचना के लिए आवेदन की अंतिम तिथि निकल चुकी है, इसलिए अब इसे आवेदित के रूप में चिह्नित नहीं किया जा सकता।",
      noteLabel: "ध्यान दें:",
      trackNotePart1: "आप किसी आवेदन को अधिकतम",
      threeTimesLabel: "3 बार",
      trackNotePart2: "ट्रैक कर सकते हैं। इसे हटाने के लिए अपने",
      dashboardBtn: "डैशबोर्ड",
      trackNotePart3: "पर जाएं।",
      trackTooltipClosed: "इस सूचना के लिए आवेदन बंद हो चुके हैं",
      loading: "लोड हो रहा है...",
    },
    detailPage: { loading: "लोड हो रहा है...", notFound: "सूचना नहीं मिली" },
    dashboard: {
      title: "📋 मेरा डैशबोर्ड",
      subtitle: "अपने सभी आवेदन ट्रैक करें, या देखें कि अभी क्या खुला है",
      myApplications: "📊 मेरे आवेदन",
      exploreOpen: "🚀 खुले अवसर देखें",
      myGuidanceBookings: "🆘 मेरी गाइडेंस बुकिंग",
      loading: "लोड हो रहा है...",
      loadFailed: "आपकी गतिविधियां लोड नहीं हो सकीं",
      statWishlisted: "विशलिस्ट में",
      statApplied: "आवेदित",
      statAdmitCard: "एडमिट कार्ड",
      statResult: "परिणाम",
      statSelected: "चयनित",
      all: (n) => `सभी (${n})`,
      removeTracking: "ट्रैकिंग हटाएं",
      emptyTitle: "अभी तक कोई सूचना ट्रैक नहीं की गई",
      emptyDesc: "किसी सूचना पर आवेदन करके अपनी प्रगति ट्रैक करना शुरू करें!",
      browseNotifications: "सूचनाएं देखें",
      updated: "अपडेट किया गया",
      entryRemoved: "प्रविष्टि हटा दी गई",
      removeFailed: "प्रविष्टि हटाई नहीं जा सकी",
      removeModalTitle: "ट्रैकिंग प्रविष्टि हटाएं",
      removeModalConfirm: "हां, हटाएं",
      removeModalMessage: "क्या आप वाकई अपने डैशबोर्ड से यह ट्रैक किया गया आवेदन हटाना चाहते हैं?",
      removeModalNote: "ध्यान दें: आप किसी सूचना को अधिकतम 3 बार ही हटा और दोबारा चिह्नित कर सकते हैं। यह सीमा पूरी होने पर इस सूचना के लिए ट्रैकिंग बंद हो जाएगी।",
    },
    profile: {
      myProfile: "मेरी प्रोफ़ाइल",
      administrator: "एडमिनिस्ट्रेटर",
      editProfile: "प्रोफ़ाइल संपादित करें",
      locationNotSpecified: "स्थान निर्दिष्ट नहीं",
      personalInfo: "व्यक्तिगत जानकारी",
      fullName: "पूरा नाम",
      gender: "लिंग",
      dob: "जन्म तिथि",
      category: "श्रेणी",
      phoneNumber: "फ़ोन नंबर",
      notSpecified: "निर्दिष्ट नहीं",
      educationSkills: "शिक्षा और कौशल",
      highestQualification: "उच्चतम योग्यता",
      specialization: "विशेषज्ञता",
      percentageObtained: "प्राप्त प्रतिशत / CGPA",
      editYourProfile: "अपनी प्रोफ़ाइल संपादित करें",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      selectGender: "लिंग चुनें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      state: "राज्य",
      selectState: "राज्य चुनें",
      selectCategory: "श्रेणी चुनें",
      phonePlaceholder: "उदाहरण: +919876543210",
      phoneHint: "देश कोड शामिल करें। यह WhatsApp सूचनाएं पाने के लिए आवश्यक है।",
      selectQualification: "योग्यता चुनें",
      percentagePlaceholder: "उदाहरण: 72.5",
      percentageHint: "न्यूनतम प्रतिशत की शर्त वाली सूचनाओं के लिए योग्यता जांचने में उपयोग होता है।",
      cancel: "रद्द करें",
      saving: "सेव हो रहा है...",
      saveChanges: "बदलाव सेव करें",
      noChangesToSave: "सेव करने के लिए कोई बदलाव नहीं है",
      profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!",
      updateFailed: "प्रोफ़ाइल अपडेट नहीं हो सकी",
      loading: "लोड हो रहा है...",
    },
    notifPrefs: {
      title: "सूचना प्राथमिकताएं",
      editPreferences: "प्राथमिकताएं संपादित करें",
      emailNotifications: "ईमेल सूचनाएं",
      whatsappNotifications: "WhatsApp सूचनाएं",
      enabled: "चालू",
      disabled: "बंद",
      subscribedTopics: "सब्सक्राइब किए गए विषय",
      allTopics: "सभी विषय (कोई फ़िल्टर नहीं)",
      topicsHint: "हर विषय पर सूचना पाने के लिए सभी को अनचेक छोड़ दें।",
      cancel: "रद्द करें",
      saving: "सेव हो रहा है...",
      saveChanges: "बदलाव सेव करें",
      noChangesToSave: "सेव करने के लिए कोई बदलाव नहीं है",
      updated: "सूचना प्राथमिकताएं सफलतापूर्वक अपडेट हो गईं!",
      updateFailed: "सूचना प्राथमिकताएं अपडेट नहीं हो सकीं",
      loading: "लोड हो रहा है...",
    },
    contactFeedback: {
      title: "फीडबैक भेजें",
      subtitle: "हम आपकी फीडबैक को महत्व देते हैं। Apply India को बेहतर बनाने में मदद के लिए अपने विचार या सुझाव हमारे साथ साझा करें।",
      name: "नाम",
      namePlaceholder: "आपका नाम",
      email: "ईमेल पता",
      emailPlaceholder: "you@example.com",
      message: "संदेश",
      messagePlaceholder: "यहां अपनी फीडबैक लिखें...",
      trustLine: "हम हर संदेश पढ़ते हैं",
      sending: "भेजा जा रहा है...",
      submit: "फीडबैक सबमिट करें",
      thankYou: "धन्यवाद! आपकी फीडबैक भेज दी गई है।",
      submitFailed: "फीडबैक सबमिट नहीं हो सकी",
    },
    auth: {
      logIn: "लॉग इन करें",
      createAccount: "खाता बनाएं",
      newUser: "नए उपयोगकर्ता हैं?",
      registerNow: "अभी रजिस्टर करें",
      alreadyHaveAccount: "पहले से खाता है?",
      continueWithGoogle: "Google से जारी रखें",
      or: "या",
      email: "ईमेल",
      password: "पासवर्ड",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      gender: "लिंग",
      selectGender: "लिंग चुनें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      preferNotToSay: "बताना नहीं चाहते",
      forgotPassword: "पासवर्ड भूल गए?",
      signingIn: "साइन इन हो रहा है...",
      signingUp: "साइन अप हो रहा है...",
      signIn: "साइन इन करें",
      loginFailed: "लॉग इन असफल रहा",
      registrationFailed: "रजिस्ट्रेशन असफल रहा",
    },
    authFlow: {
      forgotPasswordTitle: "पासवर्ड भूल गए",
      forgotPasswordDesc: "अपना ईमेल पता डालें, हम आपको पासवर्ड रीसेट करने के लिए एक कोड भेजेंगे।",
      emailAddress: "ईमेल पता",
      sending: "भेजा जा रहा है...",
      sendResetCode: "रीसेट कोड भेजें",
      resetCodeFailed: "रीसेट कोड नहीं भेजा जा सका",
      resetPasswordTitle: "पासवर्ड रीसेट करें",
      resetPasswordDesc: (email) => `${email} पर भेजा गया कोड और अपना नया पासवर्ड डालें।`,
      verificationCode: "सत्यापन कोड",
      enterCode: "कोड डालें",
      newPassword: "नया पासवर्ड",
      enterNewPassword: "नया पासवर्ड डालें",
      confirmNewPassword: "नए पासवर्ड की पुष्टि करें",
      confirmNewPasswordPlaceholder: "नया पासवर्ड दोबारा डालें",
      passwordsDontMatch: "पासवर्ड मेल नहीं खाते",
      resetting: "रीसेट हो रहा है...",
      resetPasswordBtn: "पासवर्ड रीसेट करें",
      resetPasswordFailed: "पासवर्ड रीसेट नहीं हो सका",
      verifyAccountTitle: "अपना खाता सत्यापित करें",
      verifyAccountDesc: (email) => `हमने ${email} पर एक सत्यापन कोड भेजा है। अपना खाता सक्रिय करने के लिए इसे नीचे दर्ज करें।`,
      verifying: "सत्यापित हो रहा है...",
      verify: "सत्यापित करें",
      resendCode: "कोड दोबारा भेजें",
      accountVerified: "खाता सत्यापित हो गया। अब आप लॉग इन कर सकते हैं।",
      verificationFailed: "सत्यापन असफल रहा",
      codeResent: "सत्यापन कोड आपके ईमेल पर दोबारा भेज दिया गया है।",
      resendFailed: "कोड दोबारा नहीं भेजा जा सका",
    },
    support: {
      limitReached: "सीमा पूरी हो गई",
      limitReachedDesc: "आप इस सूचना के लिए अधिकतम 3 प्रयासों की सीमा तक पहुंच चुके हैं।",
      contactPrompt: "अगर आप इस सूचना को दोबारा ट्रैक या चिह्नित करना चाहते हैं, तो कृपया हमें यहां मेल करें:",
      close: "बंद करें",
    },
    eligibility: {
      checking: "जांच हो रही है...",
      checkingEllipsis: "आपकी योग्यता जांची जा रही है…",
      completeProfileTitle: "अपनी प्रोफ़ाइल पूरी करें",
      completeProfileDesc: "इस सूचना के लिए आपकी योग्यता जांचने के लिए हमें थोड़ी और जानकारी चाहिए:",
      completeProfileCta: "प्रोफ़ाइल पूरी करें",
      eligibleTitle: "आप आवेदन के लिए योग्य हैं।",
      eligibleDesc: "आपकी प्रोफ़ाइल के अनुसार, आप इस सूचना की सभी योग्यता शर्तें पूरी करते हैं।",
      notEligibleTitle: "आप आवेदन के लिए योग्य नहीं हैं।",
      disclaimer: "यह परिणाम केवल जानकारी के लिए है और आपके आवेदन के चयन या स्वीकृति की गारंटी नहीं देता।",
    },
    congrats: {
      defaultTitle: "🎉 बधाई हो!",
      defaultMessage: "आपने अपने सपने की ओर पहला कदम बढ़ा दिया है!",
      continueLabel: "आगे बढ़ें",
    },
    legal: {
      alsoSee: "यह भी देखें:",
      aboutTitle: "Apply India के बारे में",
      aboutDesc: "Apply India Online के बारे में जानें — भारत भर में सरकारी नौकरियों, सरकारी नौकरी अपडेट, परीक्षा सूचनाओं, परिणामों, दाखिला और छात्रवृत्तियों का एक मंच।",
      aboutP1: "पूरे भारत में सत्यापित सरकारी नौकरी सूचनाएं, परीक्षा अपडेट, एडमिट कार्ड, परिणाम, दाखिला और शैक्षणिक अवसर प्रकाशित करने के लिए समर्पित एक मंच है।",
      aboutP2: "हमारा लक्ष्य प्रामाणिक जानकारी को आसान बनाना है ताकि उपयोगकर्ता कई वेबसाइटों पर गए बिना और महत्वपूर्ण आधिकारिक तारीखें चूके बिना अपडेट रह सकें।",
      aboutP3: "हम जानकारी देखने के लिए उपयोगकर्ताओं से कोई शुल्क नहीं लेते और हमेशा किसी भी नौकरी, परीक्षा, छात्रवृत्ति या दाखिला अपडेट के लिए आवेदन करने से पहले आधिकारिक स्रोतों से पुष्टि करने की सलाह देते हैं।",
      disclaimerTitle: "अस्वीकरण",
      disclaimerDesc: "Apply India पर प्रकाशित जानकारी के बारे में महत्वपूर्ण सूचनाएं।",
      disclaimerIntro: "केवल एक सूचनात्मक वेबसाइट है।",
      noGovAffiliationTitle: "कोई सरकारी संबद्धता नहीं",
      noGovAffiliationDesc: "हम किसी भी सरकारी संगठन से संबद्ध नहीं हैं। उपयोगकर्ताओं को आधिकारिक सरकारी पोर्टल से विवरण सत्यापित करना चाहिए।",
      noLegalResponsibilityTitle: "कोई कानूनी ज़िम्मेदारी नहीं",
      noLegalResponsibilityDesc: "इस वेबसाइट पर मौजूद जानकारी के उपयोग से होने वाले किसी भी नुकसान के लिए हम ज़िम्मेदार नहीं हैं।",
      privacyTitle: "गोपनीयता नीति",
      privacyDesc: "Apply India पर हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।",
      privacyIntro: "हम आपकी गोपनीयता का सम्मान करते हैं और आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं।",
      infoWeCollect: "हम कौन सी जानकारी एकत्र करते हैं",
      infoWeCollectItem1: "बुनियादी उपयोग डेटा (देखे गए पेज, डिवाइस प्रकार)",
      infoWeCollectItem2: "एनालिटिक्स और विज्ञापनों के लिए कुकीज़",
      howWeUseInfo: "हम जानकारी का उपयोग कैसे करते हैं",
      howWeUseInfoItem1: "वेबसाइट अनुभव को बेहतर बनाना",
      howWeUseInfoItem2: "प्रासंगिक विज्ञापन दिखाना",
      howWeUseInfoItem3: "ट्रैफ़िक और प्रदर्शन का विश्लेषण करना",
      cookiesAdsense: "कुकीज़ और Google AdSense",
      cookiesAdsenseDesc: "हम Google AdSense का उपयोग करते हैं, जो इस और अन्य वेबसाइटों पर आपकी विज़िट के आधार पर विज्ञापन दिखाने के लिए कुकीज़ (DoubleClick कुकी सहित) का उपयोग करता है।",
      optOutPrompt: "उपयोगकर्ता यहां जाकर व्यक्तिगत विज्ञापनों से ऑप्ट आउट कर सकते हैं:",
      thirdPartyLinks: "तीसरे पक्ष के लिंक",
      thirdPartyLinksDesc: "हमारी वेबसाइट में बाहरी वेबसाइटों के लिंक हो सकते हैं। हम उनकी गोपनीयता प्रथाओं के लिए ज़िम्मेदार नहीं हैं।",
      contactUs: "हमसे संपर्क करें",
      contactUsDesc: "यदि आपके कोई प्रश्न हैं, तो हमारी वेबसाइट पर उपलब्ध फीडबैक विकल्प के माध्यम से हमसे संपर्क करें।",
      termsTitle: "नियम एवं शर्तें",
      termsDesc: "वे शर्तें जो Apply India के उपयोग को नियंत्रित करती हैं।",
      termsIntro: "आप इन शर्तों से बाध्य होने के लिए सहमत होते हैं।",
      contentAccuracy: "सामग्री की सटीकता",
      contentAccuracyDesc: "हम सटीक जानकारी प्रदान करने का प्रयास करते हैं, लेकिन पूर्णता या सटीकता की गारंटी नहीं देते।",
      userResponsibility: "उपयोगकर्ता की ज़िम्मेदारी",
      userResponsibilityItem1: "आधिकारिक स्रोतों से विवरण सत्यापित करें",
      userResponsibilityItem2: "वेबसाइट का दुरुपयोग न करें",
      intellectualProperty: "बौद्धिक संपदा",
      intellectualPropertyPrefix: "जब तक अन्यथा न बताया जाए, सभी सामग्री",
      intellectualPropertySuffix: "की संपत्ति है।",
      changes: "बदलाव",
      changesDesc: "हम बिना किसी पूर्व सूचना के इन शर्तों को कभी भी अपडेट कर सकते हैं।",
    },
  },
};
