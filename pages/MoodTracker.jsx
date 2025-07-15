import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, Frown, Zap, AlertCircle, Battery } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, getDocs, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../context/firebase/firebase";

const getDateStr = (date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD

const MoodLineChartPage = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');

  const moodConfig = {
    happy: { color: '#FDE047', icon: '😊', name: 'Happy', value: 5 },
    sad: { color: '#60A5FA', icon: '😢', name: 'Sad', value: 2 },
    stress: { color: '#F87171', icon: '😰', name: 'Stressed', value: 1 },
    anxious: { color: '#FB923C', icon: '😰', name: 'Anxious', value: 2 },
    lowEnergy: { color: '#9CA3AF', icon: '😴', name: 'Low Energy', value: 3 }
  };

  const motivationalQuotes = [
    "Every day is a new opportunity to shine brighter than yesterday. ✨",
    "Your mood doesn't define your day, your actions do. 💪",
    "Progress, not perfection. Every small step counts. 🌟",
    "Embrace the journey, celebrate the growth. 🌱",
    "You are stronger than you think and braver than you feel. 🦋",
    "Today's challenges are tomorrow's victories. 🏆",
    "Your mental health matters. Take it one breath at a time. 🌸",
    "Every emotion is valid, every feeling is temporary. 🌈",
    "You have the power to create positive change in your life. ⚡",
    "Self-care isn't selfish, it's essential. 💝",
    "Your story is still being written. Make it beautiful. 📖",
    "Difficult roads often lead to beautiful destinations. 🌅",
    "You are enough, exactly as you are right now. 💎",
    "Growth happens outside your comfort zone. 🚀",
    "Your resilience is your superpower. 💫"
  ];

  const fetchMoodData = async (date) => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const dateStr = getDateStr(date);
      const assessmentsRef = collection(db, "users", user.uid, "moodAssessment", dateStr, "assessments");
      const snapshot = await getDocs(assessmentsRef);

      if (snapshot.empty) return null;

      const moodScores = { happy: 0, sad: 0, stress: 0, anxious: 0, lowEnergy: 0 };
      let latestMood = null;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.moodType && moodScores.hasOwnProperty(data.moodType)) {
          moodScores[data.moodType] += data.score || 1;
          latestMood = data.moodType;
        }
      });

      const dominantMood = Object.entries(moodScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      // Save to dailyMood
      const dailyMoodRef = doc(db, "users", user.uid, "dailyMood", dateStr);
      await setDoc(dailyMoodRef, {
        ...moodScores,
        latestMood: latestMood,
        mostFrequentMood: dominantMood
      }, { merge: true });

      // Update moodSummary
      const summaryRef = doc(db, "users", user.uid, "moodSummary", "summary");
      await updateDoc(summaryRef, {
        [latestMood]: increment(1)
      });

      return {
        date: dateStr,
        mood: dominantMood,
        scores: moodScores
      };
    } catch (error) {
      console.error("Error fetching mood data:", error);
      return null;
    }
  };

  const loadLast8DaysData = async () => {
    setLoading(true);
    const data = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const moodInfo = await fetchMoodData(date);
      
      if (moodInfo) {
        // Calculate average mood score for the day
        const totalScore = Object.values(moodInfo.scores).reduce((sum, score) => sum + score, 0);
        const avgValue = totalScore > 0 ? Math.min(5, Math.max(1, totalScore / 5)) : 3;
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date.toLocaleDateString(),
          mood: moodInfo.mood,
          value: avgValue,
          emoji: moodConfig[moodInfo.mood].icon,
          moodName: moodConfig[moodInfo.mood].name,
          scores: moodInfo.scores
        });
      } else {
        // No mood data for this day
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date.toLocaleDateString(),
          mood: 'neutral',
          value: 3,
          emoji: '😐',
          moodName: 'No Data',
          scores: { happy: 0, sad: 0, stress: 0, anxious: 0, lowEnergy: 0 }
        });
      }
    }
    
    setChartData(data);
    setLoading(false);
  };

  const getRandomQuote = () => {
    const today = new Date().toDateString();
    const savedQuote = sessionStorage.getItem('dailyQuote');
    const savedDate = sessionStorage.getItem('quoteDate');
    
    if (savedQuote && savedDate === today) {
      return savedQuote;
    }
    
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const newQuote = motivationalQuotes[randomIndex];
    
    sessionStorage.setItem('dailyQuote', newQuote);
    sessionStorage.setItem('quoteDate', today);
    
    return newQuote;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        loadLast8DaysData();
        setCurrentQuote(getRandomQuote());
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (user) {
        await loadLast8DaysData();
        setCurrentQuote(getRandomQuote());
      }
    };

    loadData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.fullDate}</p>
          <div className="flex items-center mt-2">
            <span className="text-2xl mr-2">{data.emoji}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">{data.moodName}</p>
              <p className="text-xs text-gray-500">Score: {data.value.toFixed(1)}</p>
            </div>
          </div>
          {data.scores && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-600 mb-1">Mood Breakdown:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(data.scores).map(([mood, score]) => (
                  <div key={mood} className="flex justify-between">
                    <span className="capitalize">{mood}:</span>
                    <span className="font-medium">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="white" stroke="#6366F1" strokeWidth={2} />
        <text x={cx} y={cy + 1} textAnchor="middle" fontSize="12">
          {payload.emoji}
        </text>
      </g>
    );
  };

  const averageMood = chartData.length > 0 ? 
    (chartData.reduce((sum, day) => sum + day.value, 0) / chartData.length).toFixed(1) : 0;

  const getTrendDirection = () => {
    if (chartData.length < 2) return 'neutral';
    const recent = chartData.slice(-3).reduce((sum, day) => sum + day.value, 0) / 3;
    const earlier = chartData.slice(0, 3).reduce((sum, day) => sum + day.value, 0) / 3;
    return recent > earlier ? 'up' : recent < earlier ? 'down' : 'neutral';
  };

  const trend = getTrendDirection();

  return (
    <div
  className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 bg-cover bg-center bg-no-repeat relative overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600"
  >
  {/*  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600"> */}
      <div className="max-w-6xl mx-auto top-20 relative">

        {/* Motivational Quote */}
        <div className="mb-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Inspiration</h2>
            <p className="text-lg text-gray-700 italic leading-relaxed">
              "{currentQuote}"
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 bottom-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <TrendingUp className="mr-3 text-indigo-600" size={32} />
              8-Day Mood Trend
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-indigo-600">{averageMood}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Trend</p>
                <p className={`text-2xl font-bold ${
                  trend === 'up' ? 'text-green-500' : 
                  trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading your mood journey...</p>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => {
                      const labels = ['', 'Low', 'Fair', 'Good', 'Great', 'Excellent'];
                      return labels[value];
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorGradient)"
                    strokeWidth={4}
                    dot={<CustomDot />}
                    activeDot={{ r: 12, stroke: '#6366F1', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodLineChartPage;