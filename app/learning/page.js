'use client';

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { FiArrowLeft, FiPlay, FiBook, FiCheckCircle, FiLock, FiStar, FiAward, FiX, FiArrowRight, FiInfo } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { marked } from 'marked';
import Chatbot from "../../components/Chatbot";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function LearningPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you with your learning journey?", isBot: true },
  ]);
  const [URL, SetURL] = useState('/api/langflow/generate');
  const [newMessage, setNewMessage] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTopicContent, setCurrentTopicContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [markdownError, setMarkdownError] = useState(null);
  const supabase = createClientComponentClient();

  const [completionModal, setCompletionModal] = useState({ show: false, currentLesson: null, nextLesson: null });

  useEffect(() => {
    async function fetchUserSkills() {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          console.log('No user email found');
          setLoading(false);
          return;
        }

        console.log('Fetching data for email:', userEmail);
        const { data, error } = await supabase
          .from('profiles')
          .select('skill_paths, modules, progress')
          .eq('email', userEmail)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        console.log('Fetched data:', data);
        
        // Ensure skill_paths is always an array
        const skillPaths = Array.isArray(data?.skill_paths) ? data.skill_paths : [];
        const modules = Array.isArray(data?.modules) ? data.modules : [];
        const progress = data?.progress || {};

        console.log('Processed data:', { skillPaths, modules, progress });

        setUserSkills(skillPaths);
        setModuleData(modules);
        setUserProgress(progress);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchUserSkills:', error);
        setUserSkills([]);
        setModuleData([]);
        setUserProgress({});
        setLoading(false);
      }
    }

    fetchUserSkills();
  }, []);

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

  const handleSkillClick = (skillName) => {
    setSelectedSkill(skillName);
    setShowRoadmap(true);
  };

  const handleBackClick = () => {
    setShowRoadmap(false);
    setSelectedSkill(null);
    setSelectedModule(null);
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setShowLessonModal(true);
  };

  const handleStartLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setCurrentTopicIndex(0);
    setIsLessonActive(true);
    setShowLessonModal(false);

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const progressKey = `${selectedSkill}.${selectedModule.name}.${lesson.name}`;
    const newProgress = {
      ...userProgress,
      [progressKey]: {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        currentTopic: 0
      }
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ progress: newProgress })
        .eq('email', userEmail);

      if (error) throw error;
      setUserProgress(newProgress);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleNextTopic = () => {
    if (selectedLesson && currentTopicIndex < selectedLesson.topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
    }
  };

  const handleExitLesson = () => {
    setIsLessonActive(false);
    setSelectedLesson(null);
    setCurrentTopicIndex(0);
  };

  const calculateModuleProgress = (moduleName) => {
    if (!userProgress || !selectedSkill) return 0;
    
    const module = moduleData?.find(skill => 
      skill?.name === selectedSkill || skill?.skill?.name === selectedSkill
    )?.modules?.find(m => m.name === moduleName) || 
    moduleData?.find(skill => 
      skill?.name === selectedSkill || skill?.skill?.name === selectedSkill
    )?.skill?.modules?.find(m => m.name === moduleName);
    
    if (!module) return 0;
    
    const totalLessons = module.lessons.length;
    if (totalLessons === 0) return 0;
    
    const completedLessons = module.lessons.filter(lesson => {
      const progressKey = `${selectedSkill}.${moduleName}.${lesson.name}`;
      return userProgress[progressKey]?.status === 'completed';
    }).length;
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const getNextLesson = (currentModule, currentLesson) => {
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.name === currentLesson.name);
    return currentModule.lessons[currentLessonIndex + 1] || null;
  };

  const handleCompleteLesson = async (lesson) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const progressKey = `${selectedSkill}.${selectedModule.name}.${lesson.name}`;
    const newProgress = {
      ...userProgress,
      [progressKey]: {
        status: 'completed',
        startedAt: userProgress[progressKey]?.startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ progress: newProgress })
        .eq('email', userEmail);

      if (error) throw error;
      
      setUserProgress(newProgress);
      
      // Check for next lesson
      const nextLesson = getNextLesson(selectedModule, lesson);
      if (nextLesson) {
        // Show completion modal with option to start next lesson
        setCompletionModal({
          show: true,
          currentLesson: lesson,
          nextLesson: nextLesson
        });
      } else {
        // Show final completion modal
        setCompletionModal({
          show: true,
          currentLesson: lesson,
          nextLesson: null
        });
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const getLessonStatus = (moduleName, lessonName) => {
    const progressKey = `${selectedSkill}.${moduleName}.${lessonName}`;
    return userProgress[progressKey]?.status || 'not_started';
  };

  const getModuleStatus = (moduleName) => {
    const progress = calculateModuleProgress(moduleName);
    if (progress === 0) return 'not_started';
    if (progress === 100) return 'completed';
    return 'in_progress';
  };

  const getNextAvailableLesson = (moduleName, lessons) => {
    for (let i = 0; i < lessons.length; i++) {
      const status = getLessonStatus(moduleName, lessons[i].name);
      if (status !== 'completed') {
        return i;
      }
    }
    return lessons.length - 1; // If all completed, show the last lesson
  };

  const isLessonAvailable = (moduleName, lessonIndex, lessons) => {
    if (lessonIndex === 0) return true;
    const prevStatus = getLessonStatus(moduleName, lessons[lessonIndex - 1].name);
    return prevStatus === 'completed';
  };

  const fetchUserProfile = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const generateTopicContent = async (topic) => {
    setLoadingContent(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User not logged in');
      }

      const userProfile = await fetchUserProfile(userEmail);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      console.log('Generating content for:', {
        topic,
        skill: selectedSkill, 
        lesson: selectedLesson?.name
      });

      const response = await fetch(`/api/langflow/${selectedSkill==="Digital Marketing"?"digital":"generate"}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          userProfile,
          selectedSkill,
          selectedLesson
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.structure) {
        throw new Error('No content received from server');
      }

      setCurrentTopicContent(data.structure);
    } catch (error) {
      console.error('Error generating topic content:', error);
      setCurrentTopicContent(`⚠️ ${error.message || 'Failed to load content. Please try again.'}`);
    } finally {
      setLoadingContent(false);
    }
  };

  const formatMarkdownContent = (content) => {
    try {
      // Add consistent heading structure
      content = content.replace(/^# /gm, '### '); // Convert top-level headings to h3
      content = content.replace(/^## /gm, '#### '); // Convert second-level headings to h4
      
      // Add custom classes for specific markdown elements
      content = content.replace(/^> /gm, '> {.quote} '); // Add class to blockquotes
      content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>'); // Add class to inline code
      
      // Add emojis for better visual hierarchy
      content = content.replace(/^### (.*)/gm, '### 🎯 $1'); // Add target emoji to main headings
      content = content.replace(/^#### (.*)/gm, '#### 📌 $1'); // Add pin emoji to subheadings
      
      // Enhance lists
      content = content.replace(/^- /gm, '• '); // Replace dashes with bullets
      content = content.replace(/^(\d+)\. /gm, '$1️⃣ '); // Add number emojis to numbered lists
      
      return content;
    } catch (error) {
      console.error('Error formatting markdown:', error);
      setMarkdownError(error.message);
      return content;
    }
  };
  const cleanupContent = (content) => {
    if (!content) return '';
    const firstHeadingMatch = content.match(/^#+ .+$/m);
    return firstHeadingMatch ? content.substring(content.indexOf(firstHeadingMatch[0])) : content;
  };
  const handleRemedialTopic = async (topic) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail || !selectedSkill || !selectedModule || !selectedLesson) return;
  
    try {
      // Get current modules
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('modules')
        .eq('email', userEmail)
        .single();
  
      if (profileError) throw profileError;
  
      // Update the modules by adding the remedial topic to the current lesson
      const updatedModules = profileData.modules.map(skill => {
        if ((skill.name || skill?.skill?.name) === selectedSkill) {
          return {
            ...skill,
            modules: (skill.modules || skill?.skill?.modules || []).map(module => {
              if (module.name === selectedModule.name) {
                return {
                  ...module,
                  lessons: module.lessons.map(lesson => {
                    if (lesson.name === selectedLesson.name) {
                      // Insert the remedial topic after the current topic
                      const updatedTopics = [...lesson.topics];
                      updatedTopics.splice(currentTopicIndex + 1, 0, topic);
                      return { ...lesson, topics: updatedTopics };
                    }
                    return lesson;
                  })
                };
              }
              return module;
            })
          };
        }
        return skill;
      });
  
      // Update the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ modules: updatedModules })
        .eq('email', userEmail);
  
      if (updateError) throw updateError;
  
      // Update local state
      setModuleData(updatedModules);
      
      // Update the selected lesson's topics in local state
      if (selectedLesson) {
        const updatedTopics = [...selectedLesson.topics];
        updatedTopics.splice(currentTopicIndex + 1, 0, topic);
        setSelectedLesson({
          ...selectedLesson,
          topics: updatedTopics
        });
      }
    } catch (error) {
      console.error('Error adding remedial topic:', error);
    }
  };
  useEffect(() => {
    if (selectedLesson && selectedLesson.topics[currentTopicIndex]) {
      generateTopicContent(selectedLesson.topics[currentTopicIndex]);
    }
  }, [currentTopicIndex, selectedLesson]);

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="flex">
          {/* Left side content */}
          <div className="flex-1 max-w-[calc(100%-24rem)]">
            <div className="p-4 md:p-8">
              {isLessonActive && selectedLesson ? (
                <div className="space-y-6">
                  {/* Lesson Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleExitLesson}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <FiArrowLeft className="mr-2" /> Back to Module
                    </button>
                    <div className="text-sm text-gray-500">
                      Topic {currentTopicIndex + 1} of {selectedLesson.topics.length}
                    </div>
                  </div>

                  {/* Lesson Title */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedLesson.name}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {selectedLesson["practical outcome"]}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${((currentTopicIndex + 1) / selectedLesson.topics.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Topic Content */}
                  <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                    {/* Progress Bar */}
                    {/* <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentTopicIndex + 1) / selectedLesson.topics.length) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${((currentTopicIndex + 1) / selectedLesson.topics.length) * 100}%` }}
                        />
                      </div>
                    </div> */}

                    {/* Topic Header */}
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center group">
                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg mr-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                          {currentTopicIndex + 1}
                        </span>
                        <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {selectedLesson.topics[currentTopicIndex]}
                        </span>
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Topic {currentTopicIndex + 1} of {selectedLesson.topics.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Loading State */}
                    {loadingContent ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Generating engaging content...</p>
                      </div>
                    ) : markdownError ? (
                      <div className="text-red-500 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center mb-2">
                          <FiX className="w-5 h-5 mr-2" />
                          <span className="font-semibold">Error rendering content</span>
                        </div>
                        <p>{markdownError}</p>
                      </div>
                    ) : (
                      <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-purple dark:prose-invert max-w-none"
                      components={{
                        a: ({node, ...props}) => {
                          // YouTube video link
                          const youtubeMatch = props.href?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                          if (youtubeMatch) {
                            return (
                              <div className="my-4 aspect-video rounded-lg overflow-hidden shadow-md">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full"
                                />
                              </div>
                            );
                          }
                    
                          // Image link
                          const imageMatch = props.href?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                          if (imageMatch) {
                            return (
                              <div className="my-4">
                                <img
                                  src={props.href}
                                  alt={props.children}
                                  className="rounded-lg shadow-md w-full object-cover max-h-[400px]"
                                  loading="lazy"
                                />
                              </div>
                            );
                          }
                    
                          // Regular link
                          return (
                            <a 
                              {...props} 
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                            />
                          );
                        },
                        blockquote: ({node, children}) => (
                          <div className="my-4 border-l-4 border-purple-500 pl-4 italic bg-purple-50 dark:bg-purple-900/20 p-4 rounded-r-lg">
                            {children}
                          </div>
                        ),
                        code: ({node, inline, children}) => (
                          inline ? 
                            <code className="bg-purple-100 dark:bg-purple-900/30 px-1 py-0.5 rounded text-sm">{children}</code> :
                            <div className="my-4 bg-gray-900 rounded-lg overflow-hidden">
                              <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                                <code>{children}</code>
                              </pre>
                            </div>
                        ),
                        h1: ({node, ...props}) => (
                          <h1 {...props} className="text-3xl font-bold mb-4 text-gray-900 dark:text-white" />
                        ),
                        h2: ({node, ...props}) => (
                          <h2 {...props} className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100" />
                        ),
                        h3: ({node, ...props}) => (
                          <h3 {...props} className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-200" />
                        ),
                        ul: ({node, ...props}) => (
                          <ul {...props} className="list-disc list-inside space-y-2 my-4" />
                        ),
                        ol: ({node, ...props}) => (
                          <ol {...props} className="list-decimal list-inside space-y-2 my-4" />
                        )
                      }}
                    >
    {cleanupContent(currentTopicContent)}
                    </ReactMarkdown>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePreviousTopic}
                      disabled={currentTopicIndex === 0}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        currentTopicIndex === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FiArrowLeft className="mr-2" /> Previous Topic
                    </button>

                    {currentTopicIndex === selectedLesson.topics.length - 1 ? (
                      <button
                        onClick={() => handleCompleteLesson(selectedLesson)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                      >
                        Complete Lesson <FiCheckCircle className="ml-2" />
                      </button>
                    ) : (
                      <button
                        onClick={handleNextTopic}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
                      >
                        Next Topic <FiArrowRight className="ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              ) : showRoadmap ? (
                <div>
                  <button
                    onClick={handleBackClick}
                    className="flex items-center text-purple-500 mb-6 hover:text-purple-600 transition-colors"
                  >
                    <FiArrowLeft className="mr-2" /> Back to Skills
                  </button>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedSkill} - Learning Roadmap
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Follow this roadmap to master {selectedSkill}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                  {(moduleData?.find(skill => (skill.name || skill?.skill?.name) === selectedSkill)?.modules || moduleData?.find(skill => (skill.name || skill?.skill?.name) === selectedSkill)?.skill?.modules)?.map((module, index) => (
                    <div
                        key={index}
                        onClick={() => handleModuleClick(module)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{module.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <FiBook className="mr-1" /> {module.lessons.length} Lessons
                                </span>
                                <span className="flex items-center">
                                  {calculateModuleProgress(module.name)}% Complete
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {calculateModuleProgress(module.name) === 100 ? (
                                <FiCheckCircle className="text-xl text-green-500" />
                              ) : calculateModuleProgress(module.name) > 0 ? (
                                <FiPlay className="text-xl text-purple-500" />
                              ) : (
                                <FiArrowRight className="text-xl text-purple-500" />
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                                style={{ width: `${calculateModuleProgress(module.name)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Skill Quests
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a skill to begin your learning journey
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moduleData?.map((skill, index) => (
                      
                      <div
                        key={index}
                        onClick={() => handleSkillClick(skill.name || skill?.skill.name)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold">{skill.name ||skill?.skill.name}</h3>
                          <FiArrowRight className="text-xl text-purple-500" />
                        </div>
                        {/* <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {skill.skill.description || skill.description || skill?.skill?.outcome || skill?.outcome}
                        </p> */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiBook className="mr-1" /> {skill?.modules?.length || skill?.skill.modules.length} Modules
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Modal */}
          {showLessonModal && selectedModule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedModule.name}</h2>
                    {selectedModule.prerequisites && (
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-500">Prerequisites</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {selectedModule.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowLessonModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Module Progress</h3>
                      <span className="text-sm text-gray-500">
                        {calculateModuleProgress(selectedModule.name)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${calculateModuleProgress(selectedModule.name)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Lesson Timeline */}
                  <div className="relative">
                    {selectedModule.lessons.map((lesson, index) => {
                      const status = getLessonStatus(selectedModule.name, lesson.name);
                      const isAvailable = isLessonAvailable(selectedModule.name, index, selectedModule.lessons);
                      const isActive = index === getNextAvailableLesson(selectedModule.name, selectedModule.lessons);

                      return (
                        <div 
                          key={index}
                          className={`border dark:border-gray-700 rounded-lg p-4 mb-4 relative ${
                            isActive ? 'ring-2 ring-purple-500' : ''
                          } ${!isAvailable ? 'opacity-50' : ''}`}
                        >
                          {/* Timeline connector */}
                          {index !== selectedModule.lessons.length - 1 && (
                            <div className="absolute left-8 bottom-0 w-0.5 h-4 bg-gray-200 dark:bg-gray-700 -mb-4 z-0"></div>
                          )}
                          
                          <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              status === 'completed' 
                                ? 'bg-green-100 text-green-500' 
                                : status === 'in_progress'
                                ? 'bg-purple-100 text-purple-500'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {status === 'completed' 
                                ? <FiCheckCircle className="text-lg" />
                                : status === 'in_progress'
                                ? <FiPlay className="text-lg" />
                                : index + 1
                              }
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{lesson.name}</h3>
                                <div className="flex items-center space-x-2">
                                  {status === 'completed' ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-green-500">Completed</span>
                                      {isActive && (
                                        <button
                                          onClick={() => handleStartLesson(lesson)}
                                          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                          Restart
                                        </button>
                                      )}
                                    </div>
                                  ) : status === 'in_progress' ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-purple-500">In Progress</span>
                                      {isActive && (
                                        <button
                                          onClick={() => handleCompleteLesson(lesson)}
                                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                          Complete
                                        </button>
                                      )}
                                    </div>
                                  ) : isAvailable ? (
                                    isActive && (
                                      <button
                                        onClick={() => handleStartLesson(lesson)}
                                        className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                      >
                                        Start Lesson
                                      </button>
                                    )
                                  ) : (
                                    <span className="flex items-center text-sm text-gray-500">
                                      <FiLock className="mr-1" /> Locked
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isActive && (
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Practical Outcome</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{lesson["practical outcome"]}</p>
                                  </div>

                                  {/* {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites</h4>
                                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                        {lesson.prerequisites.map((prereq, prereqIndex) => (
                                          <li key={prereqIndex}>{prereq}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )} */}

                                  <div>
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Covered</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                      {lesson.topics.map((topic, topicIndex) => (
                                        <li key={topicIndex}>{topic}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {status !== 'not_started' && (
                                    <div className="text-sm text-gray-500">
                                      {status === 'completed' ? (
                                        <span>Completed on: {new Date(userProgress[`${selectedSkill}.${selectedModule.name}.${lesson.name}`].completedAt).toLocaleDateString()}</span>
                                      ) : (
                                        <span>Started on: {new Date(userProgress[`${selectedSkill}.${selectedModule.name}.${lesson.name}`].startedAt).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* {!isActive && lesson.prerequisites && lesson.prerequisites.length > 0 && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => {
                                      const content = document.getElementById(`prereq-${index}`);
                                      if (content) {
                                        content.classList.toggle('hidden');
                                      }
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                                  >
                                    <FiInfo className="mr-1" /> Show Prerequisites
                                  </button>
                                  <div id={`prereq-${index}`} className="hidden mt-2">
                                    <div className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                      <h5 className="font-medium mb-1">Prerequisites:</h5>
                                      <ul className="list-disc list-inside space-y-0.5">
                                        {lesson.prerequisites.map((prereq, prereqIndex) => (
                                          <li key={prereqIndex} className="text-gray-500">{prereq}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )} */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Modal */}
          {completionModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="mb-4">
                    <FiCheckCircle className="mx-auto text-5xl text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Lesson Completed!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Congratulations on completing {completionModal.currentLesson.name}!
                  </p>
                  
                  <div className="space-y-4">
                    {completionModal.nextLesson ? (
                      <>
                        <button
                          onClick={() => {
                            setCompletionModal({ show: false, currentLesson: null, nextLesson: null });
                            handleStartLesson(completionModal.nextLesson);
                          }}
                          className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Start Next Lesson: {completionModal.nextLesson.name}
                        </button>
                        <button
                          onClick={() => {
                            setCompletionModal({ show: false, currentLesson: null, nextLesson: null });
                            setIsLessonActive(false);
                          }}
                          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Return to Module
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setCompletionModal({ show: false, currentLesson: null, nextLesson: null });
                          setIsLessonActive(false);
                        }}
                        className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Complete Module
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Chat Bot */}
          {/* <div className="hidden lg:block w-96 fixed top-16 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"> */}
            {/* <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Learning Assistant</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ask me anything about your courses</p>
            </div> */}
            
            {/* Chat Messages */}
            {/* <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(100vh-13rem)]">
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
            </div> */}
<Chatbot 
  topic={selectedLesson?.name || selectedModule?.name || selectedSkill} 
  studyMaterial={currentTopicContent}
  onRemedialTopic={handleRemedialTopic}
/>
            {/* Message Input */}
            {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
          </div> */}
        </div>
      </div>
    </Layout>
  );
}
