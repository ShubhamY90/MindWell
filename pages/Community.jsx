import { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Smile, Frown, Meh, Angry, 
  Plus, Search, User, Send, Trash2, Edit, X, Check, 
  Sun, Moon 
} from "lucide-react";
import { 
  getFirestore,
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove,
  where, getDocs, setDoc, getDoc, deleteDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../context/firebase/firebase';
import { loadSlim } from "tsparticles-slim";
import Particles from "../components/Particles.jsx";

const db = getFirestore(app);
const auth = getAuth();

const IncognitoGlasses = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm2 0c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8z"/>
    <path d="M8 10c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
    <path d="M6 8h2v2H6V8zm10 0h2v2h-2V8z"/>
    <rect x="6" y="7" width="12" height="1.5" rx="0.5"/>
  </svg>
);

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  // Set system default mode on initial load
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName || 
                         (user.providerData[0]?.displayName) || 
                         user.email?.split('@')[0] || 
                         "User";
        
        setCurrentUser({
          id: user.uid,
          username: displayName,
          initials: displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  // Load liked posts for current user
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const fetchLikedPosts = async () => {
      const userRef = doc(db, "users", currentUser.id);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        setLikedPosts(docSnap.data().likedPosts || []);
      } else {
        await setDoc(userRef, { likedPosts: [] });
      }
    };
    
    fetchLikedPosts();
  }, [currentUser]);

  // Filter posts based on active tab and search
  useEffect(() => {
    let filtered = [...posts];
    
    if (activeTab === "my-posts") {
      filtered = filtered.filter(post => post.userId === currentUser?.id);
    } else if (activeTab === "liked") {
      filtered = filtered.filter(post => likedPosts.includes(post.id));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, activeTab, searchTerm, likedPosts, currentUser]);

  // Auto-resize textareas
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    if (editTextareaRef.current && editingPostId) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
  }, [newPostContent, editedPostContent, editingPostId]);

  const formatTimestamp = (date) => {
    if (!date?.toDate) return "now";
    const now = new Date();
    const diff = now - date.toDate();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toDate().toLocaleDateString();
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !currentUser) return;
    
    try {
      await addDoc(collection(db, "posts"), {
        username: postAnonymously ? "Anonymous" : currentUser.username,
        userInitials: postAnonymously ? "A" : currentUser.initials,
        anonymous: postAnonymously,
        mood: selectedMood,
        content: newPostContent,
        tags: newPostContent.match(/#\w+/g) || [],
        likes: 0,
        comments: 0,
        timestamp: serverTimestamp(),
        userId: currentUser.id
      });
      
      setNewPostContent("");
      setSelectedMood("neutral");
      setPostAnonymously(false);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    try {
      const postRef = doc(db, "posts", postId);
      const userRef = doc(db, "users", currentUser.id);
      
      if (likedPosts.includes(postId)) {
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes - 1 || 0
        )});
        await updateDoc(userRef, {
          likedPosts: arrayRemove(postId)
        });
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await updateDoc(postRef, {
          likes: (posts.find(p => p.id === postId)?.likes + 1 || 1
        )});
        await updateDoc(userRef, {
          likedPosts: arrayUnion(postId)
        });
        setLikedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  const toggleComments = async (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    if (!comments[postId]) {
      const q = query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsData = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() });
        });
        setComments(prev => ({
          ...prev,
          [postId]: commentsData
        }));
      });
      
      return () => unsubscribe();
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!newComment[postId]?.trim() || !currentUser) return;
    
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.id,
        username: currentUser.username,
        content: newComment[postId],
        timestamp: serverTimestamp()
      });
      
      await updateDoc(doc(db, "posts", postId), {
        comments: (posts.find(p => p.id === postId)?.comments || 0) + 1
      });
      
      setNewComment(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post.id);
    setEditedPostContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedPostContent("");
  };

  const saveEditedPost = async () => {
    if (!editedPostContent.trim() || !editingPostId) return;
    
    try {
      const postRef = doc(db, "posts", editingPostId);
      await updateDoc(postRef, {
        content: editedPostContent,
        tags: editedPostContent.match(/#\w+/g) || []
      });
      setEditingPostId(null);
      setEditedPostContent("");
    } catch (error) {
      console.error("Error updating post: ", error);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnapshot = await getDocs(commentsRef);
        commentsSnapshot.forEach(async (commentDoc) => {
          await deleteDoc(commentDoc.ref);
        });
        
        if (likedPosts.includes(postId)) {
          const userRef = doc(db, "users", currentUser.id);
          await updateDoc(userRef, {
            likedPosts: arrayRemove(postId)
          });
          setLikedPosts(prev => prev.filter(id => id !== postId));
        }
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: <Smile className="h-4 w-4 text-emerald-500" />,
      neutral: <Meh className="h-4 w-4 text-amber-500" />,
      sad: <Frown className="h-4 w-4 text-blue-500" />,
      angry: <Angry className="h-4 w-4 text-red-500" />
    };
    return icons[mood] || icons.neutral;
  };

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesLoaded = async (container) => {
    console.log("Particles container loaded", container);
  };

  // Toggle dark mode manually
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Particles Background - full width with proper z-index */}
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <Particles
          id="tsparticles"
          particleColors={darkMode ? ['#ffffff'] : ['#000000']}
          particleCount={200}
          particleSpread={15}
          speed={0.5}
          particleBaseSize={1.5}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10">
        <div className="flex">
          {/* Sidebar with glass effect */}
          <div className={`w-64 sticky top-16 h-[calc(100vh-4rem)] p-6 border-r ${
            darkMode ? 'border-gray-800 bg-gray-900/80 backdrop-blur-lg' 
            : 'border-gray-200 bg-white/80 backdrop-blur-lg'
          }`}>
            <div className="mb-8">
              <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Community
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect and share your journey
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search posts..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 focus:ring-gray-600 focus:border-gray-600 text-white' 
                    : 'bg-gray-100 border-gray-200 focus:ring-blue-200 focus:border-blue-300 text-gray-900'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              {[
                { key: "all", label: "All Posts", icon: MessageCircle },
                { key: "my-posts", label: "My Posts", icon: User },
                { key: "liked", label: "Liked Posts", icon: Heart }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === key
                      ? darkMode
                        ? 'bg-gray-800 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className={`mt-8 p-4 rounded-xl border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Community Stats
              </h3>
              <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex justify-between">
                  <span>Total Posts</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{posts.length}</span>
                </div>
                {currentUser && (
                  <div className="flex justify-between">
                    <span>Your Posts</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {posts.filter(p => p.userId === currentUser.id).length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              {/* Posts Feed */}
              <div className={`divide-y ${darkMode ? 'divide-gray-800/50' : 'divide-gray-200/50'}`}>
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className={`p-6 transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-sm' 
                        : 'bg-white/30 hover:bg-white/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Profile Picture or Incognito Glasses */}
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold border-2 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-300' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 border-white text-gray-600'
                      }`}>
                        {post.anonymous ? (
                          <IncognitoGlasses className="h-6 w-6 text-gray-500" />
                        ) : (
                          post.userInitials
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {post.username}
                            </span>
                            <span className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>·</span>
                            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {formatTimestamp(post.timestamp)}
                            </span>
                            {getMoodIcon(post.mood)}
                          </div>
                          
                          {/* Edit/Delete buttons */}
                          {currentUser?.id === post.userId && (
                            <div className="flex gap-2">
                              {editingPostId === post.id ? (
                                <>
                                  <button
                                    onClick={cancelEditing}
                                    className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={saveEditedPost}
                                    className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-green-500' : 'text-gray-500 hover:text-green-500'}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditingPost(post)}
                                    className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deletePost(post.id)}
                                    className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {editingPostId === post.id ? (
                          <textarea
                            ref={editTextareaRef}
                            className={`w-full p-3 rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                              darkMode
                                ? 'bg-gray-800 border-gray-700 focus:ring-gray-600 focus:border-gray-600 text-white'
                                : 'bg-gray-50 border-gray-200 focus:ring-blue-200 focus:border-blue-300 text-gray-900'
                            }`}
                            value={editedPostContent}
                            onChange={(e) => setEditedPostContent(e.target.value)}
                            maxLength={500}
                          />
                        ) : (
                          <>
                            <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {post.content}
                            </p>
                            
                            {post.tags?.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {post.tags.map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                                      darkMode
                                        ? 'bg-gray-800 text-blue-400'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="flex items-center gap-6 pt-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                              likedPosts.includes(post.id)
                                ? 'text-red-500'
                                : darkMode
                                  ? 'text-gray-400 hover:text-red-500'
                                  : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                            <span>{post.likes || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => toggleComments(post.id)}
                            className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                              darkMode
                                ? 'text-gray-400 hover:text-blue-500'
                                : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments || 0}</span>
                          </button>
                        </div>
                        
                        {/* Comments Section */}
                        {showComments[post.id] && (
                          <div className={`mt-6 space-y-4 pt-4 border-t ${
                            darkMode ? 'border-gray-800/50' : 'border-gray-200/50'
                          }`}>
                            {/* ... [keep your existing comments section] ... */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPosts.length === 0 && !isLoading && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="text-lg mb-2">No posts found</div>
                  <p className="text-sm">Try adjusting your search or filter settings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Create Post Button */}
      {currentUser && (
        <button
          onClick={() => setShowCreateModal(true)}
          className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 z-50 flex items-center justify-center ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* ... [keep your existing modal code] ... */}
        </div>
      )}
    </div>
  );
}