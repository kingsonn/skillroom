'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FaTrophy, FaRocket, FaChartLine, FaStar, FaFire, FaMedal, FaCrown } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { langflowClient } from '../utils/langflow-client';

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

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const supabase = createClientComponentClient();

  const currentLevel = Math.floor(Math.random() * 10) + 1;
  const xpPoints = Math.floor(Math.random() * 1000);
  const xpProgress = (xpPoints % 100) / 100 * 100;

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
        setShowLevelUp(true);
      }
    } catch (error) {
      console.error('Error updating skill paths:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {showLevelUp && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-8 text-center transform animate-bounce">
              <FaCrown className="text-6xl text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
              <p className="text-xl">You've reached Level {currentLevel}!</p>
              <button 
                onClick={() => setShowLevelUp(false)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Claim Rewards
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-lg">
                <FaCrown className="text-3xl text-yellow-300" />
              </div>
              <h1 className="text-4xl font-bold">
                {userData ? `Welcome back, ${userData.username}! 🎮` : 'Welcome to SkillRoom! 🚀'}
              </h1>
            </div>
            <p className="text-xl mb-8">
              Your epic learning journey continues! Ready to level up your skills?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 transform hover:scale-105 transition-transform">
                <div className="font-semibold">Current Level</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  Level {currentLevel}
                  <FaMedal className="text-yellow-300" />
                </div>
                <div className="mt-2 bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-yellow-300 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 transform hover:scale-105 transition-transform">
                <div className="font-semibold">XP Points</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {xpPoints} XP
                  <FaStar className="text-yellow-300" />
                </div>
                <div className="text-sm mt-2">+100 XP today</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 transform hover:scale-105 transition-transform">
                <div className="font-semibold">Learning Streak</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  3 Days
                  <FaFire className="text-orange-400" />
                </div>
                <div className="text-sm mt-2">Keep it up! 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Skills Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className="text-2xl text-purple-600" />
            <h2 className="text-2xl font-bold">Trending Skills Quest Board</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSkills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-transparent text-white px-4 py-1 text-sm">
                  {skill.growth}
                </div>
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                  {skill.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{skill.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    XP to unlock: {skill.xpToUnlock}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.rewards.map((reward, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleStartQuest(skill)}
                >
                  Start Quest
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FaTrophy className="text-2xl text-yellow-500" />
            <h2 className="text-2xl font-bold">Your Achievements</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl text-center transform hover:scale-105 transition-all cursor-pointer ${
                  achievement.completed
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-sm font-medium">{achievement.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Quests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all">
            <FaTrophy className="text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Daily Quest</h3>
            <p>Complete 3 lessons today</p>
            <div className="mt-2 bg-white/30 rounded-full h-2">
              <div className="bg-yellow-300 h-full rounded-full" style={{ width: '66%' }}></div>
            </div>
            <div className="mt-2 text-sm">Reward: 100 XP</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all">
            <FaRocket className="text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Weekly Challenge</h3>
            <p>Maintain 7-day streak</p>
            <div className="mt-2 bg-white/30 rounded-full h-2">
              <div className="bg-yellow-300 h-full rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="mt-2 text-sm">Reward: Streak Master Badge</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white transform hover:scale-105 transition-all">
            <FaChartLine className="text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Special Event</h3>
            <p>Hackathon Challenge</p>
            <div className="mt-2 text-sm">Starts in 2 days</div>
            <button className="mt-4 bg-white/20 text-white rounded-lg px-4 py-2 w-full hover:bg-white/30 transition-colors">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
