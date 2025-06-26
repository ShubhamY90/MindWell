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
  const handleCommentSubmit = async (postI