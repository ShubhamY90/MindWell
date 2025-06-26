import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Stars, Satellite, Atom, ShieldHalf, UserCog, Rocket, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export const Header = () => {
  // Added authentication state and functions
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      signOut(auth);
    } else {
      // Replace with your login logic
      window.location.href = '/login';
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      id="header"
      role="banner"
      className="w-full bg-gradient-to-r from-gray-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-lg border-b border-indigo-500/20 shadow-xl sticky top-0 z-50"
    >
      <div className="max-w-8xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Branding - Now clickable */}
          <Link to="/">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"
              >
                <BrainCircuit className="h-6 w-6 text-white" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight"
              >
                NeuroSync
              </motion.h1>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex items-center gap-6"
            >
              <Link to="#dashboard">
                <motion.a 
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                >
                  <Stars className="h-4 w-4" />
                  <span>24/7 Chat</span>
                </motion.a>
              </Link>
              
              <Link to="#therapies">
                <motion.a 
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                >
                  <Atom className="h-4 w-4" />
                  <span>Mood Tracker</span>
                </motion.a>
              </Link>
              
              <Link to="/community">
                <motion.a 
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                >
                  <Satellite className="h-4 w-4" />
                  <span>Hive Network</span>
                </motion.a>
              </Link>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                <ShieldHalf className="h-4 w-4" />
                <span>Security</span>
              </motion.button>
              
              {/* Login/Logout Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm rounded-full shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                {isLoggedIn ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <Rocket className="h-4 w-4" />
                <span>Launch</span>
              </motion.button>
            </div>
          </nav>
        </div>
      </div>

      {/* Animated Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>
    </motion.header>
  );
};