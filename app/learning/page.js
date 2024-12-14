'use client';

import { useState } from 'react';
import Layout from "../../components/Layout";
import { FiArrowLeft, FiPlay, FiBook, FiCheckCircle, FiLock, FiStar, FiAward, FiX, FiArrowRight } from 'react-icons/fi';

export default function LearningPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you with your learning journey?", isBot: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      { text: newMessage, isBot: false },
      { text: "I'm processing your request...", isBot: true },
    ]);
    setNewMessage('');
  };

  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description: "Master the basics of web development with HTML, CSS, and JavaScript",
      progress: 75,
      modules: 12,
      completedModules: 9,
      image: "/web-dev.jpg"
    },
    {
      id: 2,
      title: "React & Next.js Mastery",
      description: "Build modern web applications with React and Next.js",
      progress: 30,
      modules: 15,
      completedModules: 4,
      image: "/react.jpg"
    },
    {
      id: 3,
      title: "Backend Development",
      description: "Learn server-side programming with Node.js and databases",
      progress: 0,
      modules: 10,
      completedModules: 0,
      image: "/backend.jpg",
      locked: true
    }
  ];

  const modules = [
    {
      id: 1,
      title: "HTML Fundamentals",
      content: "Learn the basics of HTML structure and semantic elements",
      status: "completed",
      xp: 100,
      skills: ["HTML5", "Semantics", "Accessibility"],
      achievements: ["HTML Master", "Perfect Score"],
      progress: 100
    },
    {
      id: 2,
      title: "CSS Styling",
      content: "Master CSS styling and layout techniques",
      status: "current",
      xp: 150,
      skills: ["CSS3", "Flexbox", "Grid", "Animations"],
      achievements: ["Style Guru", "Layout Expert"],
      progress: 60
    },
    {
      id: 3,
      title: "JavaScript Basics",
      content: "Get started with JavaScript programming",
      status: "locked",
      xp: 200,
      skills: ["JavaScript", "ES6", "DOM"],
      achievements: ["Code Ninja", "Algorithm Ace"],
      progress: 0
    }
  ];

  const CourseListView = () => (
    <div className="space-y-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
            course.locked ? 'opacity-75' : 'cursor-pointer'
          }`}
          onClick={() => !course.locked && setShowRoadmap(true)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {course.description}
                </p>
              </div>
              {course.locked && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                  <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{course.completedModules} of {course.modules} modules completed</span>
                <span>{course.progress}%</span>
              </div>
              
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              {!course.locked && (
                <button
                  onClick={() => setShowRoadmap(true)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>{course.progress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const RoadmapView = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowRoadmap(false)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Courses</span>
        </button>

        {/* Level Progress */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FiStar className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-900 dark:text-white">450 XP</span>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-300">5</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">Level</span>
          </div>
        </div>
      </div>

      {/* Game Board Layout */}
      <div className="relative py-8">
        {/* Connection Lines */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <svg className="w-full h-full" style={{ position: 'absolute', zIndex: 0 }}>
            {modules.map((_, index) => {
              if (index < modules.length - 1) {
                const startX = `${(100 / (modules.length - 1)) * index}%`;
                const endX = `${(100 / (modules.length - 1)) * (index + 1)}%`;
                return (
                  <line
                    key={index}
                    x1={startX}
                    y1="50%"
                    x2={endX}
                    y2="50%"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="text-gray-300 dark:text-gray-700"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>

        {/* Module Boxes */}
        <div className="grid grid-cols-3 gap-8 relative z-10">
          {modules.map((module, index) => (
            <div
              key={module.id}
              onClick={() => !module.locked && setSelectedModule(module.id)}
              className={`relative group ${module.status === 'locked' ? 'opacity-50' : ''}`}
            >
              {/* Module Box */}
              <div className={`
                aspect-square rounded-2xl p-4 cursor-pointer transform transition-all duration-300
                ${module.status === 'completed' ? 'bg-gradient-to-br from-green-400 to-green-600 hover:scale-105' :
                  module.status === 'current' ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-105 animate-pulse' :
                  'bg-gradient-to-br from-gray-400 to-gray-600'}
                shadow-lg hover:shadow-xl
              `}>
                <div className="h-full bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col justify-between">
                  {/* Status Icon */}
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FiBook className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    {module.status === 'completed' && (
                      <FiCheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {module.status === 'locked' && (
                      <FiLock className="w-6 h-6 text-gray-400" />
                    )}
                    {module.status === 'current' && (
                      <FiPlay className="w-6 h-6 text-blue-500" />
                    )}
                  </div>

                  {/* Title and XP */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {module.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{module.xp} XP</span>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  <div className="flex -space-x-2">
                    {module.skills.slice(0, 3).map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800"
                        title={skill}
                      >
                        {skill.charAt(0)}
                      </div>
                    ))}
                    {module.skills.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                        +{module.skills.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar (Only for current module) */}
              {module.status === 'current' && (
                <div className="absolute -bottom-6 left-0 right-0 px-4">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${module.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                    {module.progress || 0}% Complete
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Main content with right padding for chat panel */}
        <div className="flex">
          {/* Left side content */}
          <div className="flex-1 max-w-[calc(100%-24rem)]">
            <div className="p-4 md:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {showRoadmap ? "Web Development Path" : "Learning Paths"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {showRoadmap 
                    ? "Master web development through interactive modules" 
                    : "Choose a learning path to begin your journey"}
                </p>
              </div>

              <div className="space-y-6">
                {showRoadmap ? <RoadmapView /> : <CourseListView />}
              </div>
            </div>
          </div>

          {/* Fixed Chat Bot */}
          <div className="hidden lg:block w-96 fixed top-16 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Learning Assistant</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ask me anything about your courses</p>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(100vh-13rem)]">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Module Details Popup */}
        {selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Popup Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiArrowLeft className="w-5 h-5 mr-2" />
                    <span>Back to Modules</span>
                  </button>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Popup Content */}
              <div className="p-6 space-y-6">
                {modules.find(m => m.id === selectedModule) && (
                  <>
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FiBook className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {modules.find(m => m.id === selectedModule).title}
                          </h3>
                          <div className="flex items-center mt-1 space-x-3">
                            <div className="flex items-center space-x-1">
                              <FiStar className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {modules.find(m => m.id === selectedModule).xp} XP
                              </span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {modules.find(m => m.id === selectedModule).status === 'completed' ? 'Completed' :
                               modules.find(m => m.id === selectedModule).status === 'current' ? 'In Progress' : 'Locked'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {modules.find(m => m.id === selectedModule).content}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills to Master</h4>
                      <div className="flex flex-wrap gap-2">
                        {modules.find(m => m.id === selectedModule).skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Achievements</h4>
                      <div className="flex flex-wrap gap-3">
                        {modules.find(m => m.id === selectedModule).achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900"
                          >
                            <FiAward className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                            <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => setSelectedModule(null)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiPlay className="w-5 h-5" />
                        <span>Start Module</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
