'use client';

import { motion } from "framer-motion";

export default function SimulationBrief({ brief, level, task }) {
  console.log(brief);
  if (!brief) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading mission brief...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold shadow-xl border border-white/20">
                {level}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl flex items-center justify-center text-xs font-bold text-blue-900 shadow-lg border border-yellow-200">
                {level < 10 ? level + 1 : 'MAX'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Mission Briefing</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-blue-50 text-lg leading-relaxed">{task}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brief && (
            <>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Role</h4>
                    <p className="text-blue-50">Intern</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Agency</h4>
                    <p className="text-blue-50">Digital Marketing Agency</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                    <span className="text-2xl">👔</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Client</h4>
                    <p className="text-blue-50">John Doe</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {brief.context && (
          <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                <span className="text-xl">📋</span>
              </div>
              Context
            </h4>
            <p className="text-blue-50 text-lg leading-relaxed">{brief.context}</p>
          </div>
        )}

        {brief.objectives && brief.objectives.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                <span className="text-xl">🎯</span>
              </div>
              Objectives
            </h4>
            <ul className="space-y-4">
              {brief.objectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-blue-400/10 p-4 rounded-xl border border-white/5"
                >
                  <div className="w-8 h-8 bg-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-blue-50">{objective}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {brief.client_problem && (
          <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                <span className="text-xl">🎬</span>
              </div>
              Scenario
            </h4>
            <p className="text-blue-50 text-lg leading-relaxed">{brief.client_problem}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
