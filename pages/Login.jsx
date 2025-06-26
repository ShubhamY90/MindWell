import { useState } from 'react';
import { 
  googleProvider,
  createUserWithEmail as createUser,
  signInWithEmail as signIn,
  signInWithGoogle
} from '../context/firebase/firebase';
import { auth, db } from '../context/firebase/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // For navigation

import { User, Brain, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleSignUp = async (email, password, name) => {
    try {
      const userCredential = await createUser(email, password); // Use the exported function
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        userId: userCredential.user.uid,
        //createdAt: new Date(),
        //lastLogin: new Date(),
        provider: "email"
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password); // Use the exported function
      navigate('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle(); // Use the exported function
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          userId: user.uid,
          //photoURL: user.photoURL,
          createdAt: new Date(),
          lastLogin: new Date(),
          provider: "google"
        });
      } else {
        await updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date()
        });
      }
      
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (isSignUp) {
        if (!name) {
          throw new Error('Please enter your name');
        }
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await handleSignUp(email, password, name);
      } else {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await signIn(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate(); // Initialize navigate function


  return (
    <div className="w-screen min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-auto py-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
        {/* Floating Orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-200/40 to-indigo-300/40 blur-3xl animate-float"
          style={{
            left: '10%',
            top: '20%',
            animation: 'float 8s ease-in-out infinite 0s'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-3xl animate-float"
          style={{
            right: '15%',
            bottom: '25%',
            animation: 'float 10s ease-in-out infinite 2s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-teal-200/25 to-cyan-200/25 blur-3xl animate-float"
          style={{
            left: '60%',
            top: '10%',
            animation: 'float 12s ease-in-out infinite 4s'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse-slow" />
        
        {/* Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-twinkle shadow-sm"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/3 w-8 h-8 border border-indigo-200/60 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-gradient-to-r from-purple-300/50 to-pink-300/50 rounded-full animate-bounce-slow" />
        <div className="absolute top-1/2 left-1/5 w-4 h-12 bg-gradient-to-b from-blue-300/40 to-transparent rounded-full animate-sway" />
      </div>

      <div className="w-full max-w-lg relative z-10 mx-4">
        {/* Main Login Card */}
        <div 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-indigo-200/50 animate-bounce-slow"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0px) scale(1)',
            boxShadow: isHovered ? '0 32px 64px -12px rgba(99, 102, 241, 0.2)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            animation: 'bounce-slow 6s ease-in-out infinite'
          }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-purple-100/30 animate-pulse-slow" />
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 text-center border-b border-indigo-100/50">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse-slow" />
                <div className="relative bg-gradient-to-r from-white to-indigo-50 p-4 rounded-2xl border border-indigo-200/80 shadow-lg">
                  <Brain className="h-10 w-10 text-indigo-600 animate-pulse" />
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute -inset-8 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-indigo-400 rounded-full transform -translate-x-1/2 animate-pulse" />
                  <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <h1 className="text-2xl font-light text-gray-800 mb-2 tracking-wide">
                {isForgotPassword ? 'Account Recovery' : isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-indigo-600/80 text-sm tracking-wider font-medium">
                {isForgotPassword ? 'Restore access to your account' : 
                 isSignUp ? 'Get started with your futuristic workspace' : 'Sign in to your futuristic workspace'}
              </p>
              
              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -right-8 h-4 w-4 text-indigo-400/60 animate-twinkle" />
              <Sparkles className="absolute -bottom-2 -left-6 h-3 w-3 text-purple-400/60 animate-twinkle" style={{ animationDelay: '1s' }} />
              <Sparkles className="absolute top-1/2 -right-4 h-2 w-2 text-pink-400/60 animate-twinkle" style={{ animationDelay: '2s' }} />
            </div>
          </div>
          
          {/* Form Area */}
          <div className="p-6 relative">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm backdrop-blur-sm animate-slide-in shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {error}
                </div>
              </div>
            )}
            
            {resetSent ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
                    <h3 className="font-medium mb-2">Reset Link Sent Successfully</h3>
                    <p className="text-sm text-green-600">Please check your email for further instructions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300 hover:glow-text"
                >
                  Return to Sign In
                </button>
              </div>
            ) : isForgotPassword ? (
              <div className="space-y-6 animate-slide-in">
                <div className="space-y-3">