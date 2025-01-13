'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { simulations, getSimulationById, calculateUserLevel } from '@/lib/simulation';
import SimulationBrief from '@/components/simulation/SimulationBrief';
import SimulationResources from '@/components/simulation/SimulationResources';
import SimulationStrategy from '@/components/simulation/SimulationStrategy';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function JobSimulationPage() {
  const router = useRouter();
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [activeSection, setActiveSection] = useState('brief');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const supabase = createClientComponentClient();
  const fetchUserData = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('simulation')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      return data.simulation;
    } catch (error) {
      console.error('Error:', error);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const userData1 = await fetchUserData();
      if (userData1) {
        setUserData(userData1);
      }
    };

    initializeData();
  }, []);

  const startSimulation = (simulation) => {
    setCurrentSimulation(simulation);
    if (simulation) {
      const timeLimit = 7200; // 2 hours in seconds
      setTimeRemaining(timeLimit);
    }
  };

  const completeTask = (taskId) => {
    // Handle task completion
    console.log('Task completed:', taskId);
    router.push('/learning');
  };
  console.log('Current simulation:', currentSimulation);
  const renderContent = () => {
    if (!currentSimulation) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="text-3xl md:text-4xl mr-3">🎯</span>
                Choose Your Mission
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Select a challenge to test your skills and earn rewards</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-600/30 dark:to-purple-600/30 backdrop-blur-sm px-6 py-3 rounded-xl text-blue-700 dark:text-blue-300 flex items-center shadow-lg hover:shadow-blue-500/20 transition-all">
                <span className="text-2xl mr-2">✨</span>
                <span className="font-semibold">Level {userLevel}</span>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-600/30 dark:to-pink-600/30 backdrop-blur-sm px-6 py-3 rounded-xl text-purple-700 dark:text-purple-300 flex items-center shadow-lg hover:shadow-purple-500/20 transition-all">
                <span className="text-2xl mr-2">🏆</span>
                <span className="font-semibold">{userXp} XP</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading simulations...</p>
              </div>
            ) : userData.map((simulation, index) => (
              console.log(userData),
              <motion.div
                key={simulation.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 `}
              >
               
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{simulation.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{simulation.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        XP: 500
                      </span>
                      {simulation.status === 'completed' && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded text-sm">
                          Completed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => startSimulation(simulation)}
                      disabled={simulation.status === 'locked'}
                      className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                        simulation.status === 'locked'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {simulation.status === 'completed' ? 'Retry' : 'Start'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
// SELECTED SIMULATION
    return (
      <div className="container mx-auto">
        <button
          onClick={() => setCurrentSimulation(null)}
          className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Missions
        </button>

       

        <nav className="mb-8">
          <ul className="flex space-x-4 overflow-x-auto pb-4">
            {['brief', 'resources', 'strategy'].map((section) => (
              <li key={section}>
                <button
                  onClick={() => setActiveSection(section)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeSection === section
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-xl p-6">
            {activeSection === 'brief' && (
              <SimulationBrief
                brief={currentSimulation.brief}
                level={userLevel}
                task={currentSimulation.task}
              />
            )}
            {activeSection === 'resources' && (
              <SimulationResources
                resources={currentSimulation.resources}
                tool={currentSimulation.brief?.tools}
              />
            )}
            {activeSection === 'strategy' && (
              <SimulationStrategy
                task={currentSimulation.task}
                achievements={userData.achievements?.map(a => ({
                  ...a,
                  unlocked: userAchievements.includes(a.id)
                })) || []}
                timeRemaining={timeRemaining}
                onComplete={() => completeTask(userData.name)}
                mission={currentSimulation.name}
                simulation={currentSimulation}
              />
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        {renderContent()}
      </div>
    </Layout>
  );
}
