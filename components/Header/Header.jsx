import { useState, useEffect } from 'react';
import { BrainCircuit, Stars, Atom, Satellite, ShieldHalf, LogIn, LogOut, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../../context/firebase/firebase";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth(app);

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
      window.location.href = '/auth';
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      id="header"
      role="banner"
      className="w-full bg-gradient-to-r from-gray-800 via-purple-800/90 to-indigo-800/90 backdrop-blur-lg border-b border-indigo-400/30 shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-8xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Branding */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"
              >
                <BrainCircuit className="h-6 w-6 text-white" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent tracking-tight"
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
              <motion.div whileHover={{ y: -2 }}>
                <Link 
                  to="#dashboard" 
                  className="flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-white transition-colors"
                >
                  <Stars className="h-4 w-4" />
                  <span>24/7 Chat</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ y: -2 }}>
                <Link 
                  to="#therapies"
                  className="flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-white transition-colors"
                >
                  <Atom className="h-4 w-4" />
                  <span>Mood Tracker</span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ y: -2 }}>
                <Link 
                  to="/community"
                  className="flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-white transition-colors"
                >
                  <Satellite className="h-4 w-4" />
                  <span>Hive Network</span>
                </Link>
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-full shadow-lg hover:shadow-indigo-500/40 transition-all"
              >
                <ShieldHalf className="h-4 w-4" />
                <span>Security</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm rounded-full shadow-lg hover:shadow-pink-500/40 transition-all"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-full shadow-lg hover:shadow-cyan-500/40 transition-all"
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
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>
    </motion.header>
  );
};