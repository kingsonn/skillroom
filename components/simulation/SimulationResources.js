'use client';

import { motion } from "framer-motion";
import { FaWrench } from "react-icons/fa";

const resourceVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

export default function SimulationResources({ resources, tool }) {
  if (!resources) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl border border-white/10">
        <h3 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
          <div className="w-12 h-12 rounded-xl bg-purple-400/20 flex items-center justify-center mr-3">
            <span className="text-2xl">📚</span>
          </div>
          Mission Resources
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {resources.data && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center mr-3">
                  <span className="text-xl">📖</span>
                </div>
                Documentation
              </h4>
              <div className="space-y-4">
                {resources.data.map((doc, index) => (
                  <motion.a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    custom={index}
                    variants={resourceVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    className="block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl transform transition-all cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-lg hover:-translate-y-1 duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-xl mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">{doc.data_name}</h5>
                        <ul className="text-purple-100 text-sm mb-4 list-disc pl-5 space-y-2">
                          {doc.data_description.map((description, index) => (
                            <li key={index} className="leading-relaxed">{description}</li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2">
                          {doc.tags?.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-purple-700/50 backdrop-blur-sm px-3 py-1 rounded-lg text-xs border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {tool && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center mr-3">
                  <span className="text-xl">🛠️</span>
                </div>
                Tools
              </h4>
              <div className="space-y-4">
                {tool.map((tool, index) => (
                  <motion.a
                    key={index}
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    custom={index}
                    variants={resourceVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    className="block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl transform transition-all cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-lg hover:-translate-y-1 duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl"><FaWrench /></span>
                      <div>
                        <h5 className="font-semibold text-lg mb-1">{tool.tool_name}</h5>
                        <p className="text-purple-100 text-sm">{tool.tool_description}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>

        {resources.pro_tips && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <span className="text-2xl mr-2">💡</span> Pro Tips
            </h4>
            <ul className="space-y-3">
              {resources.pro_tips.map((tip, index) => (
                <motion.li
                  key={index}
                  custom={index}
                  variants={resourceVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start"
                >
                  <span className="text-purple-300 mr-3">•</span>
                  <span className="text-purple-50">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
