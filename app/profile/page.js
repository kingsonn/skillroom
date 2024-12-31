'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTrophy, FaMedal, FaChartLine, FaStar, FaFire, FaBrain, FaCertificate, FaLightbulb, FaGem, FaCrown, FaHeart, FaShieldAlt, FaBolt, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import Layout from '../../components/Layout';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { downloadCertificate } from '../../components/CertificateGenerator';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CHARACTER_CLASSES = {
  WARRIOR: {
    name: 'Code Warrior',
    icon: '⚔️',
    stats: { strength: 80, agility: 60, intellect: 40 }
  },
  MAGE: {
    name: 'Tech Mage',
    icon: '🔮',
    stats: { strength: 30, agility: 50, intellect: 90 }
  },
  ROGUE: {
    name: 'Data Rogue',
    icon: '🗡️',
    stats: { strength: 50, agility: 85, intellect: 45 }
  }
};

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState('');
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [selectedCharacterClass, setSelectedCharacterClass] = useState('WARRIOR');
  const [showInventory, setShowInventory] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const controls = useAnimation();
  const characterRef = useRef(null);

  // Enhanced user stats with RPG elements
  const userStats = {
    level: 12,
    experience: 1250,
    nextLevelExp: 1500,
    health: 100,
    mana: 80,
    stamina: 90,
    class: CHARACTER_CLASSES[selectedCharacterClass],
    attributes: {
      strength: 15,
      agility: 12,
      intellect: 18,
      wisdom: 14,
      charisma: 10
    },
    skills: {
      coding: 75,
      debugging: 60,
      architecture: 45,
      algorithms: 80,
      teamwork: 65,
      problemSolving: 70
    },
    inventory: [
      { id: 1, name: 'Debug Potion', icon: '🧪', quantity: 3, rarity: 'rare' },
      { id: 2, name: 'Code Scroll', icon: '📜', quantity: 5, rarity: 'common' },
      { id: 3, name: 'Golden Keyboard', icon: '⌨️', quantity: 1, rarity: 'legendary' }
    ],
    activeQuests: [
      { id: 1, name: 'Debug the Dragon', progress: 60, reward: 'Legendary Debug Tool' },
      { id: 2, name: 'Code Castle Defense', progress: 30, reward: 'Architecture Mastery' },
      { id: 3, name: 'Algorithm Adventure', progress: 85, reward: 'Speed Optimization Rune' }
    ],
    achievements: [
      { id: 1, name: 'Bug Slayer', progress: 80, maxValue: 100, icon: '🐛' },
      { id: 2, name: 'Code Architect', progress: 45, maxValue: 100, icon: '🏰' },
      { id: 3, name: 'Speed Demon', progress: 60, maxValue: 100, icon: '⚡' }
    ],
    certificates: [
      {
        id: 1,
        name: 'Python Master',
        issueDate: '2023-12-15',
        icon: '🐍',
        skills: ['Data Structures', 'Algorithms', 'Web Development'],
        rarity: 'Legendary',
        tokenId: '#0857',
        badgeColor: 'from-emerald-400 to-teal-500'
      },
      {
        id: 2,
        name: 'Frontend Sage',
        issueDate: '2023-11-20',
        icon: '🎨',
        skills: ['React', 'Next.js', 'TailwindCSS'],
        rarity: 'Epic',
        tokenId: '#1337',
        badgeColor: 'from-blue-400 to-indigo-500'
      },
      {
        id: 3,
        name: 'Database Oracle',
        issueDate: '2023-10-10',
        icon: '🗄️',
        skills: ['SQL', 'MongoDB', 'Redis'],
        rarity: 'Mythic',
        tokenId: '#2022',
        badgeColor: 'from-purple-400 to-pink-500'
      }
    ]
  };

  const radarData = {
    labels: Object.keys(userStats.skills),
    datasets: [
      {
        label: 'Skill Mastery',
        data: Object.values(userStats.skills),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#4CAF50',
        borderWidth: 2,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4CAF50'
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(75, 192, 192, 0.3)'
        },
        grid: {
          color: 'rgba(75, 192, 192, 0.3)'
        },
        pointLabels: {
          color: '#333',
          font: {
            size: 12,
            family: 'Press Start 2P'
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#333'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
    // Add character idle animation
    const idleAnimation = setInterval(() => {
      if (characterRef.current) {
        controls.start({
          y: [0, -10, 0],
          transition: {
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity
          }
        });
      }
    }, 2000);

    return () => clearInterval(idleAnimation);
  }, []);

  const calculateProgress = () => {
    const current = userStats.experience - 1000;
    const total = userStats.nextLevelExp - 1000;
    return (current / total) * 100;
  };

  const triggerLevelUpAnimation = () => {
    setShowLevelUpAnimation(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowLevelUpAnimation(false), 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
        {/* Top Banner */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '30px 30px'
              }} />
            </div>
            
            <div className="relative p-8">
              <div className="flex items-center gap-8">
                {/* Character Display */}
                <div className="relative">
                  <motion.div 
                    className="w-32 h-32 relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-20 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-4 border-emerald-400">
                      <span className="text-5xl">{userStats.class.icon}</span>
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-lg">
                      {userStats.level}
                    </div>
                  </motion.div>
                </div>

                {/* User Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold game-font text-gray-800 dark:text-gray-200">
                      {userEmail || 'Player One'}
                    </h1>
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-sm rounded-full font-medium">
                      {userStats.class.name}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="stat-card">
                      <div className="flex items-center gap-2 mb-2">
                        <FaHeart className="text-red-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">HP</span>
                      </div>
                      <div className="stat-bar">
                        <motion.div
                          className="stat-bar-fill bg-red-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${userStats.health}%` }}
                        />
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBolt className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MP</span>
                      </div>
                      <div className="stat-bar">
                        <motion.div
                          className="stat-bar-fill bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${userStats.mana}%` }}
                        />
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="flex items-center gap-2 mb-2">
                        <FaShieldAlt className="text-yellow-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">DEF</span>
                      </div>
                      <div className="stat-bar">
                        <motion.div
                          className="stat-bar-fill bg-yellow-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${userStats.stamina}%` }}
                        />
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-purple-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">EXP</span>
                      </div>
                      <div className="stat-bar">
                        <motion.div
                          className="stat-bar-fill bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress()}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 mb-8">
          {/* Left Column - Stats & Skills */}
          <div className="space-y-6">
            {/* Attributes */}
            <div className="game-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaBrain className="text-emerald-500" />
                Attributes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(userStats.attributes).map(([attr, value]) => (
                  <div key={attr} className="flex items-center gap-2">
                    <span className="capitalize">{attr}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Radar */}
            <div className="game-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaChartLine className="text-cyan-500" />
                Skills
              </h3>
              <div className="aspect-square">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          {/* Right Column - Quests & Achievements */}
          <div className="space-y-6">
            {/* Active Quests */}
            <div className="game-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaGem className="text-purple-500" />
                Active Quests
              </h3>
              <div className="space-y-4">
                {userStats.activeQuests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">{quest.name}</h4>
                      <span className="text-sm text-emerald-500">{quest.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <motion.div
                        className="h-full bg-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Reward: {quest.reward}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="game-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {userStats.achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className="achievement-card"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold">{achievement.name}</h4>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2">
                          <motion.div
                            className="h-full bg-yellow-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {achievement.progress}/{achievement.maxValue}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="max-w-6xl mx-auto">
          <div className="game-card">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800 dark:text-gray-200 game-font">
              <FaCertificate className="text-yellow-500" />
              Achievement Collection
            </h3>
            <div className="grid grid-cols-3 gap-8">
              {userStats.certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  className="group relative cursor-pointer"
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => {
                    console.log('Certificate card clicked', { cert, userEmail });
                    downloadCertificate(cert, userEmail);
                  }}
                >
                  {/* Card Container */}
                  <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-xl h-[450px] border border-gray-200 dark:border-gray-700">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent opacity-10 animate-shimmer" />
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        backgroundSize: '30px 30px'
                      }} />
                    </div>

                    {/* Card Content */}
                    <div className="relative h-full flex flex-col p-6">
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${cert.badgeColor} text-white shadow-lg`}>
                            {cert.rarity}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                            {cert.tokenId}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Certificate Icon - Fixed Height */}
                      <div className="flex-grow flex items-center justify-center py-8">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${cert.badgeColor} rounded-xl opacity-20 blur-xl animate-pulse`} />
                          <div className="relative w-64 h-40">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img 
                                src="/certificate-template.png" 
                                alt="Certificate"
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Certificate Details - Fixed Height */}
                      <div className="h-[140px] flex flex-col">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 game-font text-center leading-relaxed">
                          {cert.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {cert.skills.map((skill, idx) => (
                            <span 
                              key={idx}
                              className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${cert.badgeColor} bg-opacity-20 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        {/* Download Indicator */}
                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                          <FaDownload className="text-sm" />
                          Click to download
                        </div>
                      </div>

                      {/* Bottom Border */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cert.badgeColor}`} />
                    </div>

                    {/* Hover Effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent opacity-10 animate-shine" />
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${cert.badgeColor} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Modal */}
        <AnimatePresence>
          {showInventory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowInventory(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Inventory</h2>
                <div className="grid grid-cols-4 gap-4">
                  {userStats.inventory.map(item => (
                    <motion.div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 ${
                        item.rarity === 'legendary' ? 'border-yellow-400 bg-yellow-50' :
                        item.rarity === 'rare' ? 'border-blue-400 bg-blue-50' :
                        'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Animation */}
        <AnimatePresence>
          {showLevelUpAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: 0,
                  }}
                  className="text-8xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="text-4xl font-bold text-yellow-400 mb-2">Level Up!</h2>
                <p className="text-xl text-white dark:text-gray-200">You've reached Level {userStats.level}!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .stat-card {
          @apply bg-white dark:bg-gray-800;
          border-radius: 0.5rem;
          padding: 0.75rem;
          @apply border border-gray-200 dark:border-gray-700;
        }

        .stat-bar {
          height: 8px;
          @apply bg-gray-100 dark:bg-gray-700;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          transition: width 1s ease-out;
        }

        .game-card {
          @apply bg-white dark:bg-gray-800;
          border-radius: 1rem;
          padding: 1.5rem;
          @apply shadow-lg border border-gray-200 dark:border-gray-700;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background-size: 200% 100%;
        }

        .animate-shine {
          animation: shine 2s linear infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .game-font {
          font-family: 'Press Start 2P', system-ui;
        }
      `}</style>
    </Layout>
  );
}
