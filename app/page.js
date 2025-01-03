'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FaTrophy, FaRocket, FaChartLine, FaStar, FaFire, FaMedal, FaCrown, FaBolt, FaUserNinja, FaLock, FaArrowRight, FaCheck } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { langflowClient } from '../utils/langflow-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { SignInModal } from '../components/SignInModal';
import { WelcomePopup } from '../components/WelcomePopup';
import { useWeb3Auth } from '../context/Web3AuthContext';

const trendingSkills = [
  {
    id: 1,
    name: 'Digital Marketing',
    description: 'Drive growth through digital channels',
    growth: '+40% YoY',
    category: 'Marketing',
    level: 'Beginner',
    icon: '🚀',
    progress: 25,
    rewards: ['Growth Hacker Badge', 'Analytics Pro']
  },
  {
    id: 2,
    name: 'AI Engineering',
    description: 'Build next-gen AI applications',
    growth: '+55% YoY',
    category: 'Tech',
    level: 'Intermediate',
    icon: '🤖',
    progress: 45,
    rewards: ['AI Pioneer Badge', 'GPT-4 Access']
  },
  {
    id: 3,
    name: 'Data Analytics',
    description: 'Transform data into business insights',
    growth: '+35% YoY',
    category: 'Tech',
    level: 'Beginner to Advanced',
    icon: '📊',
    progress: 65,
    rewards: ['Data Wizard Badge', 'Tableau Pro']
  },
  {
    id: 4,
    name: 'Product Management',
    description: 'Lead product strategy and execution',
    growth: '+32% YoY',
    category: 'Business',
    level: 'Intermediate',
    icon: '💡',
    progress: 85,
    rewards: ['Product Leader Badge', 'Agile Master']
  }
];

const achievements = [
  { name: 'First Quest', icon: <FaStar className="text-yellow-400" />, completed: true },
  { name: 'Skill Master', icon: <FaCrown className="text-yellow-500" />, completed: false },
  { name: 'Speed Learner', icon: <FaRocket className="text-blue-500" />, completed: true },
];

const dailyChallenges = [
  { id: 1, name: "Complete a skill module", xp: 100, completed: false },
  { id: 2, name: "Share your progress", xp: 50, completed: false },
  { id: 3, name: "Help another learner", xp: 75, completed: false },
];

const topLearners = [
  { id: 1, name: "Alex", xp: 2500, badge: "🏆" },
  { id: 2, name: "Sarah", xp: 2300, badge: "🥈" },
  { id: 3, name: "Mike", xp: 2100, badge: "🥉" },
];

