'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTrophy, FaMedal, FaChartLine, FaStar, FaFire, FaBrain, FaCertificate, FaLightbulb, FaGem, FaCrown, FaHeart, FaShieldAlt, FaBolt, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import Layout from '../../components/Layout';
import { Radar } from 'react-chartjs-2';
import { useWeb3Auth } from '../../context/Web3AuthContext';

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
import { Web3AuthProvider } from '../../components/Web3AuthProvider';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CHARACTER_CLASSES = {
  INNOVATOR: {
    name: 'Tech Innovator',
    icon: '💡',
    stats: { creativity: 80, technical: 60, leadership: 40 }
  },
  ARCHITECT: {
    name: 'Solution Architect',
    icon: '🏗️',
    stats: { technical: 80, planning: 70, leadership: 50 }
  },
  SPECIALIST: {
    name: 'Tech Specialist',
    icon: '⚡',
    stats: { technical: 85, creativity: 45, planning: 70 }
  }
};

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState('');
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [selectedCharacterClass, setSelectedCharacterClass] = useState('INNOVATOR');
  const [showInventory, setShowInventory] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const controls = useAnimation();
  const characterRef = useRef(null);
  const { login, isLoading, user,initt,provider,tokenclaim, web3auth, getAccounts, sendTransaction, ownerAddCertificate, getCertificate, claimToken, balanceToken } = useWeb3Auth();
  const [certificate, setCertificate] = useState([]);
  const [claiming, setClaiming] = useState(false);

  const handleClaimToken = async () => {
    if (claiming) return;
    try {
      setClaiming(true);
      await claimToken();
      // You might want to refresh the token balance in the header
      // This will happen automatically due to the useEffect in Layout
    } catch (error) {
      console.error('Error claiming tokens:', error);
    } finally {
      setClaiming(false);
    }
  };

  // Enhanced user stats with RPG elements
  const userStats = {
    level: 12,
    proficiency: 100,
    focus: 80,
    energy: 90,
    class: CHARACTER_CLASSES[selectedCharacterClass],
    attributes: {
      technical: 15,
      creativity: 12,
      planning: 18,
      communication: 14,
      leadership: 10
    },
    skills: {
      problemSolving: 75,
      systemDesign: 60,
      dataStructures: 45,
      algorithms: 80,
      teamwork: 65,
      projectManagement: 70
    },
    inventory: [
      { id: 1, name: 'Focus Boost', icon: '🎯', quantity: 3, rarity: 'rare' },
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

  const downloadCertificate = async (cert) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 800;

      // Create a new image object
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = '/certificate-template.png'; // Make sure this image exists in your public folder
      });

      // Draw the background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Set up certificate text
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'center';

      // Draw user email
      ctx.font = 'bold 50px Arial';
      ctx.fillText(user?.email || 'Student', canvas.width / 2, 400);

      // Draw completion text
      ctx.font = '30px Arial';
      ctx.fillText('has successfully completed the course', canvas.width / 2, 460);

      // Draw course name
      ctx.font = 'bold 40px Arial';
      ctx.fillText(cert['0'], canvas.width / 2, 520);

      // Draw date
      ctx.font = '30px Arial';
      const date = new Date(Number(cert['2'].toString()) * 1000);
      ctx.fillText(`Issued on ${date.toLocaleDateString()}`, canvas.width / 2, 600);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cert['0']}_Certificate.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  useEffect(()=>{
    if(user){
      const fetchCertificate = async () => {
        const cert = await getCertificate();
        console.log(cert);
        setCertificate(cert);
      }

      fetchCertificate();}
  },[initt,provider])
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
    const current = userStats.proficiency;
    const total = 100;
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
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {userStats.level}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <FaCrown className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userEmail || 'Skilled Developer'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{CHARACTER_CLASSES[selectedCharacterClass].name}</p>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 mb-8">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-90"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaTrophy className="text-yellow-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Top 1%</h3>
                    <p className="text-sm text-white/80">Among Learners</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{userStats.proficiency}%</div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.proficiency}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaBolt className="text-yellow-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fast Track</h3>
                    <p className="text-sm text-white/80">Learning Speed</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{userStats.focus}%</div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.focus}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaFire className="text-yellow-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Streak Master</h3>
                    <p className="text-sm text-white/80">30 Day Streak</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{userStats.energy}%</div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.energy}%` }}
                />
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
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <FaCertificate className="text-yellow-500" />
                Achievement Collection
              </h3>
              <button
                onClick={handleClaimToken}
                disabled={claiming}
                className={`relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg
                  hover:shadow-xl transform hover:scale-105 transition-all duration-200
                  ${claiming ? 'opacity-75 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-purple-500'}`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <div className="absolute -inset-full group-hover:inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] transition-all duration-500"></div>
                <div className="relative flex items-center gap-2">
                  {claiming ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">✨</span>
                      <span>Claim Learning Points</span>
                      <span className="text-2xl">🏆</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl"></div>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {certificate && certificate.map((cert, index) => (
                <motion.div
                  key={index}
                  className="group relative cursor-pointer"
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => downloadCertificate(cert)}
                >
                  {/* Card Container */}
                  <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-xl h-[450px] border border-gray-200 dark:border-gray-700">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent opacity-10 animate-shimmer" />
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        backgroundSize: '30px 30px'
                      }} />
                    </div>

                    {/* Card Content */}
                    <div className="relative h-full flex flex-col p-6">
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg">
                            Certificate
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {new Date(Number(cert['2'].toString()) * 1000).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Certificate Icon - Fixed Height */}
                      <div className="flex-grow flex items-center justify-center py-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl opacity-20 blur-xl animate-pulse" />
                          <div className="relative w-64 h-40 flex items-center justify-center">
                            <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                              {cert['0']}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="mt-auto">
                        <div className="text-center text-gray-600 dark:text-gray-400">
                          <p className="text-sm flex items-center justify-center gap-2">
                            <FaDownload className="text-sm" />
                            Click to download certificate
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
