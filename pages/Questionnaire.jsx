import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { shuffle } from "lodash";
import getQuestionsByMood from "../components/questions";
import { Heart, Sparkles, Star, Zap, CheckCircle, ArrowRight, RotateCcw, ExternalLink, ArrowLeft, Brain, Shield, Waves } from "lucide-react";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../context/firebase/firebase";


const answerOptions = [
  { label: "Not at all", value: 0, emoji: "😌", color: "from-emerald-400 via-cyan-400 to-blue-500" },
  { label: "Sometimes", value: 1, emoji: "🤔", color: "from-amber-400 via-yellow-400 to-orange-500" },
  { label: "Often", value: 2, emoji: "😟", color: "from-orange-400 via-red-400 to-pink-500" },
  { label: "Almost always", value: 3, emoji: "😰", color: "from-red-500 via-pink-500 to-purple-600" },
  { label: "Skip", value: 0, emoji: "⏭️", color: "from-slate-400 via-gray-400 to-zinc-500" },
];

const getMentalHealthLevel = (score) => {
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
        
        // ADDED: Save happy results
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
        const { level, color, message } = getMentalHealthLevel(totalScore);
        const assessmentResult = {
          score: totalScore,
          level,
          color,
          message,
          video: videoSuggestions[selectedMood][level],
        };
        setAnswers(updatedAnswers);
        setResult(assessmentResult);
        
        // ADDED: Save assessment results
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
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Extract concerns (questions with "Often" or "Almost always")
      const concerns = [];
      answers.forEach((answerValue, index) => {
        if (answerValue === 2 || answerValue === 3) {
          concerns.push({
            question: questions[index].text,
            answer: answerOptions.find(opt => opt.value === answerValue)?.label,
            value: answerValue
          });
        }
      });

      // Prepare mood data
      const moodData = {
        date: Timestamp.fromDate(today),
        moodType: mood,
        score: result?.score || 0,
        level: result?.level || "Happy",
        answers: answers.map((value, index) => ({
          question: questions[index].text,
          answer: answerOptions.find(opt => opt.value === value)?.label,
          value
        })),
        concerns,
        video: result?.video || videoSuggestions[mood]?.video
      };

      // Save to Firestore
      const userDocRef = doc(db, "users", user.uid);
      const moodsCollectionRef = collection(userDocRef, "moods");
      const dateDocRef = doc(moodsCollectionRef, dateStr);
      
      await setDoc(dateDocRef, moodData, { merge: true });
      console.log("Mood data saved successfully");
    } catch (error) {
      console.error("Error saving mood data: ", error);
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
              