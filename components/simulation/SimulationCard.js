'use client';

import { motion } from "framer-motion";
import { FiBriefcase, FiClock, FiStar, FiPlay } from 'react-icons/fi';

export default function SimulationCard({ simulation, onStart }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg mr-3">
              <FiBriefcase className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{simulation.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              +{simulation.xpReward} XP
            </span>
            <div className={`w-2 h-2 rounded-full ${
              simulation.difficulty === 'Beginner' ? 'bg-green-500' :
              simulation.difficulty === 'Intermediate' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">{simulation.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-lg mr-2">
                <FiClock className="text-sm" />
              </div>
              <span className="text-sm">{simulation.duration}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <div className="bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-lg mr-2">
                <FiStar className="text-yellow-500 text-sm" />
              </div>
              <span className="text-sm">{simulation.difficulty}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {simulation.skills.map((skill, index) => (
              <span 
                key={index}
                className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${simulation.progress}%` }}
              />
            </div>
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{simulation.progress}%</span>
          </div>
          <button
            onClick={() => onStart(simulation.id)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50"
          >
            <FiPlay className="mr-2" />
            {simulation.progress > 0 ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
