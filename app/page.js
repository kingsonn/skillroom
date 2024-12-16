'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FaTrophy, FaRocket, FaChartLine, FaStar, FaFire, FaMedal, FaCrown, FaBolt, FaUserNinja, FaLock, FaArrowRight } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { langflowClient } from '../utils/langflow-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { SignInModal } from '../components/SignInModal';

const trendingSkills = [
  {
    id: 1,
    name: 'Digital Marketing',
    description: 'Drive growth through digital channels',
    growth: '+40% YoY',
    category: 'Marketing',
    level: 'Beginner',
    icon: '🚀',
    xpToUnlock: 500,
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
    xpToUnlock: 1000,
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
    xpToUnlock: 800,
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
    xpToUnlock: 750,
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('skill_paths, progress, level, current_xp, achievements')
          .eq('email', userEmail)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
    }
  };

  return (
    <Layout>
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
                    <button 
                      onClick={() => setIsSignInModalOpen(true)}
                      className="inline-flex items-center px-8 py-3 text-base font-semibold rounded-full bg-white hover:bg-gray-50 text-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Sign In
                    </button>
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Skills Section */}
        <div className="md:col-span-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaBolt className="mr-2 text-yellow-400" /> 
            {isLoggedIn ? 'Your Learning Journey' : 'Available Skills'}
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
                  className={`bg-white p-6 rounded-xl shadow-lg border transition-all ${
                    isStarted ? 'border-purple-300' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-3xl mb-2">{skill.icon}</span>
                      <h3 className="text-xl font-bold mt-2">{skill.name}</h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-green-500 font-semibold">{skill.growth}</span>
                      {isStarted && (
                        <span className="text-xs text-purple-500 mt-1">In Progress</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{skill.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          isStarted ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  {!isStarted && (
                    <div className="mt-4 text-sm text-gray-500">
                      <FaUserNinja className="inline mr-1" />
                      {skill.xpToUnlock} XP to unlock
                    </div>
                  )}
                  <button
                    onClick={() => handleStartQuest(skill)}
                    disabled={!isStarted && xpPoints < skill.xpToUnlock}
                    className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all
                      ${isStarted
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : xpPoints >= skill.xpToUnlock
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isStarted ? 'Continue Learning' : 'Start Quest'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Daily Challenges Section */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaFire className="mr-2 text-orange-500" /> Daily Challenges
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dailyChallenges.map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <FaBolt className="text-purple-500" />
                      </div>
                      <span className="font-medium text-gray-700">{challenge.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-500">+{challenge.xp} XP</span>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topLearners.map((learner) => (
                  <div 
                    key={learner.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{learner.badge}</span>
                      <div>
                        <span className="font-medium text-gray-700">{learner.name}</span>
                        <div className="text-sm text-gray-500">{learner.xp} XP</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Achievements */}
        <div className="md:col-span-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaTrophy className="mr-2 text-yellow-400" /> 
            {isLoggedIn ? 'Your Achievements' : 'Achievements to Earn'}
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 sticky top-4">
            {isLoggedIn ? (
              // Logged in user achievements
              userAchievements.length > 0 ? (
                userAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
                      <span className="text-2xl">{achievement.icon || '🏆'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">Earned on {achievement.earnedDate || 'Recently'}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaTrophy className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No achievements yet</p>
                  <p className="text-sm mt-2">Complete quests to earn achievements!</p>
                </div>
              )
            ) : (
              // Sample achievements for non-logged in users
              <div className="space-y-4">
                {sampleAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm relative">
                      <span className="text-2xl filter grayscale group-hover:filter-none transition-all">
                        {achievement.icon}
                      </span>
                      <div className="absolute inset-0 bg-gray-200/50 rounded-lg group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="relative">
                      <h3 className="font-semibold text-gray-800">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaLock className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
                <div className="text-center pt-4">
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <span>Sign up to start earning</span>
                    <FaArrowRight className="text-sm" />
                  </Link>
                </div>
              </div>
            )}
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
            <div className="bg-white p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold mb-4">🎉 Level Up!</h2>
              <p>You've reached Level {currentLevel + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
    </Layout>
  );
}
