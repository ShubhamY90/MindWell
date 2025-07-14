import React, { useState } from 'react';

const Exercise = () => {
  const [activeExercise, setActiveExercise] = useState(null);
  const [expandedView, setExpandedView] = useState(false);

  const exerciseCategories = [
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Reduce anxiety and regulate emotions through controlled breathing patterns',
      benefits: ['Lowers stress hormones', 'Improves focus', 'Balances nervous system'],
      color: 'from-blue-100 to-cyan-50',
      accent: 'blue',
      animation: 'https://my.spline.design/breathinganimation-xyz/',
      steps: [
        'Find a comfortable seated position',
        'Inhale deeply for 4 seconds',
        'Hold breath for 4 seconds',
        'Exhale slowly for 6 seconds',
        'Repeat for 5-10 cycles'
      ]
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Meditation',
      description: 'Cultivate present-moment awareness without judgment',
      benefits: ['Reduces rumination', 'Enhances emotional regulation', 'Improves sleep quality'],
      color: 'from-green-100 to-emerald-50',
      accent: 'green',
      animation: 'https://my.spline.design/mindfulnessanimation-xyz/',
      steps: [
        'Sit comfortably with straight posture',
        'Focus on your natural breathing',
        'When mind wanders, gently return focus',
        'Start with 5 minute sessions'
      ]
    },
    {
      id: 'grounding',
      title: 'Grounding Techniques',
      description: 'Anchor yourself during moments of anxiety or dissociation',
      benefits: ['Reduces panic symptoms', 'Improves spatial awareness', 'Enhances emotional stability'],
      color: 'from-purple-100 to-violet-50',
      accent: 'purple',
      animation: 'https://my.spline.design/groundinganimation-xyz/',
      techniques: [
        '5-4-3-2-1 Method (Name things you can sense)',
        'Body scan meditation',
        'Temperature awareness (hold something cold)',
        'Bilateral stimulation (tapping)'
      ]
    }
  ];

  const ExerciseCard = ({ exercise }) => (
    <div 
      className={`bg-gradient-to-br ${exercise.color} border-${exercise.accent}-200 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col`}
      onClick={() => setActiveExercise(exercise)}
    >
      <div className="aspect-square w-full mb-4 rounded-xl overflow-hidden bg-white/50">
        <iframe 
          src={exercise.animation}
          className="w-full h-full pointer-events-none"
          title={`${exercise.title} Preview`}
          frameBorder="0"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{exercise.title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{exercise.description}</p>
      <button 
        className={`mt-auto bg-${exercise.accent}-500 hover:bg-${exercise.accent}-600 text-white py-2 px-4 rounded-full transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
          setActiveExercise(exercise);
          setExpandedView(true);
        }}
      >
        Begin Practice
      </button>
    </div>
  );

  const ExerciseDetail = ({ exercise, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-${exercise.accent}-100`}>
        <div className="relative h-64 w-full bg-gray-100">
          <iframe 
            src={exercise.animation}
            className="w-full h-full"
            title={`${exercise.title} Animation`}
            frameBorder="0"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{exercise.title}</h2>
              <p className="text-gray-600">{exercise.description}</p>
            </div>
            <span className={`bg-${exercise.accent}-100 text-${exercise.accent}-800 py-1 px-3 rounded-full text-sm font-medium`}>
              {exercise.benefits.length} Benefits
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Key Benefits
              </h3>
              <ul className="space-y-2">
                {exercise.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start">
                    <span className={`bg-${exercise.accent}-100 text-${exercise.accent}-800 rounded-full p-1 mr-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {exercise.steps ? 'Step-by-Step' : 'Techniques'}
              </h3>
              <ol className="space-y-2">
                {(exercise.steps || exercise.techniques).map((step, i) => (
                  <li key={i} className="flex">
                    <span className={`bg-${exercise.accent}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 flex-shrink-0`}>
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <button className={`mt-8 w-full bg-${exercise.accent}-500 hover:bg-${exercise.accent}-600 text-white py-3 px-6 rounded-lg font-medium transition-colors`}>
            Start Guided Session
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mental Wellness Toolkit</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Evidence-based practices to manage stress, anxiety, and improve emotional wellbeing
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseCategories.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
        
        {expandedView && activeExercise && (
          <ExerciseDetail 
            exercise={activeExercise} 
            onClose={() => {
              setExpandedView(false);
              setActiveExercise(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default Exercise;