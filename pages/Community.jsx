import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Smile, Frown, Meh, Angry, Plus, X, Search } from "lucide-react";
import { db } from '../context/firebase/firebase';
import { 
  collection, addDoc, getDocs, query, orderBy, 
  doc, updateDoc, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Sample posts data
const defaultPosts = [
  {
    id: 1,
    username: "HappyThoughts",
    anonymous: false,
    mood: "happy",
    content: "Today I managed to get out of bed and take a short walk. It wasn't easy, but the sunshine felt nice on my skin. Small victories matter.",
    tags: ["#PositiveVibes"],
    likes: 24,
    comments: 5,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    username: "Anonymous",
    anonymous: true,
    mood: "sad",
    content: "Having a really tough day. Feeling isolated even though I'm surrounded by people. Does anyone else feel like they're pretending to be okay all the time?",
    tags: ["#NeedSupport"],
    likes: 42,
    comments: 12,
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    username: "ProgressNotPerfection",
    anonymous: false,
    mood: "neutral",
    content: "Remember to be kind to yourself today. You don't have to be productive every moment. Rest is not laziness - it's an essential part of healing.",
    tags: ["#SelfCare"],
    likes: 87,
    comments: 23,
    timestamp: "1 day ago"
  },
  {
    id: 4,
    username: "MindfulWalker",
    anonymous: false,
    mood: "happy",
    content: "Did 10 minutes of meditation today. My mind kept wandering but I gently brought it back each time. Progress, not perfection!",
    tags: ["#Meditation", "#Mindfulness"],
    likes: 36,
    comments: 8,
    timestamp: "3 hours ago"
  },
  {
    id: 5,
    username: "Anonymous",
    anonymous: true,
    mood: "angry",
    content: "Why is it so hard to ask for help? I know I need it but every time I try to reach out, I freeze up.",
    tags: ["#Struggling"],
    likes: 58,
    comments: 15,
    timestamp: "7 hours ago"
  },
  {
    id: 6,
    username: "SunshineSeeker",
    anonymous: false,
    mood: "happy",
    content: "Made myself a healthy breakfast today instead of skipping meals. Celebrating the small wins!",
    tags: ["#SelfCare", "#Progress"],
    likes: 64,
    comments: 10,
    timestamp: "4 hours ago"
  }
];

// Inspirational quotes
const quotes = [
  "You are stronger than you think.",
  "Progress, not perfection.",
  "Healing is not linear.",
  "Your feelings are valid.",
  "Small steps still move you forward.",
  "It's okay to not be okay.",
  "You are not alone in this.",
  "Self-care is how you take your power back."
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();

  // Format timestamp helper
  const formatTimestamp = (date) => {
    if (!date) return "Just now";
    
    // Handle Firestore Timestamp
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    
    const now = new Date();
    const diff = now - jsDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Load posts
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const postsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          const commentsRef = collection(db, `posts/${doc.id}/comments`);
          const commentsSnapshot = await getDocs(commentsRef);
          
          return {
            id: doc.id,
            ...postData,
            timestamp: formatTimestamp(postData.timestamp),
            comments: commentsSnapshot.docs.length,
            tags: postData.tags || []
          };
        }));
        setPosts(postsData);
      } else {
        const shuffledPosts = [...defaultPosts].sort(() => 0.5 - Math.random());
        setPosts(shuffledPosts.map(post => ({
          ...post,
          tags: post.tags || []
        })));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      const shuffledPosts = [...defaultPosts].sort(() => 0.5 - Math.random());
      setPosts(shuffledPosts.map(post => ({
        ...post,
        tags: post.tags || []
      })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle post submission
  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !isLoggedIn) return;
    
    try {
      const postData = {
        username: postAnonymously ? "Anonymous" : (currentUser.displayName || "User"),
        anonymous: postAnonymously,
        mood: selectedMood,
        content: newPostContent,
        title: newPostTitle,
        tags: newPostTags.split(" ").filter(tag => tag.startsWith("#")),
        likes: 0,
        timestamp: serverTimestamp(),
        userId: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      const newPost = {
        id: docRef.id,
        ...postData,
        timestamp: "Just now",
        comments: 0,
        tags: postData.tags || []
      };
      
      setPosts([newPost, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags("");
      setSelectedMood("neutral");
      setPostAnonymously(false);
      setShowCreatePost(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Handle like toggle
  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ));
    } else {
      newLikedPosts.add(postId);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    }
    setLikedPosts(newLikedPosts);
  };

  // Toggle comments
  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }));
      return;
    }

    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    try {
      const commentsRef = collection(db, `posts/${postId}/comments`);
      const q = query(commentsRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: formatTimestamp(doc.data().timestamp)
      }));
      
      setComments(prev => ({
        ...prev,
        [postId]: commentsData
      }));
      
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId) => {
    if (!newComment.trim() || !isLoggedIn) return;

    try {
      const commentData = {
        userId: currentUser.uid,
        username: currentUser.displayName || "User",
        content: newComment,
        timestamp: serverTimestamp()
      };

      const commentsRef = collection(db, `posts/${postId}/comments`);
      const docRef = await addDoc(commentsRef, commentData);

      setComments(prev => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          {
            id: docRef.id,
            ...commentData,
            timestamp: "Just now"
          }
        ]
      }));

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: (post.comments || 0) + 1 } 
          : post
      ));

      if (!expandedComments[postId]) {
        setExpandedComments(prev => ({ ...prev, [postId]: true }));
      }

      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const getMoodIcon = (mood) => {
    switch(mood) {
      case "happy": return <Smile className="h-5 w-5 text-green-500" />;
      case "neutral": return <Meh className="h-5 w-5 text-yellow-500" />;
      case "sad": return <Frown className="h-5 w-5 text-blue-500" />;
      case "angry": return <Angry className="h-5 w-5 text-red-500" />;
      default: return <Meh className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMoodColor = (mood) => {
    switch(mood) {
      case "happy": return "bg-green-50 border-green-200";
      case "neutral": return "bg-yellow-50 border-yellow-200";
      case "sad": return "bg-blue-50 border-blue-200";
      case "angry": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  // Filter posts based on search
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Top Bar */}
      <div className="w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Support Community
                </h1>
                <p className="text-sm text-gray-500">Share your journey</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-2xl shadow-lg">
            <div className="bg-white p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Welcome to our Community
              </h2>
              <p className="text-gray-600">Share your thoughts, connect with others, and support each other on this journey.</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Posts */}
          {!isLoading && filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 ${getMoodColor(post.mood)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border">
                    {getMoodIcon(post.mood)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{post.username}</h4>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                {post.tags?.length > 0 && (
                  <div className="flex gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{post.title}</h3>
              )}
              
              <p className="text-gray-600 leading-relaxed mb-4">{post.content}</p>
              
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    likedPosts.has(post.id) 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
              </div>
              
              {/* Comments Section */}
              {expandedComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {loadingComments[post.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-500">Loading comments...</span>
                    </div>
                  ) : (
                    <>
                      {comments[post.id]?.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {comments[post.id].map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border"></div>
                              <div className="flex-1">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.username}</span>
                                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No comments yet</div>
                      )}
                    </>
                  )}
                  
                  {/* Comment Input */}
                  {isLoggedIn && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border"></div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                        />
                      </div>
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* No Posts Found */}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found matching your search</p>
            </div>
          )}

          {/* Inspirational Quote */}
          {!isLoading && filteredPosts.length > 0 && (
            <div className="text-center py-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 inline-block shadow-sm">
                <p className="text-gray-600 italic text-lg font-medium">
                  "{quotes[Math.floor(Math.random() * quotes.length)]}"
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Create Post Button */}
      {isLoggedIn && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Share Your Thoughts</h2>
              <button 
                onClick={() => setShowCreatePost(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Give your post a title (optional)"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                maxLength={100}
              />
              
              <textarea
                placeholder="Share what's on your mind..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
                rows={6}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
                maxLength={1000}
              />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">How are you feeling?</span>
                  <div className="flex gap-2">
                    {[
                      { mood: "happy", icon: Smile, color: "text-green-500" },
                      { mood: "neutral", icon: Meh, color: "text-yellow-500" },
                      { mood: "sad", icon: Frown, color: "text-blue-500" },
                      { mood: "angry", icon: Angry, color: "text-red-500" }
                    ].map(({ mood, icon: Icon, color }) => (
                      <button 
                        key={mood}
                        type="button"
                        className={`p-2 rounded-xl transition-colors ${
                          selectedMood === mood 
                            ? 'bg-gray-200 ' + color 
                            : 'hover:bg-gray-100 text-gray-400'
                        }`}
                        onClick={() => setSelectedMood(mood)}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Add tags like #SelfCare #Support"
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  maxLength={50}
                />
                
                <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-200" 
                    checked={postAnonymously}
                    onChange={(e) => setPostAnonymously(e.target.checked)}
                  />
                  Post Anonymously
                </label>
              </div>
              
              <button
                type="button"
                onClick={handlePostSubmit}
                disabled={!newPostContent.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share with Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}