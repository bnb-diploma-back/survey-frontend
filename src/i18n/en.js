/**
 * English (default) strings. Same structure as ru.js.
 */
import { questions } from '../data/questions.js'

export const t = {
  landing: {
    title: 'Adolescents, Young Adults, and the Algorithm',
    subtitle: 'Understanding How Personalization Shapes Digital Life',
    body1:
      "This survey explores how algorithm-driven recommendation systems influence teenagers' and young adults' satisfaction, focus, emotions, and online social interactions.",
    body2: 'After completing the survey, you will receive personalized results across the following dimensions:',
    note: 'Your responses are anonymous and help research make technology more mindful and human-centered.',
    takeTest: 'Take the test',
    obtainResult: 'Obtain result'
  },

  dimensions: [
    'Life Satisfaction',
    'Digital Self-Regulation',
    'Online Privacy & Control',
    'Emotional Resilience',
    'Problematic Internet Use (PIU) / Anxiety',
    'Community Engagement',
    'Social Pressure',
    'Recommendation Satisfaction'
  ],

  survey: {
    sectionTitles: {
      p1: 'P1. About you',
      p2: 'P2. Digital consumption experience',
      p3: 'P3. Perception evaluation',
      p4: 'P4. Personal focus and emotional wellbeing',
      p5: 'P5. Internet usage frequency',
      p6: 'P6. Discussion and sharing behavior about personalized feeds'
    },
    sectionInstruction: 'Based on your experience, please indicate your level of agreement with each statement.',
    p1Description: 'Please provide the following information before starting the survey.',
    age: 'Age',
    gender: 'Gender',
    screenTime: 'Average screen time in hours per day (only number)',
    agePlaceholder: 'e.g. 19',
    selectGender: 'Select gender',
    male: 'Male',
    female: 'Female',
    screenTimePlaceholder: 'e.g. 3 or 4.5',
    required: '*',
    errors: {
      ageRequired: 'Age is required.',
      ageNumber: 'Please enter a number only (no letters or symbols).',
      ageRange: 'Please enter a value between 18 and 22.',
      genderRequired: 'Please select your gender.',
      screenTimeRequired: 'Average screen time is required.',
      screenTimeNumber: 'Please enter a number only (e.g. 3 or 4.5). No letters or other symbols.',
      screenTimeMin: 'Please enter 0 or higher.'
    },
    prevSection: 'Previous section',
    next: 'Next',
    submit: 'Submit',
    submitting: 'Submitting…',
    answerAll: 'Please answer all questions before submitting.'
  },

  /** English questions for display (same as API); same order as in questions.js */
  questions,

  result: {
    title: 'Your Survey Results',
    id: 'ID',
    copyIdHint: 'Click to copy ID',
    idCopied: 'ID copied to clipboard',
    copyFailed: 'Copy failed',
    mockId: 'Mock results (demo)',
    home: 'Home',
    takeTestAgain: 'Take test again',
    loading: 'Loading your results…',
    retry: 'Retry',
    pending: 'Your scores are being calculated. Check back shortly or save this link to view results later.',
    loadError: 'Failed to load results. Please try again.',
    overallTitle: 'Digital Wellbeing Index',
    dimensionsSectionTitle: 'Dimension scores',
    tierLabels: { 1: 'Elite', 2: 'Strong', 3: 'Developing', 4: 'Needs Attention' },
    tierBadges: { 1: '🥇 Elite', 2: '🥈 Strong', 3: '🥉 Developing', 4: '⚠ Needs Attention' },
    summaryByTier: {
      1: 'Excellent! Your overall digital wellbeing is strong. Keep maintaining healthy habits.',
      2: 'Good overall digital wellbeing. A few areas could use more attention.',
      3: 'Your digital wellbeing is developing. Consider the tips below to improve.',
      4: 'Your digital wellbeing needs attention. Focus on the tips and risk areas below.'
    },
    riskSectionTitle: 'Risk & attention areas',
    tipsSectionTitle: 'Tips for you',
    insights: {
      lifeSatisfaction: 'You are highly satisfied with your life. Maintain these positive habits.',
      digitalSelfRegulation: 'Excellent management of your digital usage — keep it up.',
      onlinePrivacyAndControl: 'Your online privacy and control practices are strong.',
      emotionalResilience: 'You handle stress and online interactions very well.',
      problematicInternetUseAnxiety: 'Low risk of internet-related anxiety — excellent self-regulation.',
      communityEngagement: 'Good engagement with communities; consider interacting more.',
      socialPressure: 'Some social pressure detected; consider setting boundaries.',
      recommendationSatisfaction: 'Low satisfaction with recommendations — explore diverse content.'
    },
    tips: {
      lifeSatisfaction: 'Keep a balanced routine and stay connected with people who matter.',
      digitalSelfRegulation: 'Use app timers and scheduled breaks.',
      onlinePrivacyAndControl: 'Review privacy settings regularly and limit sharing.',
      emotionalResilience: 'Practice mindfulness and short offline sessions.',
      problematicInternetUseAnxiety: 'Avoid late-night screen time; take digital detox days.',
      communityEngagement: 'Join groups that align with your interests and values.',
      socialPressure: 'Curate your social feed to reduce comparison.',
      recommendationSatisfaction: 'Actively rate recommendations and explore new content sources.'
    }
  },

  metricLabels: {
    lifeSatisfaction: 'Life Satisfaction',
    digitalSelfRegulation: 'Digital Self-Regulation',
    onlinePrivacyAndControl: 'Online Privacy & Control',
    emotionalResilience: 'Emotional Resilience',
    problematicInternetUseAnxiety: 'Problematic Internet Use & Anxiety',
    communityEngagement: 'Community Engagement',
    socialPressure: 'Social Pressure',
    recommendationSatisfaction: 'Recommendation Satisfaction'
  },

  obtain: {
    title: 'Obtain your result',
    description: 'Enter the survey ID you received after completing the test.',
    placeholder: 'e.g. abc12345-6789-...',
    viewResults: 'View results',
    checking: 'Checking…',
    backToHome: '← Back to home',
    errorIdRequired: 'Please enter your survey ID.',
    errorNotFound: 'No results found for this ID. Please check and try again.'
  },

  declined: {
    title: 'You declined',
    text: 'You have not agreed to data collection. You may close this tab.'
  },

  likertAxis: {
    agree: 'Agree',
    disagree: 'Disagree'
  }
}
