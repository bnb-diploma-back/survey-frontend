/**
 * Survey sections and questions from "Teens, Feeds, and the Algorithm" (Likert scale).
 * P1 = About you (age, gender, screen time). P2–P6 = question sections.
 */

export const sections = [
  {
    id: 'p1',
    title: 'P1. About you',
    description: 'Please provide the following information before starting the survey.',
    questions: []
  },
  {
    id: 'p2',
    title: 'P2. Digital consumption experience',
    description:
      'Teenagers today live in a world where every scroll, like, and share shapes a personalized digital experience that quietly influences their mood, interests, and identity. Based on your digital consumption experiences, please indicate your level of agreement.',
    questions: [
      'I intentionally set limits on my screen use.',
      'I can control how much time I spend on screens.',
      'I often lose track of time while using screens.',
      'I am ready to be responsible for the negative outcomes caused by my screen use.',
      'My screen use supports my personal or professional goals.',
      'Screen time distracts me from important tasks.',
      'I use digital technologies mainly for purposeful activities.',
      'I feel that my actions matter in online communities.',
      'I can positively influence others in digital spaces.',
      'I feel powerless in online environments.',
      'I feel supported when people interact with me online.',
      'Online connections help me during difficult times.',
      'Improper behavior by others online stresses or annoys me.',
      'I feel good when people online behave respectfully.',
      'I appreciate it when users consider appropriateness before sharing content.',
      'Respectful behavior online makes digital spaces enjoyable.',
      'Online spaces often feel hostile or disrespectful.'
    ]
  },
  {
    id: 'p3',
    title: 'P3. Perception evaluation',
    description:
      'Perception evaluation explores how teens interpret and trust what algorithms show them—when over 70% of their online content is personalized, it shapes what they believe is real, relevant, or worth their attention. Please indicate your perception on the following items.',
    questions: [
      'In most ways my life is close to my ideal.',
      'The conditions of my life are excellent.',
      'I am satisfied with my life.',
      'So far I have gotten the important things I want in life.',
      'If I could live my life over, I would change almost nothing.',
      'I feel in control over the information I provide on social networking sites.',
      'Privacy settings allow me to have full control over the information I provide on social networking sites.',
      'I feel in control of who can view my information on social networking sites.',
      'I am very attached to my online communities (e.g., forums, social media groups, online games).',
      'Other members of my online communities and I share the same objectives.',
      'The friendships I have with other online community members mean a lot to me.',
      'I see myself as part of my online communities.',
      'I am motivated to participate in the online community\'s activities because I am able to reach personal goals.'
    ]
  },
  {
    id: 'p4',
    title: 'P4. Personal focus and emotional wellbeing',
    description:
      'Personal focus and emotional wellbeing reveal how constant algorithmic engagement affects teens\' attention and mood. Please indicate how often you experience the following.',
    questions: [
      'It is easy for me to concentrate on what I am doing.',
      'I can tolerate emotional pain.',
      'I can accept things I cannot change.',
      'I can usually describe how I feel at the moment in considerable detail.',
      'It\'s easy for me to keep track of my thoughts and feelings.',
      'I try to notice my thoughts without judging them.',
      'I am able to accept the thoughts and feelings I have.',
      'I am able to focus on the present moment.',
      'I am able to pay close attention to one thing for a long period of time.',
      'I\'ve been feeling optimistic about the future.',
      'I\'ve been feeling useful.',
      'I\'ve been feeling relaxed.',
      'I\'ve been dealing with problems well.',
      'I\'ve been thinking clearly.',
      'I\'ve been feeling close to other people.',
      'I\'ve been able to make up my own mind about things.'
    ]
  },
  {
    id: 'p5',
    title: 'P5. Internet usage frequency',
    description:
      'Internet usage frequency highlights how Gen Z stays plugged in. Please indicate how often these statements describe your online behavior.',
    questions: [
      'I spend time online when I\'d rather sleep.',
      'I feel tense, irritated, or stressed if I cannot use the Internet as long as I want to.',
      'I wish to decrease the amount of time spent online but do not succeed.',
      'I try to conceal the amount of time spent online.',
      'People in my life complain about me spending too much time online.',
      'I feel depressed, moody, or nervous when I am not online, and these feelings stop once I am back online.'
    ]
  },
  {
    id: 'p6',
    title: 'P6. Discussion and sharing behavior about personalized feeds',
    description:
      'Discussion and sharing behavior show how teens turn algorithms into conversation starters. Please indicate how much you agree or disagree with the following statements about how you discuss and share your personalized recommendations (e.g., TikTok videos, Instagram Reels, YouTube Shorts) with friends.',
    questions: [
      'The videos/posts recommended to me usually match my interests.',
      'My recommended feed helps me discover new and useful information.',
      'I feel bored when the recommendations become repetitive.',
      'I believe my recommended feed improves my overall social media experience.',
      'I often share recommended videos/posts with my friends.',
      'My friends and I often discuss the content we see on our feeds.',
      'We compare how similar or different our feeds are.',
      'Sharing personalized content helps me connect with others.',
      'I sometimes feel pressure to share content that is trending on my feed.'
    ]
  }
]

/** Flattened list of all Likert questions (P2–P6 only; for submit and refs) */
export const questions = sections.flatMap((s) => s.questions)

/** Global question index where this section's questions start (section 0 = P1 has no questions) */
export function getQuestionStartIndex(sectionIndex) {
  let start = 0
  for (let i = 0; i < sectionIndex && i < sections.length; i++) {
    start += sections[i].questions.length
  }
  return start
}

/** For a section with questions, returns { startIndex, questions }. Section 0 (P1) returns { startIndex: 0, questions: [] }. */
export function getQuestionsForSection(sectionIndex) {
  const startIndex = getQuestionStartIndex(sectionIndex)
  const section = sections[sectionIndex]
  return { startIndex, questions: section ? section.questions : [] }
}

/** For each question index, the section index it belongs to (1..5 for questions; 0 = P1) */
export function getSectionIndexForQuestion(questionIndex) {
  let count = 0
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].questions.length === 0) continue
    if (questionIndex < count + sections[i].questions.length) return i
    count += sections[i].questions.length
  }
  return sections.length - 1
}

/** Whether to show a section header before this question index (true for first question of each section) */
export function isFirstQuestionInSection(questionIndex) {
  let count = 0
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].questions.length === 0) continue
    if (questionIndex === count) return true
    count += sections[i].questions.length
  }
  return false
}

export function getSectionForQuestionIndex(questionIndex) {
  const sectionIndex = getSectionIndexForQuestion(questionIndex)
  return sections[sectionIndex]
}
