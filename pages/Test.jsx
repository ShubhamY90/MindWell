import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { shuffle } from "lodash";
import getQuestionsByMood from "../components/questions";
import { Heart, Sparkles, Star, Zap, CheckCircle, ArrowRight, RotateCcw, ExternalLink, ArrowLeft, Brain, Shield, Waves } from "lucide-react";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, Timestamp, getDoc, increment } from "firebase/firestore";
import { db } from "../context/firebase/firebase";


const answerOptions = {
    anxiety: [
      { label: "Not at all", value: 0, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
      { label: "Several days", value: 1, emoji: "🤔", color: "from-amber-400 via-yellow-400 to-orange-500" },
      { label: "More than half the days", value: 2, emoji: "😟", color: "from-orange-400 via-red-400 to-pink-500" },
      { label: "Nearly every day", value: 3, emoji: "😰", color: "from-red-500 via-pink-500 to-purple-600" },
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ],
    stress: [
      { label: "Never", value: 0, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
      { label: "Almost never", value: 1, emoji: "🤔", color: "from-amber-400 via-yellow-400 to-orange-500" },
      { label: "Sometimes", value: 2, emoji: "😟", color: "from-orange-400 via-red-400 to-pink-500" },
      { label: "Fairly often", value: 3, emoji: "😰", color: "from-red-500 via-pink-500 to-purple-600" },
      { label: "Very often", value: 4, emoji: "😨", color: "from-red-600 via-pink-600 to-purple-700" },
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ],
    anger: [
      { label: "Rarely or none of the time", value: 0, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
      { label: "Some or a little of the time", value: 1, emoji: "🤔", color: "from-amber-400 via-yellow-400 to-orange-500" },
      { label: "Occasionally or a moderate amount", value: 2, emoji: "😠", color: "from-orange-400 via-red-400 to-pink-500" },
      { label: "Most or all of the time", value: 3, emoji: "😡", color: "from-red-500 via-pink-500 to-purple-600" },
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ],
    low: [
      { label: "A little of the time", value: 1, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
      { label: "Some of the time", value: 2, emoji: "😕", color: "from-amber-400 via-yellow-400 to-orange-500" },
      { label: "Good part of the time", value: 3, emoji: "😞", color: "from-orange-400 via-red-400 to-pink-500" },
      { label: "Most of the time", value: 4, emoji: "😩", color: "from-red-500 via-pink-500 to-purple-600" },
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ],
    sad: [
      { label: "Not at all", value: 0, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
      { label: "Several days", value: 1, emoji: "😕", color: "from-amber-400 via-yellow-400 to-orange-500" },
      { label: "More than half the days", value: 2, emoji: "😞", color: "from-orange-400 via-red-400 to-pink-500" },
      { label: "Nearly every day", value: 3, emoji: "😢", color: "from-red-500 via-pink-500 to-purple-600" },
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ],
    happy: [
      { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
    ]
  };

  const getMentalHealthLevel = (score, mood) => {
    if (mood === 'anxiety') {
      if (score <= 4) return { level: "Minimal", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your anxiety levels are minimal." };
      if (score <= 9) return { level: "Mild", color: "from-blue-400 via-indigo-400 to-purple-500", message: "You're experiencing mild anxiety." };
      if (score <= 14) return { level: "Moderate", color: "from-amber-400 via-yellow-400 to-orange-500", message: "You're experiencing moderate anxiety." };
      return { level: "Severe", color: "from-orange-500 via-red-500 to-pink-600", message: "You're experiencing severe anxiety. Consider professional support." };
    }
    
    if (mood === 'stress') {
      if (score <= 13) return { level: "Low", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your stress levels are low." };
      if (score <= 19) return { level: "Moderate", color: "from-amber-400 via-yellow-400 to-orange-500", message: "You're experiencing moderate stress." };
      if (score <= 25) return { level: "High", color: "from-orange-500 via-red-500 to-pink-600", message: "You're experiencing high stress." };
      return { level: "Very High", color: "from-red-600 via-pink-600 to-purple-700", message: "You're experiencing very high stress. Consider stress management techniques." };
    }
    
    if (mood === 'anger') {
      if (score <= 7) return { level: "Minimal", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your anger levels are minimal." };
      if (score <= 14) return { level: "Mild", color: "from-amber-400 via-yellow-400 to-orange-500", message: "You're experiencing mild anger." };
      if (score <= 21) return { level: "Moderate", color: "from-orange-500 via-red-500 to-pink-600", message: "You're experiencing moderate anger." };
      return { level: "Severe", color: "from-red-600 via-pink-600 to-purple-700", message: "You're experiencing severe anger. Consider anger management strategies." };
    }
    
    if (mood === 'low') {
      if (score <= 10) return { level: "Normal", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your energy levels are normal." };
      if (score <= 20) return { level: "Mild", color: "from-blue-400 via-indigo-400 to-purple-500", message: "You're experiencing mild low energy." };
      if (score <= 30) return { level: "Moderate", color: "from-amber-400 via-yellow-400 to-orange-500", message: "You're experiencing moderate low energy." };
      return { level: "Severe", color: "from-orange-500 via-red-500 to-pink-600", message: "You're experiencing severe low energy. Consider consulting a healthcare provider." };
    }
    
    if (mood === 'sad') {
      if (score <= 4) return { level: "Minimal", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your mood is positive." };
      if (score <= 9) return { level: "Mild", color: "from-blue-400 via-indigo-400 to-purple-500", message: "You're experiencing mild mood concerns." };
      if (score <= 14) return { level: "Moderate", color: "from-amber-400 via-yellow-400 to-orange-500", message: "You're experiencing moderate mood concerns." };
      if (score <= 19) return { level: "Moderately Severe", color: "from-orange-500 via-red-500 to-pink-600", message: "You're experiencing moderately severe mood concerns." };
      return { level: "Severe", color: "from-red-600 via-pink-600 to-purple-700", message: "You're experiencing severe mood concerns. Consider seeking support." };
    }
    
    // Default scoring if mood isn't matched
    if (score <= 5) return { level: "Excellent", color: "from-emerald-400 via-cyan-400 to-blue-500", message: "Your mental wellness is thriving!" };
    if (score <= 10) return { level: "Good", color: "from-blue-400 via-indigo-400 to-purple-500", message: "You're maintaining great balance!" };
    if (score <= 15) return { level: "Moderate", color: "from-amber-400 via-yellow-400 to-orange-500", message: "Some mindful attention could help." };
    return { level: "Needs Support", color: "from-orange-500 via-red-500 to-pink-600", message: "Consider connecting with support resources." };
  };

const videoSuggestions = {
  anxiety: {
    "Excellent": "https://www.youtube.com/watch?v=Ufmu1WD2TSk",
    "Good": "https://www.youtube.com/watch?v=6vO1wPAmiMQ",
    "Moderate": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    "Needs Support": "https://www.youtube.com/watch?v=ZToicYcHIOU",
  },
  stress: {
    "Excellent": "https://www.youtube.com/watch?v=ntfcfJ28eiU",
    "Good": "https://www.youtube.com/watch?v=Jyy0ra2WcQQ",
    "Moderate": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    "Needs Support": "https://www.youtube.com/watch?v=ZToicYcHIOU",
  },
  low: {
    "Excellent": "https://www.youtube.com/watch?v=Ufmu1WD2TSk",
    "Good": "https://www.youtube.com/watch?v=6vO1wPAmiMQ",
    "Moderate": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    "Needs Support": "https://www.youtube.com/watch?v=ZToicYcHIOU",
  },
  sad: {
    "Excellent": "https://www.youtube.com/watch?v=Ufmu1WD2TSk",
    "Good": "https://www.youtube.com/watch?v=6vO1wPAmiMQ",
    "Moderate": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    "Needs Support": "https://www.youtube.com/watch?v=ZToicYcHIOU",
  },
  happy: {
    video: "https://www.youtube.com/watch?v=d-diB65scQU",
  },
};

const happyQuotes = [
  "Happiness is not something ready-made. It comes from your own actions. - Dalai Lama",
  "The purpose of our lives is to be happy. - Dalai Lama",
  "Happiness is when what you think, what you say, and what you do are in harmony. - Mahatma Gandhi",
  "The only thing that will make you happy is being happy with who you are. - Goldie Hawn",
  "Happiness is a choice, not a result. Nothing will make you happy until you choose to be happy. - Ralph Marston",
  "The happiest people don't have the best of everything, they just make the best of everything. - Anonymous",
  "Happiness is not by chance, but by choice. - Jim Rohn",
  "Count your age by friends, not years. Count your life by smiles, not tears. - John Lennon",
  "The best way to cheer yourself is to try to cheer someone else up. - Mark Twain",
  "Happiness radiates like the fragrance from a flower and draws all good things towards you. - Maharishi Mahesh Yogi"
];

const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      >
        <div 
          className="rounded-full bg-gradient-to-r from-cyan-300/20 via-purple-300/20 to-pink-300/20 blur-sm"
          style={{
            width: `${8 + Math.random() * 16}px`,
            height: `${8 + Math.random() * 16}px`,
          }}
        ></div>
      </div>
    ))}
  </div>
);

const AnimatedGrid = () => (
  <div className="absolute inset-0 opacity-10">
    <div 
      className="w-full h-full"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite',
      }}
    ></div>
    <style jsx>{`
      @keyframes grid-move {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }
    `}</style>
  </div>
);

const MoodCard = ({ mood, emoji, label, description, onClick, index }) => {
  const colors = {
    anxiety: "from-violet-500 via-purple-500 to-indigo-600",
    stress: "from-amber-500 via-orange-500 to-red-600",
    low: "from-cyan-500 via-teal-500 to-emerald-600",
    sad: "from-rose-500 via-pink-500 to-purple-600",
    happy: "from-yellow-400 via-orange-400 to-pink-500"
  };

  const glowColors = {
    anxiety: "shadow-violet-500/25",
    stress: "shadow-orange-500/25",
    low: "shadow-cyan-500/25",
    sad: "shadow-pink-500/25",
    happy: "shadow-yellow-500/25"
  };

  return (
    <div
      className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
      onClick={() => onClick(mood)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[mood]} rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-xl ${glowColors[mood]}`}></div>
      
      <div className="relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/90">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-6xl transition-all duration-500 group-hover:scale-110 filter drop-shadow-lg">
              {emoji}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {label}
          </h3>
          <p className="text-gray-600 text-base leading-relaxed">{description}</p>
        </div>
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const AnswerOption = ({ option, index, isSelected, onClick, isAnimating }) => (
  <div
    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-400 transform hover:scale-102 ${
      isSelected
        ? `bg-gradient-to-r ${option.color} text-white shadow-2xl scale-102 border-2 border-white/30`
        : "bg-white/70 backdrop-blur-xl hover:bg-white/80 shadow-lg hover:shadow-xl border border-white/30"
    }`}
    onClick={() => onClick(option.value, index)}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="flex items-center space-x-5">
      <div className={`text-2xl transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
        {option.emoji}
      </div>
      <div className="flex-1">
        <span className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
          {option.label}
        </span>
      </div>
      {isSelected && (
        <CheckCircle className="w-6 h-6 text-white animate-pulse" />
      )}
    </div>
    
    {isSelected && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl"></div>
    )}
  </div>
);

export default function MentalHealthQuestionnaire() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [happyResponse, setHappyResponse] = useState('');
  const [showHappyResult, setShowHappyResult] = useState(false);

  const auth = getAuth();

  const mockGetQuestionsByMood = (mood) => {
    const questionSets = {
      anxiety: [
        { text: "Do you feel nervous, anxious, or on edge?" },
        { text: "Do you find it difficult to stop or control worrying?" },
        { text: "Do you worry too much about different things?" },
        { text: "Do you have trouble relaxing?" },
        { text: "Are you so restless that it's hard to sit still?" },
      ],
      stress: [
        { text: "Do you feel overwhelmed by your daily responsibilities?" },
        { text: "Do you have trouble managing your time effectively?" },
        { text: "Do you feel like you're under constant pressure?" },
        { text: "Do you have difficulty sleeping due to stress?" },
        { text: "Do you feel irritable or short-tempered?" },
      ],
      low: [
        { text: "Do you feel tired even after a full night's sleep?" },
        { text: "Do you lack motivation to do things you usually enjoy?" },
        { text: "Do you feel like you have no energy throughout the day?" },
        { text: "Do you find it hard to concentrate on tasks?" },
        { text: "Do you feel disconnected from your daily activities?" },
      ],
      sad: [
        { text: "Do you feel down, depressed, or hopeless?" },
        { text: "Do you have little interest or pleasure in doing things?" },
        { text: "Do you feel bad about yourself or like you're a failure?" },
        { text: "Do you have trouble falling or staying asleep?" },
        { text: "Do you feel like you have little energy?" },
      ],
      happy: [
        { text: "What's making you feel so happy and excited today?" },
      ]
    };
    return questionSets[mood] || [];
  };

  useEffect(() => {
    setShowWelcome(true);
  }, []);

  const handleMoodSelect = (moodValue) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedMood(moodValue);
      setShowWelcome(false);
      
      if (moodValue === 'happy') {
        setQuestions(getQuestionsByMood('sad'));
        setAnswers([]);
        setCurrentQuestionIndex(0);
      } else {
        setQuestions(shuffle(getQuestionsByMood(moodValue)));
        setAnswers([]);
        setCurrentQuestionIndex(0);
      }
      
      setLoading(false);
    }, 1200);
  };

  const handleAnswer = (value, index) => {
    if (selectedMood === 'happy') {
      setSelectedIndex(index);
      setTimeout(() => {
        const randomQuote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)];
        const happyResult = {
          type: 'happy',
          quote: randomQuote,
          video: videoSuggestions[selectedMood].video,
        };
        setResult(happyResult);
        setShowHappyResult(true);
        
        if (auth.currentUser) {
          saveResultsToFirestore(selectedMood, [value], questions, happyResult);
        }
      }, 800);
      return;
    }
  
    setSelectedIndex(index);
    
    setTimeout(() => {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = parseInt(value);
      
      const nextIndex = currentQuestionIndex + 1;
  
      if (nextIndex < questions.length) {
        setAnswers(updatedAnswers);
        setCurrentQuestionIndex(nextIndex);
        setSelectedIndex(null);
      } else {
        const totalScore = updatedAnswers.reduce((a, b) => a + b, 0);
        const { level, color, message } = getMentalHealthLevel(totalScore, selectedMood);
        const assessmentResult = {
          score: totalScore,
          level,
          color,
          message,
          video: videoSuggestions[selectedMood][level],
        };
        setAnswers(updatedAnswers);
        setResult(assessmentResult);
        
        if (auth.currentUser) {
          saveResultsToFirestore(selectedMood, updatedAnswers, questions, assessmentResult);
        }
      }
    }, 800);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedIndex(null);
    }
  };

  const resetQuiz = () => {
    setSelectedMood(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setSelectedIndex(null);
    setShowWelcome(true);
    setHappyResponse('');
    setShowHappyResult(false);
  };

  
  const saveResultsToFirestore = async (mood, answers, questions, result) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const timestamp = Timestamp.fromDate(today);
  
      // Build concerns list
      const concerns = answers.map((value, index) => {
        if (value >= 2) {
          return {
            question: questions[index]?.text || "",
            answer:
              answerOptions[mood]?.find((opt) => opt.value === value)?.label ||
              "",
            value,
          };
        }
        return null;
      }).filter(Boolean);
  
      // Build assessment data
      const assessmentData = {
        date: timestamp,
        moodType: mood,
        score: result?.score || 0,
        level: result?.level || "Happy",
        answers: answers.map((value, index) => ({
          question: questions[index]?.text || "",
          answer:
            answerOptions[mood]?.find((opt) => opt.value === value)?.label || "",
          value,
        })),
        concerns,
        video: result?.video ?? videoSuggestions[mood]?.video ?? null,
        summary: happyResponse || null,
      };
  
      const userDocRef = doc(db, "users", user.uid);
  
      // 1. Save to moodAssessment/{date}/assessments/{autoId}
      const moodDayRef = collection(userDocRef, `moodAssessment/${dateStr}/assessments`);
      await setDoc(doc(moodDayRef), assessmentData);
  
      // 2. Update moodSummary (flat doc at root of user)
      const summaryRef = doc(db, "users", user.uid, "moodSummary", "summary");
      const summarySnap = await getDoc(summaryRef);
      if (!summarySnap.exists()) {
        await setDoc(summaryRef, { [mood]: 1 });
      } else {
        await updateDoc(summaryRef, { [mood]: increment(1) });
      }
  
      // 3. Update dailyMood/{dateStr}
      const dailyMoodRef = doc(db, "users", user.uid, "dailyMood", dateStr);
      const dailySnap = await getDoc(dailyMoodRef);
  
      let moodCounts = {};
      let mostFrequentMood = mood;
      let latestMood = mood;
  
      if (!dailySnap.exists()) {
        moodCounts[mood] = 1;
      } else {
        const prevData = dailySnap.data() || {};
        const prevCounts = { ...prevData };
        delete prevCounts.latestMood;
        delete prevCounts.mostFrequentMood;
  
        moodCounts = {
          ...prevCounts,
          [mood]: (prevCounts[mood] || 0) + 1,
        };
  
        // Determine most frequent mood
        let maxCount = 0;
        for (const key in moodCounts) {
          if (moodCounts[key] > maxCount) {
            mostFrequentMood = key;
            maxCount = moodCounts[key];
          }
        }
      }
  
      await setDoc(dailyMoodRef, {
        ...moodCounts,
        mostFrequentMood,
        latestMood,
      });
  
      console.log("✅ Assessment saved and stats updated.");
    } catch (error) {
      console.error("❌ Error saving assessment data:", error);
    }
  };
  


  const FuturisticBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/30 via-transparent to-pink-50/30"></div>
      <FloatingOrbs />
      <AnimatedGrid />
      
      {/* Large gradient orbs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-300/20 via-pink-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-300/15 via-indigo-300/15 to-purple-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-300/10 via-teal-300/10 to-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-200/50 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
              <div className="absolute inset-2 w-20 h-20 border-2 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDuration: '1.2s'}}></div>
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                Preparing Your Journey
              </p>
              <p className="text-gray-600">Calibrating personalized insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome && !selectedMood) {
    return (
      <div className="min-h-screen w-screen flex flex-col p-4">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-8">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-cyan-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Wellness Assessment
                </span>
                <Sparkles className="w-5 h-5 text-cyan-600" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
                How are you feeling today?
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Step into the future of mental wellness. Our advanced assessment provides 
                <span className="font-semibold text-purple-600"> personalized insights</span> and 
                <span className="font-semibold text-cyan-600"> tailored resources</span> to support your journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              <MoodCard 
                mood="happy" 
                emoji="😄" 
                label="Happy" 
                description="Feeling joyful, excited, or in high spirits today"
                onClick={handleMoodSelect}
                index={0}
              />
              <MoodCard 
                mood="anxiety" 
                emoji="😰" 
                label="Anxious" 
                description="Feeling worried, nervous, or on edge about various situations"
                onClick={handleMoodSelect}
                index={1}
              />
              <MoodCard 
                mood="stress" 
                emoji="😫" 
                label="Stressed" 
                description="Overwhelmed by daily pressures and responsibilities"
                onClick={handleMoodSelect}
                index={2}
              />
              <MoodCard 
                mood="low" 
                emoji="😞" 
                label="Low Energy" 
                description="Feeling tired, unmotivated, or lacking enthusiasm"
                onClick={handleMoodSelect}
                index={3}
              />
              <MoodCard 
                mood="sad" 
                emoji="😢" 
                label="Sad" 
                description="Experiencing feelings of sadness or hopelessness"
                onClick={handleMoodSelect}
                index={4}
              />
            </div>

            <div className="text-center mt-16 space-y-6">
              <div className="flex items-center justify-center space-x-6 text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Completely Confidential</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium">Personalized for You</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Waves className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">Science-Based</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result && result.type === 'happy') {
    return (
      <div className="min-h-screen w-screen flex flex-col p-4">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
              <div className="text-center space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-yellow-100/80 via-orange-100/80 to-pink-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold bg-gradient-to-r from-yellow-700 to-orange-600 bg-clip-text text-transparent">
                      Celebrating Your Joy!
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    That's Wonderful! 🌟
                  </h2>
                  
                  <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <div className="text-6xl mb-6">✨</div>
                    <blockquote className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed italic">
                      "{result.quote}"
                    </blockquote>
                  </div>
                  
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Your happiness is truly beautiful! Keep nurturing these positive moments and remember to share your joy with others. 
                    Here's an uplifting video to amplify your wonderful energy!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50/80 to-pink-50/80 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-white/30">
                  <div className="flex items-center justify-center space-x-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-pink-600 bg-clip-text text-transparent">
                      Spread the Joy
                    </h3>
                  </div>
                  
                  <div className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                    <iframe
                      className="w-full h-full"
                      src={result.video.replace("watch?v=", "embed/")}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Happiness Resource"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
                  >
                    <Sparkles className="w-5 h-5 mr-3" />
                    Share More Joy
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-yellow-300 hover:border-yellow-400 bg-white/80 backdrop-blur-sm px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg text-yellow-700 hover:text-yellow-800"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Spread Positivity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen w-screen flex flex-col p-4">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
              <div className="text-center space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-100/80 via-emerald-100/80 to-cyan-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold bg-gradient-to-r from-emerald-700 to-cyan-600 bg-clip-text text-transparent">
                      Assessment Complete
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Your Wellness Profile
                  </h2>
                  <p className="text-gray-600 text-xl">{result.message}</p>
                </div>

                <div className="flex flex-col items-center space-y-8">
                  <div className={`relative w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br ${result.color} shadow-2xl`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative text-center text-white">
                      <div className="text-3xl font-bold">{result.score}</div>
                      <div className="text-sm opacity-90 font-medium">wellness points</div>
                    </div>
                    <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-lg"></div>
                  </div>
                  
                  <div className={`px-8 py-3 rounded-full bg-gradient-to-r ${result.color} text-white font-bold text-xl shadow-xl border border-white/20`}>
                    {result.level}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-white/30">
                  <div className="flex items-center justify-center space-x-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Curated Resource
                    </h3>
                  </div>
                  
                  <div className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                    <iframe
                      className="w-full h-full"
                      src={result?.video && (
                        <iframe
                          width="100%"
                          height="315"
                          src={result.video.replace("watch?v=", "embed/")}
                          title="YouTube video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Wellness Resource"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
                  >
                    <RotateCcw className="w-5 h-5 mr-3" />
                    Take Assessment Again
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white/80 backdrop-blur-sm px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Explore Resources
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    
    <div className="min-h-screen w-screen flex flex-col">
      <FuturisticBackground />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6 md:p-10">
            {/* Progress Section */}
            <div className="mb-12 space-y-6">
              <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
                <span className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Question Section */}
            <div className="space-y-10">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-gray-800 bg-clip-text text-transparent leading-relaxed">
                  {currentQuestion?.text}
                </h2>
                
                {selectedMood === 'happy' ? (
                  <div className="max-w-2xl mx-auto">
                    <textarea
                      className="w-full p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg text-gray-700 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                      rows="4"
                      placeholder="Share what's bringing you joy today... 🌟"
                      value={happyResponse}
                      onChange={(e) => setHappyResponse(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAnswer(0, 0)}
                      className="mt-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Continue
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 text-lg">
                      Select the response that best reflects your recent experience:
                    </p>
                    <div className="space-y-4 max-w-2xl mx-auto">
                    {answerOptions[selectedMood]?.map((option, index) => (
                        <AnswerOption
                            key={index}
                            option={option}
                            index={index}
                            isSelected={selectedIndex === index}
                            isAnimating={selectedIndex === index}
                            onClick={handleAnswer}
                        />
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Section */}
            <div className="mt-12 flex items-center justify-between">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Your privacy is protected</span>
                </p>
              </div>
              
              <Button
                onClick={resetQuiz}
                className="bg-red-100/80 hover:bg-red-200/80 text-red-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}