const sampleAchievements = [
  { name: 'First Quest', icon: '🎯', description: 'Complete your first learning quest' },
  { name: 'Skill Master', icon: '👑', description: 'Master a complete skill path' },
  { name: 'Speed Learner', icon: '🚀', description: 'Complete 3 lessons in one day' },
  { name: 'Helper', icon: '🤝', description: 'Help other learners in the community' },
  { name: 'Streak Master', icon: '🔥', description: 'Maintain a 7-day learning streak' },
  { name: 'Problem Solver', icon: '💡', description: 'Complete 10 coding challenges' },
];

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [streakData, setStreakData] = useState({ 
    currentStreak: 0, 
    lastLoginDate: null, 
    longestStreak: 0,
    streakDates: [] 
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [hasUserEmail, setHasUserEmail] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { login, isLoading, user, getAccounts, sendTransaction, ownerAddCertificate, getCertificate, claimToken, balanceToken } = useWeb3Auth();
  const handleAccount = async () => {
    const accounts = await getAccounts();
    console.log(accounts);
    // await ownerAddCertificate(accounts,"Digital Marketing","mmmmm");
    // await claimToken();
    await getCertificate();
    // await balanceToken();
  };
  const milestones = [
    { days: 3, title: 'Star', icon: '⭐' },
    { days: 5, title: 'Superstar', icon: '🌟' },
    { days: 7, title: 'Champion', icon: '🏆' },
    { days: 31, title: 'Icon', icon: '🎖️' }
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Fetch user data
    console.log(session)
        if (session?.user?.email) {
// window.location.reload();        
}
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        if (!userEmail) {
          setIsLoggedIn(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*, streaks')
          .eq('email', userEmail)
          .single();

        if (error) throw error;
        setUserData(data);
        
        // Calculate and update streaks
        const today = new Date('2024-12-29T01:29:18+05:30').toISOString().split('T')[0];
        const lastLogin = data?.streaks?.lastLoginDate;
        let currentStreak = data?.streaks?.currentStreak || 0;
        let longestStreak = data?.streaks?.longestStreak || 0;
        let streakDates = data?.streaks?.streakDates || [];

        if (lastLogin) {
          const lastLoginDate = new Date(lastLogin);
          const diffDays = Math.floor((new Date(today) - lastLoginDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak += 1;
            longestStreak = Math.max(currentStreak, longestStreak);
            streakDates.push(today);
          } else if (diffDays > 1) {
            currentStreak = 1;
            streakDates = [today];
          }
        } else {
          currentStreak = 1;
          longestStreak = 1;
          streakDates = [today];
        }

        // Keep only last 30 days of streak dates
        streakDates = streakDates.slice(-30);

        // Update streaks in database
        await supabase
          .from('profiles')
          .update({
            streaks: {
              currentStreak,
              lastLoginDate: today,
              longestStreak,
              streakDates
            }
          })
          .eq('email', userEmail);

        setStreakData({
          currentStreak,
          lastLoginDate: today,
          longestStreak,
          streakDates
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [supabase]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        if (!userEmail) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
        // First, try to get the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('skill_paths, progress, level, current_xp, achievements')
          .eq('email', userEmail)
          .single();

        if (profileError) {
          // If profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                email: userEmail,
                current_xp: 500,
                level: 1,
                skill_paths: [],
                progress: {},
                achievements: []
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          setUserData(newProfile);
        } else {
          setUserData(profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    setHasUserEmail(!!localStorage.getItem('userEmail'));
  }, []);

  const currentLevel = userData?.level || 1;
  const xpPoints = userData?.current_xp || 0;
  const xpProgress = (xpPoints % 1000) / 1000 * 100; // Assuming 1000 XP per level
  const userAchievements = Array.isArray(userData?.achievements) ? userData.achievements : [];

  const handleSkillHover = (skill) => {
    setSelectedSkill(skill);
  };

  const handleLevelUp = () => {
    setShowLevelUp(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowLevelUp(false), 3000);
  };
  
  const handleStartQuest = async (skill) => {
    try {
      setIsGenerating(true);
      console.log('Starting quest for skill:', skill.name);
      const newModules = await langflowClient.generateSkillStructure(skill.name);
      
      console.log('Generated skill structure:', newModules);

      const { data, error } = await supabase
        .from('profiles')
        .select('skill_paths, modules')
        .eq('email', localStorage.getItem('userEmail'))
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
   
      const currentSkills = data?.skill_paths || [];
      const currentModules = data?.modules || [];

      if (!currentSkills.includes(skill.name)) {
        // Combine existing modules with new modules
        const updatedModules = [...currentModules, ...newModules];
        console.log('Updated modules array:', updatedModules);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            skill_paths: [...currentSkills, skill.name],
            modules: updatedModules
          })
          .eq('email', localStorage.getItem('userEmail'));

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
        handleLevelUp();
      }
    } catch (error) {
      console.error('Error updating skill paths:', error);
    } finally {
      router.push('/learning');
      setIsGenerating(false);
    }
  };

  const handleCustomSkillSubmit = async (e) => {
    e.preventDefault();
    if (!customSkill.trim()) return;

    if (!isLoggedIn) {
      setIsSignInModalOpen(true);
      return;
    }
 await handleStartQuest({ name: customSkill });

  // setIsGeneratingCourse(false);
  setCustomSkill('');  

    // setIsGeneratingCourse(true);
    // try {
    //   router.push(`/learning?skill=${encodeURIComponent(customSkill.trim())}`);
    // } catch (error) {
    //   console.error('Error generating course:', error);
    // } finally {
    //   setIsGeneratingCourse(false);
    //   setCustomSkill('');
    // }
  };

  const handleWelcomeClose = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      await supabase
        .from('profiles')
        .update({ first_time: false })
        .eq('email', userEmail);
    } catch (error) {
      console.error('Error updating first time status:', error);
    }

    setShowWelcomePopup(false);
    window.location.reload();
  };

  return (
    <Layout>
      {/* Loading Screen */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generating Your Quest</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we create a personalized learning journey for you...
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-500">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 mb-8 overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {isLoggedIn ? (
            // Logged in user view
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Side - Welcome Text */}
              <div className="flex-1 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                    Welcome Back, Explorer!
                  </h1>
                  <p className="text-lg text-purple-100">
                    Ready to level up your skills today?
                  </p>
                </motion.div>
              </div>

              {/* Right Side - Stats Cards */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {/* Level Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaCrown className="text-xl text-yellow-300" />
                      </div>
                      <span className="text-sm text-purple-200">Level</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">Level {currentLevel}</div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                      />
                    </div>
                    <div className="mt-1 text-xs text-purple-200">
                      {1000 - (xpPoints % 1000)} XP to next level
                    </div>
                  </motion.div>

                  {/* XP Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaStar className="text-xl text-yellow-300" />
                      </div>
                      <span className="text-sm text-purple-200">XP</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {xpPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-200">Experience Points</div>
                  </motion.div>

                  {/* Achievements Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaTrophy className="text-xl text-yellow-300" />
                          <span className="text-2xl font-bold">{userAchievements.length}</span>
                        </div>
                        <div className="text-sm text-purple-200">Achievements</div>
                      </div>
                      <div className="flex gap-2">
                        {userAchievements.length > 0 ? (
                          userAchievements.slice(0, 3).map((achievement, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg"
                              title={achievement.name}
                            >
                              <span className="text-xl">{achievement.icon || '🏆'}</span>
                            </motion.div>
                          ))
                        ) : (
                          <span className="text-sm text-purple-200 italic">
                            Start earning achievements!
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            // Not logged in view
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
              <div className="flex-1 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                    Embark on Your Learning Journey
                  </h1>
                  <p className="text-lg text-purple-100 mb-6">
                    Master new skills through AI-powered personalized learning paths.
                  </p>
                  <div className="flex gap-4">
                 
                  </div>
                </motion.div>
              </div>
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-3 max-w-lg">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                      <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                        <FaRocket className="text-2xl text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-bold mt-3">Hyperpersonalized</h3>
                      <p className="text-sm text-purple-100 mt-1">AI-powered learning path</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                      <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                        <FaTrophy className="text-2xl text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-bold mt-3">Earn Rewards</h3>
                      <p className="text-sm text-purple-100 mt-1">Track your progress</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                      <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                        <FaChartLine className="text-2xl text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-bold mt-3">24/7 AI Coach</h3>
                      <p className="text-sm text-purple-100 mt-1">Personal guidance anytime</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                      <div className="p-2 bg-purple-500/20 rounded-lg w-fit">
                        <FaUserNinja className="text-2xl text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-bold mt-3">Skill Mastery</h3>
                      <p className="text-sm text-purple-100 mt-1">Become an expert</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Content and Right Sidebar Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-8">
            {/* Skills Section */}
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaBolt className="mr-2 text-yellow-400" /> 
              {isLoggedIn ? 'Top trending skills' : 'Available Skills'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingSkills.map((skill) => {
                const isStarted = userData?.skill_paths?.includes(skill.name);
                const progress = userData?.progress?.[skill.name] || 0;
                
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => handleSkillHover(skill)}
                    className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border transition-all ${
                      isStarted ? 'border-purple-300 dark:border-purple-500' : 'border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-2xl mb-2">{skill.icon}</span>
                        <h3 className="text-lg font-semibold mt-2 dark:text-white">{skill.name}</h3>
                        <span className="text-green-500 dark:text-green-400 font-semibold">{skill.growth}</span>
                        {isStarted && (
                          <span className="text-xs text-purple-500 dark:text-purple-400 mt-1">In Progress</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{skill.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            isStarted ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!hasUserEmail) {
                          setIsSignInModalOpen(true);
                          return;
                        }
                        isStarted ? router.push('/learning') : handleStartQuest(skill);
                      }}
                      className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all
                        ${isStarted
                          ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-700'
                          : 'bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-600'
                        } ${!hasUserEmail ? 'opacity-75' : ''}`}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white dark:border-gray-800 rounded-full animate-spin mr-2"></div>
                          Generating Quest...
                        </div>
                      ) : isStarted ? (
                        'Continue Quest'
                      ) : (
                        'Start Quest'
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
            {/* Custom Skill Section */}
            <section className="mb-10 mt-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">Create Your Own Learning Journey</h2>
                    <p className="text-blue-100 text-lg">
                      Want to learn something specific? Enter any skill and get a personalized learning path instantly.
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
                      <FaBolt className="w-12 h-12 text-yellow-300" />
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCustomSkillSubmit} className="mt-8">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Enter any skill (e.g., Python Development, Content Writing, etc.)"
                        className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isGeneratingCourse || !customSkill.trim()}
                      className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isGeneratingCourse ? (
                        <>
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Course</span>
                          <FaArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-sm text-blue-100">Popular searches:</span>
                  {['Web Development', 'Content Marketing', 'UX Design', 'Data Science'].map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setCustomSkill(skill)}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-blue-100 transition-all"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            {/* Daily Challenges Section */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaFire className="mr-2 text-orange-500" /> Daily Challenges
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dailyChallenges.map((challenge) => (
                    <div 
                      key={challenge.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3">
                          <FaBolt className="text-purple-500" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{challenge.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-500 dark:text-purple-400">+{challenge.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Learners Section */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FaCrown className="mr-2 text-yellow-500" /> Top Learners
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topLearners.map((learner) => (
                    <div 
                      key={learner.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{learner.badge}</span>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{learner.name}</span>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{learner.xp} XP</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-4">
            {/* Streak Display */}
            {hasUserEmail && (
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 shadow-lg transform hover:scale-102 transition-all duration-300 border border-purple-400/20">
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="relative w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner">
                      <FaFire className="text-4xl text-yellow-400 animate-pulse" />
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                        <FaCrown className="text-sm text-purple-900" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      1-day streak
                    </h3>
                    <p className="text-purple-200 text-base">
                      Keep going, champion! 🌟
                    </p>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8">
                  <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day, index) => (
                      <div 
                        key={day}
                        className="flex flex-col items-center"
                      >
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 mb-1 ${
                            index === 2 
                              ? 'bg-yellow-400 shadow-lg ring-2 ring-yellow-400/30' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {index === 2 ? (
                            <FaCheck className="text-purple-900 text-sm" />
                          ) : (
                            <span className={`text-xs font-medium ${
                              index === 2 ? 'text-purple-900' : 'text-purple-200'
                            }`}>
                              {day}
                            </span>
                          )}
                        </div>
                        <div className={`text-[9px] font-medium ${
                          index === 2 ? 'text-yellow-400' : 'text-purple-200/70'
                        }`}>
                          {day}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestone Badges */}
                <div className="overflow-x-auto pb-2 -mx-8 px-8 no-scrollbar">
                  <div className="flex gap-3 min-w-max">
                    {milestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className={`relative group overflow-hidden ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                            : 'bg-white/10 hover:bg-white/20'
                        } rounded-lg p-3 transition-all duration-300 flex flex-col items-center justify-center w-[120px] h-[100px]`}
                      >
                        {/* Shine Effect */}
                        <div 
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                            index === 0 
                              ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-45 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000' 
                              : ''
                          }`} 
                        />
                        
                        <div className="relative text-center">
                          <div className={`text-2xl mb-1.5 ${
                            index === 0 ? '' : 'opacity-40'
                          }`}>
                            {milestone.icon}
                          </div>
                          <div className={`text-xs font-bold mb-0.5 ${
                            index === 0 ? 'text-purple-900' : 'text-white'
                          }`}>
                            {milestone.days} days
                          </div>
                          <div className={`text-[10px] ${
                            index === 0 ? 'text-purple-900/70' : 'text-purple-200/70'
                          }`}>
                            {milestone.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <style jsx global>{`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
              </div>
            )}

            {/* Achievements Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-yellow-500 text-xl" />
                  </div>
                  Your Achievements
                </h2>

                <div className="space-y-4">
                  {isLoggedIn ? (
                    userAchievements.length > 0 ? (
                      userAchievements.map((achievement, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            {achievement.icon || <FaMedal />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {achievement.description}
                            </p>
                          </div>
                          <div className="text-green-500">
                            <FaCheck className="text-xl" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                          <FaStar className="text-2xl text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">Complete tasks to earn achievements!</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <FaLock className="text-2xl text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Sign in to view your achievements</p>
                      <button
                        onClick={() => setIsSignInModalOpen(true)}
                        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold mb-4">🎉 Level Up!</h2>
              <p>You've reached Level {currentLevel + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
      {showWelcomePopup && (
        <WelcomePopup
          isOpen={showWelcomePopup}
          onClose={handleWelcomeClose}
        />
      )}
    </Layout>
  );
}
