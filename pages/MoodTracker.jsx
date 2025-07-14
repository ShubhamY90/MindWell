import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Frown, Zap, AlertCircle, Battery } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../context/firebase/firebase"; 

const MoodCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodData, setMoodData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState(null);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    if (user) loadMonthMoodData();
  });

  return () => unsubscribe();
}, []);

  // Mock user ID - replace with actual auth user ID
  const userId = auth.currentUser ? auth.currentUser.uid : '123';

  // Mood configurations
  const moodConfig = {
    happy: { color: 'bg-yellow-200 text-yellow-800', icon: Heart, name: 'Happy' },
    sad: { color: 'bg-blue-200 text-blue-800', icon: Frown, name: 'Sad' },
    stress: { color: 'bg-red-200 text-red-800', icon: Zap, name: 'Stressed' },
    anxious: { color: 'bg-orange-200 text-orange-800', icon: AlertCircle, name: 'Anxious' },
    lowEnergy: { color: 'bg-gray-200 text-gray-800', icon: Battery, name: 'Low Energy' }
  };

  // Suggestions based on mood
  const suggestions = {
    happy: [
      "Share your positivity with others today!",
      "Try a new hobby or activity you've been wanting to explore",
      "Practice gratitude by writing down 3 things you're thankful for",
      "Use this energy to tackle a challenging task",
      "Spend time outdoors and enjoy nature"
    ],
    sad: [
      "Reach out to a friend or family member for support",
      "Practice self-care with a warm bath or favorite meal",
      "Try gentle exercise like walking or yoga",
      "Journal about your feelings to process emotions",
      "Consider talking to a mental health professional"
    ],
    stress: [
      "Practice deep breathing exercises for 5 minutes",
      "Try meditation or mindfulness techniques",
      "Take short breaks throughout your day",
      "Prioritize your tasks and focus on one at a time",
      "Get adequate sleep and maintain a regular schedule"
    ],
    anxious: [
      "Use grounding techniques: 5 things you see, 4 you hear, 3 you touch",
      "Practice progressive muscle relaxation",
      "Limit caffeine and alcohol intake",
      "Try aromatherapy with calming scents like lavender",
      "Focus on what you can control, not what you can't"
    ],
    lowEnergy: [
      "Ensure you're getting 7-9 hours of quality sleep",
      "Stay hydrated and eat nutritious meals",
      "Try light exercise or stretching",
      "Take short power naps if needed (15-20 minutes)",
      "Consider vitamin D supplements if you lack sunlight"
    ]
  };

  // Calculate dominant mood from mood scores
  const calculateDominantMood = (moodScores) => {
    if (!moodScores) return null;
    
    const moods = Object.entries(moodScores);
    const dominantMood = moods.reduce((prev, current) => 
      prev[1] > current[1] ? prev : current
    );
    
    return dominantMood[0];
  };

  const fetchMoodData = async (date) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const moodCollectionRef = collection(db, "users", user.uid, "moodAssessment", dateStr);
    const snapshot = await getDocs(moodCollectionRef);

    if (snapshot.empty) return null;

    const moodScores = {
      happy: 0,
      sad: 0,
      stress: 0,
      anxious: 0,
      lowEnergy: 0,
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.moodType && moodScores.hasOwnProperty(data.moodType)) {
        moodScores[data.moodType] += data.score || 1;
      }
    });

    const dominantMood = Object.entries(moodScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return {
      date: dateStr,
      mood: dominantMood,
      scores: moodScores,
    };
  } catch (error) {
    console.error("Error fetching mood data:", error);
    return null;
  }
};







  // Load mood data for current month
  const loadMonthMoodData = async () => {
    setLoading(true);
    const monthData = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const moodInfo = await fetchMoodData(date);
      if (moodInfo) {
        monthData[moodInfo.date] = moodInfo;
      }
    }

    setMoodData(monthData);
    setLoading(false);
  };

  // Load mood data for selected date
  useEffect(() => {
    const loadSelectedDateMood = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      if (moodData[dateStr]) {
        setCurrentMood(moodData[dateStr]);
      } else {
        const moodInfo = await fetchMoodData(selectedDate);
        setCurrentMood(moodInfo);
      }
    };

    loadSelectedDateMood();
  }, [selectedDate, moodData]);

  // Load month data when month changes
  useEffect(() => {
    loadMonthMoodData();
  }, [currentMonth]);

  // Calendar navigation
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const isSelected = current.toDateString() === selectedDate.toDateString();
      const moodInfo = moodData[dateStr];

      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        moodInfo
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mood Calendar</h1>
          <p className="text-gray-600">Track your daily mood and get personalized suggestions</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Calendar className="mr-2" size={24} />
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading mood data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const moodColor = day.moodInfo ? moodConfig[day.moodInfo.mood]?.color : '';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        p-3 text-sm rounded-lg transition-all duration-200 relative
                        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                        ${day.isSelected ? 'ring-2 ring-purple-500' : ''}
                        ${moodColor || 'hover:bg-gray-100'}
                        ${day.moodInfo ? 'font-medium' : ''}
                      `}
                    >
                      {day.day}
                      {day.moodInfo && (
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-current rounded-full opacity-60"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggestions Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Daily Suggestions
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Selected Date: {selectedDate.toLocaleDateString()}
              </h3>
              
              {currentMood ? (
                <div className="mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${moodConfig[currentMood.mood]?.color}`}>
                    {React.createElement(moodConfig[currentMood.mood]?.icon, { size: 16, className: 'mr-1' })}
                    {moodConfig[currentMood.mood]?.name}
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Mood Scores:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(currentMood.scores).map(([mood, score]) => (
                        <div key={mood} className="flex justify-between">
                          <span className="capitalize">{mood}:</span>
                          <span className="font-medium">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">No mood data available for this date</p>
                </div>
              )}
            </div>

            {currentMood && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Suggestions for {moodConfig[currentMood.mood]?.name} Mood
                </h4>
                <div className="space-y-3">
                  {suggestions[currentMood.mood]?.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCalendarPage;