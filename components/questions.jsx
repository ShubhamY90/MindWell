const anxietyQuestions = [
  { id: 1, text: "Do you often feel nervous, anxious, or on edge?" },
  { id: 2, text: "Do you find it difficult to control your worrying?" },
  { id: 3, text: "Do you worry about different things at the same time?" },
  { id: 4, text: "Do you feel restless or unable to relax?" },
  { id: 5, text: "Do you get easily irritated or annoyed?" },
  { id: 6, text: "Do you experience sudden feelings of panic?" },
  { id: 7, text: "Do you avoid certain situations because they make you anxious?" },
  { id: 8, text: "Do you have trouble concentrating because of anxiety?" },
  { id: 9, text: "Do you feel your heart racing or sweating when anxious?" },
  { id: 10, text: "Do you worry about things that are unlikely to happen?" },
  { id: 11, text: "Do you find it hard to stop worrying once you start?" },
  { id: 12, text: "Do you feel tense or have muscle aches due to anxiety?" },
  { id: 13, text: "Do you feel a sense of dread or impending doom?" },
  { id: 14, text: "Do you have difficulty falling or staying asleep due to worry?" },
  { id: 15, text: "Do you get tired easily because of constant anxiety?" },
  { id: 16, text: "Do you feel self-conscious in social situations?" },
  { id: 17, text: "Do you worry about how others perceive you?" },
  { id: 18, text: "Do you have trouble making decisions because of worry?" },
  { id: 19, text: "Do you experience physical symptoms like nausea or headaches when anxious?" },
  { id: 20, text: "Do you avoid talking about your worries with others?" }
];

const stressQuestions = [
  { id: 1, text: "Do you feel overwhelmed by your daily responsibilities?" },
  { id: 2, text: "Do you have trouble relaxing after a busy day?" },
  { id: 3, text: "Do you feel like you have too much to do and not enough time?" },
  { id: 4, text: "Do you feel tense or uptight most of the time?" },
  { id: 5, text: "Do you find it hard to switch off your thoughts?" },
  { id: 6, text: "Do you get easily frustrated or lose your temper?" },
  { id: 7, text: "Do you feel pressure to meet others’ expectations?" },
  { id: 8, text: "Do you have difficulty sleeping because of stress?" },
  { id: 9, text: "Do you experience headaches, stomachaches, or muscle tension?" },
  { id: 10, text: "Do you feel like you’re always rushing?" },
  { id: 11, text: "Do you feel emotionally drained at the end of the day?" },
  { id: 12, text: "Do you find it hard to enjoy things you used to?" },
  { id: 13, text: "Do you feel like you have little control over your life?" },
  { id: 14, text: "Do you withdraw from friends or family when stressed?" },
  { id: 15, text: "Do you eat more or less than usual when stressed?" },
  { id: 16, text: "Do you feel forgetful or have trouble concentrating?" },
  { id: 17, text: "Do you use alcohol, food, or other substances to cope with stress?" },
  { id: 18, text: "Do you feel like you’re on ‘autopilot’ much of the time?" },
  { id: 19, text: "Do you avoid activities or situations because they feel overwhelming?" },
  { id: 20, text: "Do you feel physically exhausted even after resting?" }
];

const lowQuestions = [
  { id: 1, text: "Do you wake up feeling tired even after sleeping enough?" },
  { id: 2, text: "Do you struggle to find the energy to do daily tasks?" },
  { id: 3, text: "Do you feel physically drained most of the time?" },
  { id: 4, text: "Do you have trouble staying awake during the day?" },
  { id: 5, text: "Do you feel like you need more sleep than usual?" },
  { id: 6, text: "Do you lack motivation to start new activities?" },
  { id: 7, text: "Do you feel like your body is heavy or sluggish?" },
  { id: 8, text: "Do you find it hard to concentrate or stay focused?" },
  { id: 9, text: "Do you feel like you’re moving or thinking more slowly?" },
  { id: 10, text: "Do you take longer than usual to complete tasks?" },
  { id: 11, text: "Do you need frequent breaks to get through the day?" },
  { id: 12, text: "Do you avoid physical activity because you feel too tired?" },
  { id: 13, text: "Do you have trouble getting out of bed in the morning?" },
  { id: 14, text: "Do you feel drained after social interactions?" },
  { id: 15, text: "Do you rely on caffeine or other stimulants to stay alert?" },
  { id: 16, text: "Do you feel like your energy crashes in the afternoon?" },
  { id: 17, text: "Do you feel unrefreshed after naps or rest?" },
  { id: 18, text: "Do you lack interest in hobbies or activities you once enjoyed?" },
  { id: 19, text: "Do you feel like you can’t keep up with your usual routine?" },
  { id: 20, text: "Do you feel physically weak or easily fatigued?" }
];

const sadQuestions = [
  { id: 1, text: "Do you feel sad or down most of the time?" },
  { id: 2, text: "Do you have trouble enjoying things you used to like?" },
  { id: 3, text: "Do you feel hopeless about the future?" },
  { id: 4, text: "Do you feel worthless or like a failure?" },
  { id: 5, text: "Do you cry more often than usual?" },
  { id: 6, text: "Do you feel alone even when around others?" },
  { id: 7, text: "Do you have trouble finding meaning or purpose?" },
  { id: 8, text: "Do you feel numb or emotionally flat?" },
  { id: 9, text: "Do you blame yourself for things that aren’t your fault?" },
  { id: 10, text: "Do you struggle to make decisions or concentrate?" },
  { id: 11, text: "Do you avoid social situations because you feel down?" },
  { id: 12, text: "Do you feel like you’re moving or speaking more slowly?" },
  { id: 13, text: "Do you have thoughts that life isn’t worth living?" },
  { id: 14, text: "Do you feel easily overwhelmed by small problems?" },
  { id: 15, text: "Do you have trouble sleeping or sleep too much?" },
  { id: 16, text: "Do you feel like nothing will ever get better?" },
  { id: 17, text: "Do you feel disconnected from others?" },
  { id: 18, text: "Do you have trouble finding motivation to do anything?" },
  { id: 19, text: "Do you feel physically slowed down or restless?" },
  { id: 20, text: "Do you feel empty or hollow inside?" }
];

export default function getQuestionsByMood(mood) {
  switch (mood) {
    case "anxiety":
      return anxietyQuestions;
    case "stress":
      return stressQuestions;
    case "low":
      return lowQuestions;
    case "sad":
      return sadQuestions;
    default:
      return [];
  }
}
