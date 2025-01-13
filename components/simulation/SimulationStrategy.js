'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCode, FaChalkboardTeacher, FaPlayCircle, FaCog, FaDownload, FaShare, FaBold, FaItalic, FaListUl, FaListOl, FaQuoteRight, FaHeading } from "react-icons/fa";

export default function SimulationStrategy({ task, achievements, timeRemaining, mission, simulation }) {
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('code');
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('analysis');
  const [completedSteps, setCompletedSteps] = useState({
    analysis: false,
    problemSolving: false,
    actions: false
  });
  const [actionPlan, setActionPlan] = useState({
    analysis: [], // Array of {metric, insight} pairs
    problemSolving: [], // Array of {approach, tactics: []} objects
    actions: []
  });
  const [newItem, setNewItem] = useState({
    analysis: {
      metric: '',
      insight: ''
    },
    strategy: {
      approach: '',
      newTactic: '',
      tactics: []
    },
    action: { what: '', why: '', how: '', expected: '' }
  });

  const [clientFeedback, setClientFeedback] = useState("Hey there! I'm really looking forward to seeing your solution. Make sure to consider all aspects of the problem and present it in a clear, professional way. Good luck! 🚀");
  const [feedbackStatus, setFeedbackStatus] = useState("waiting"); // waiting, reviewing, complete

  const canProceedToNext = () => {
    switch(activeSection) {
      case 'analysis':
        return actionPlan.analysis.length > 0;
      case 'problemSolving':
        return actionPlan.problemSolving.length > 0;
      case 'actions':
        return actionPlan.actions.length > 0;
      default:
        return false;
    }
  };

  const proceedToNext = () => {
    if (!canProceedToNext()) return;
    
    setCompletedSteps(prev => ({
      ...prev,
      [activeSection]: true
    }));

    switch(activeSection) {
      case 'analysis':
        setActiveSection('problemSolving');
        break;
      case 'problemSolving':
        setActiveSection('actions');
        break;
      case 'actions':
        handleCompleteTask();
        break;
    }
  };

  const addFormatting = (type) => {
    if (!slides[activeSlide]) return;
    
    const textarea = document.querySelector('#slide-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = slides[activeSlide].content;
    
    let newContent = content;
    let newCursorPos = end;

    switch(type) {
      case 'bold':
        newContent = content.slice(0, start) + `**${content.slice(start, end)}**` + content.slice(end);
        newCursorPos += 4;
        break;
      case 'italic':
        newContent = content.slice(0, start) + `*${content.slice(start, end)}*` + content.slice(end);
        newCursorPos += 2;
        break;
      case 'bullet':
        const selectedLines = content.slice(start, end).split('\n');
        const bulletedLines = selectedLines.map(line => `• ${line.replace(/^[•\-\d]+\.\s*/, '')}`);
        newContent = content.slice(0, start) + bulletedLines.join('\n') + content.slice(end);
        break;
      case 'number':
        const numberedLines = content.slice(start, end).split('\n');
        const numbered = numberedLines.map((line, i) => `${i + 1}. ${line.replace(/^[•\-\d]+\.\s*/, '')}`);
        newContent = content.slice(0, start) + numbered.join('\n') + content.slice(end);
        break;
      case 'heading':
        newContent = content.slice(0, start) + `## ${content.slice(start, end)}` + content.slice(end);
        newCursorPos += 3;
        break;
      case 'quote':
        newContent = content.slice(0, start) + `> ${content.slice(start, end)}` + content.slice(end);
        newCursorPos += 2;
        break;
    }

    const newSlides = [...slides];
    newSlides[activeSlide] = {
      ...newSlides[activeSlide],
      content: newContent
    };
    setSlides(newSlides);

    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderFormattedContent = (content) => {
    let formatted = content;
    // Convert markdown-style formatting to HTML
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/^•\s(.*)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^##\s(.*)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^>\s(.*)$/gm, '<blockquote>$1</blockquote>');
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const handleCompleteTask = async () => {
    // Log all user inputs
    const userInputs = {
      analysis: actionPlan.analysis,
      problemSolving: actionPlan.problemSolving,
      actions: actionPlan.actions,
      activeSection: activeSection,
      completedSteps: completedSteps,
      code: {
        activeTab: activeTab === 'code',
        editorContent: slides[0]?.content || '',
      },
      presentation: {
        slides: slides.map(slide => slide.content),
        isPreview: isPreview,
      }
    };
    
    console.log('User Strategy Inputs:', userInputs);

    try {
      setFeedbackStatus("reviewing");
      setClientFeedback("Reviewing your solution... Please wait a moment! 🤔");

      // Send feedback request
      const response = await fetch('/api/langflow/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulation: simulation,
          answers: userInputs
        })
      });
        
      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      const data = await response.json();
      console.log('Feedback response:', data);
      
      setFeedbackStatus("complete");
      setClientFeedback(data.structure);
    } catch (error) {
      console.error('Error sending feedback:', error);
      setFeedbackStatus("error");
      setClientFeedback("Sorry, I couldn't process your solution at the moment. Please try again later. 😔");
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>No task available</p>
      </div>
    );
  }

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && task.timeLimit) {
      const totalTime = task.timeLimit * 60;
      const progressPercent = ((totalTime - timeRemaining) / totalTime) * 100;
      setProgress(progressPercent);
    }
  }, [timeRemaining, task.timeLimit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-800 rounded-xl p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold flex items-center">
            <span className="text-3xl mr-3">🎯</span>
            Current Mission
          </h3>
          {timeRemaining !== null && (
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center">
              <span className="text-xl mr-3">⏱️</span>
              <span className="font-mono text-xl tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <p className="text-lg mb-6 bg-black/10 p-4 rounded-lg">{mission}</p>

        <div className="space-y-6 mb-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">📝</span> Task Description
            </h4>
            <p className="text-blue-50 text-lg leading-relaxed">{task}</p>
          </div>

          {task.requirements && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">✅</span> Requirements
              </h4>
              <ul className="space-y-3">
                {task.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    <span className="text-blue-50">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Client Message Box */}
          <div className="relative">
            <div className="absolute -top-3 left-8 w-4 h-4 bg-indigo-100 dark:bg-indigo-900 transform rotate-45"></div>
            <div className="bg-indigo-100 dark:bg-indigo-900 rounded-2xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-indigo-800 shadow-lg flex items-center justify-center">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Client Message</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feedbackStatus === "waiting" ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300" :
                      feedbackStatus === "reviewing" ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300" :
                      feedbackStatus === "complete" ? "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300" :
                      "bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300"
                    }`}>
                      {feedbackStatus === "waiting" ? "Waiting for Solution" :
                       feedbackStatus === "reviewing" ? "Reviewing Solution" :
                       feedbackStatus === "complete" ? "Review Complete" :
                       "Review Error"}
                    </span>
                  </div>
                  <p className="text-indigo-700 dark:text-indigo-300 whitespace-pre-line">
                    {clientFeedback}
                  </p>
                  <div className="mt-3 flex items-center space-x-3">
                    <div className="flex items-center">
                      <span className={`block w-2 h-2 rounded-full ${
                        feedbackStatus === "reviewing" ? "bg-blue-500 animate-pulse" :
                        feedbackStatus === "complete" ? "bg-green-500" :
                        feedbackStatus === "error" ? "bg-red-500" :
                        "bg-yellow-500"
                      }`}></span>
                      <span className="ml-2 text-sm text-indigo-600 dark:text-indigo-400">
                        {feedbackStatus === "reviewing" ? "Processing" :
                         feedbackStatus === "complete" ? "Feedback Ready" :
                         feedbackStatus === "error" ? "Error" :
                         "Online"}
                      </span>
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400">
                      Priority: <span className="font-medium">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle UI */}
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaCode />
              <span>Code</span>
            </button>
            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'presentation'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaChalkboardTeacher />
              <span>Presentation</span>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'actions'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaPlayCircle />
              <span>Actions</span>
            </button>
          </div>

          {/* Code Section */}
          {activeTab === 'code' && (
            <div className="bg-[#1e1e1e] backdrop-blur-sm rounded-xl overflow-hidden">
              {/* IDE Header */}
              <div className="bg-[#252526] p-2 flex justify-between items-center border-b border-[#3e3e42]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#2d2d2d] text-white/70 rounded text-sm">main.js</span>
                  <span className="px-3 py-1 text-white/50 hover:bg-[#2d2d2d] rounded text-sm cursor-pointer">index.html</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-white/70 hover:text-white/90 hover:bg-[#2d2d2d] rounded">
                    <FaCog className="text-sm" />
                  </button>
                  <button className="p-2 text-white/70 hover:text-white/90 hover:bg-[#2d2d2d] rounded">
                    <FaDownload className="text-sm" />
                  </button>
                  <button className="p-2 text-white/70 hover:text-white/90 hover:bg-[#2d2d2d] rounded">
                    <FaShare className="text-sm" />
                  </button>
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="flex">
                {/* Line Numbers */}
                <div className="p-4 bg-[#1e1e1e] text-[#858585] text-right select-none font-mono text-sm" style={{ minWidth: '50px' }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                {/* Code Area */}
                <textarea
                  className="w-full bg-[#1e1e1e] p-4 text-white font-mono text-sm focus:outline-none resize-none leading-6"
                  rows="10"
                  placeholder="// Write your code here..."
                  style={{ 
                    caretColor: '#fff',
                    tabSize: 2,
                  }}
                />
              </div>
              
              {/* Bottom Bar */}
              <div className="bg-[#007acc] text-white/90 px-4 py-2 flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span>JavaScript</span>
                  <span>UTF-8</span>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded flex items-center gap-2">
                  <FaPlayCircle className="text-sm" />
                  Run
                </button>
              </div>
            </div>
          )}

          {/* Presentation Section */}
          {activeTab === 'presentation' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              {/* Presentation Header */}
              <div className="bg-[#252526] p-3 flex justify-between items-center border-b border-[#3e3e42]">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-white">Presentation Slides</h4>
                  <span className="bg-blue-500 px-2 py-0.5 rounded text-sm">
                    {slides.length} slides
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded flex items-center gap-2"
                  >
                    {isPreview ? 'Edit Mode' : 'Preview Mode'}
                  </button>
                </div>
              </div>

              <div className="flex h-[500px]">
                {/* Slide List */}
                <div className="w-48 bg-[#1e1e1e] border-r border-[#3e3e42] overflow-y-auto">
                  <div className="p-4">
                    <button
                      onClick={() => {
                        setSlides([...slides, { title: `Slide ${slides.length + 1}`, content: '' }]);
                        setActiveSlide(slides.length);
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
                    >
                      <span>+ Add Slide</span>
                    </button>
                  </div>
                  <div className="space-y-1 px-2">
                    {slides.map((slide, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-full p-3 rounded text-left text-sm ${
                          activeSlide === index
                            ? 'bg-[#37373d] text-white'
                            : 'text-white/70 hover:bg-[#2d2d2d]'
                        }`}
                      >
                        <div className="font-medium">{slide.title}</div>
                        <div className="text-xs text-white/50 truncate">
                          {slide.content.slice(0, 30)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[#1e1e1e] p-6">
                  {isPreview ? (
                    <div className="h-full flex items-center justify-center bg-white/5 rounded-lg p-8">
                      {slides[activeSlide] ? (
                        <div className="w-full max-w-2xl">
                          <h3 className="text-2xl font-bold mb-4">{slides[activeSlide].title}</h3>
                          <div className="prose prose-invert">
                            {renderFormattedContent(slides[activeSlide].content)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-white/50">No slides to preview</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {slides[activeSlide] ? (
                        <>
                          <input
                            type="text"
                            value={slides[activeSlide].title}
                            onChange={(e) => {
                              const newSlides = [...slides];
                              newSlides[activeSlide] = {
                                ...newSlides[activeSlide],
                                title: e.target.value,
                              };
                              setSlides(newSlides);
                            }}
                            className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Slide Title"
                          />
                          {/* Formatting Toolbar */}
                          <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] rounded-lg">
                            <button
                              onClick={() => addFormatting('bold')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Bold"
                            >
                              <FaBold />
                            </button>
                            <button
                              onClick={() => addFormatting('italic')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Italic"
                            >
                              <FaItalic />
                            </button>
                            <div className="w-px h-5 bg-white/20" />
                            <button
                              onClick={() => addFormatting('bullet')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Bullet List"
                            >
                              <FaListUl />
                            </button>
                            <button
                              onClick={() => addFormatting('number')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Numbered List"
                            >
                              <FaListOl />
                            </button>
                            <div className="w-px h-5 bg-white/20" />
                            <button
                              onClick={() => addFormatting('heading')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Heading"
                            >
                              <FaHeading />
                            </button>
                            <button
                              onClick={() => addFormatting('quote')}
                              className="p-2 text-white/70 hover:text-white hover:bg-[#3d3d3d] rounded"
                              title="Quote"
                            >
                              <FaQuoteRight />
                            </button>
                          </div>
                          <textarea
                            id="slide-content"
                            value={slides[activeSlide].content}
                            onChange={(e) => {
                              const newSlides = [...slides];
                              newSlides[activeSlide] = {
                                ...newSlides[activeSlide],
                                content: e.target.value,
                              };
                              setSlides(newSlides);
                            }}
                            className="w-full bg-black/20 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 h-24"
                            placeholder="Write your slide content here...&#10;Use the formatting toolbar above to style your content"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const newSlides = slides.filter((_, i) => i !== activeSlide);
                                setSlides(newSlides);
                                setActiveSlide(Math.max(0, activeSlide - 1));
                              }}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded"
                            >
                              Delete Slide
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-white/50 py-8">
                          No slide selected. Add a new slide to get started.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions Section */}
          {activeTab === 'actions' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              {/* Progress Steps */}
              <div className="bg-[#252526] p-4 border-b border-[#3e3e42]">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <div className={`flex flex-col items-center ${activeSection === 'analysis' ? 'text-blue-500' : completedSteps.analysis ? 'text-blue-500/70' : 'text-white/50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      activeSection === 'analysis' ? 'bg-blue-500 text-white' : 
                      completedSteps.analysis ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10'
                    }`}>
                      1
                    </div>
                    <span className="text-sm">Analysis</span>
                  </div>
                  <div className={`w-24 h-0.5 ${completedSteps.analysis ? 'bg-blue-500/70' : 'bg-white/10'}`} />
                  <div className={`flex flex-col items-center ${activeSection === 'problemSolving' ? 'text-blue-500' : completedSteps.problemSolving ? 'text-blue-500/70' : 'text-white/50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      activeSection === 'problemSolving' ? 'bg-blue-500 text-white' : 
                      completedSteps.problemSolving ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10'
                    }`}>
                      2
                    </div>
                    <span className="text-sm">Problem Solving</span>
                  </div>
                  <div className={`w-24 h-0.5 ${completedSteps.problemSolving ? 'bg-blue-500/70' : 'bg-white/10'}`} />
                  <div className={`flex flex-col items-center ${activeSection === 'actions' ? 'text-blue-500' : completedSteps.actions ? 'text-blue-500/70' : 'text-white/50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      activeSection === 'actions' ? 'bg-blue-500 text-white' : 
                      completedSteps.actions ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10'
                    }`}>
                      3
                    </div>
                    <span className="text-sm">Actions</span>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {/* Analysis Section */}
                {activeSection === 'analysis' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                        <span className="text-2xl">📊</span>
                      </div>
                      Metrics & Insights
                    </h3>
                    <div className="space-y-4">
                      {/* Add new metric-insight pair */}
                      <div className="bg-gradient-to-br from-white/5 to-white/0 p-6 rounded-xl border border-white/10 space-y-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Key Metric</label>
                            <input
                              type="text"
                              value={newItem.analysis.metric}
                              onChange={(e) => setNewItem({
                                ...newItem,
                                analysis: { ...newItem.analysis, metric: e.target.value }
                              })}
                              placeholder="What's your key metric? (e.g., 'Customer Engagement Rate')"
                              className="w-full bg-black/20 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Corresponding Insight</label>
                            <textarea
                              value={newItem.analysis.insight}
                              onChange={(e) => setNewItem({
                                ...newItem,
                                analysis: { ...newItem.analysis, insight: e.target.value }
                              })}
                              placeholder="What insight did you gain from this metric? (e.g., 'Current engagement rate is 15% below industry average')"
                              className="w-full bg-black/20 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10 h-24"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (newItem.analysis.metric && newItem.analysis.insight) {
                                setActionPlan({
                                  ...actionPlan,
                                  analysis: [...actionPlan.analysis, newItem.analysis]
                                });
                                setNewItem({
                                  ...newItem,
                                  analysis: { metric: '', insight: '' }
                                });
                              }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-3 rounded-xl text-white font-medium shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
                          >
                            <span>Add Pair</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Display metric-insight pairs */}
                      {actionPlan.analysis.map((pair, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                                  <span className="text-xl">📈</span>
                                </div>
                                <div>
                                  <span className="text-blue-400 text-sm font-medium">Metric</span>
                                  <p className="text-lg font-medium">{pair.metric}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mr-3">
                                  <span className="text-xl">💡</span>
                                </div>
                                <div>
                                  <span className="text-blue-400 text-sm font-medium">Insight</span>
                                  <p className="text-white/70">{pair.insight}</p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newAnalysis = actionPlan.analysis.filter((_, i) => i !== index);
                                setActionPlan({
                                  ...actionPlan,
                                  analysis: newAnalysis
                                });
                              }}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Next button */}
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={proceedToNext}
                          disabled={!canProceedToNext()}
                          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                            canProceedToNext()
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-white/10 text-white/50 cursor-not-allowed'
                          }`}
                        >
                          Next Step
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Problem Solving Section */}
                {activeSection === 'problemSolving' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="text-2xl mr-2">🎯</span> Strategies & Tactics
                    </h3>
                    <div className="space-y-4">
                      {/* Add new strategy with tactics */}
                      <div className="bg-black/20 p-4 rounded-lg space-y-3">
                        <div>
                          <input
                            type="text"
                            value={newItem.strategy.approach}
                            onChange={(e) => setNewItem({
                              ...newItem,
                              strategy: { ...newItem.strategy, approach: e.target.value }
                            })}
                            placeholder="What's your high-level strategy? (e.g., 'Improve customer engagement through personalization')"
                            className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-white/50 text-sm mt-1 ml-1">A strategy is a broad approach or plan to achieve your goals</p>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newItem.strategy.newTactic}
                                onChange={(e) => setNewItem({
                                  ...newItem,
                                  strategy: { ...newItem.strategy, newTactic: e.target.value }
                                })}
                                placeholder="Add a specific tactic (e.g., 'Implement AI-driven product recommendations')"
                                className="flex-1 bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  if (newItem.strategy.newTactic) {
                                    setNewItem({
                                      ...newItem,
                                      strategy: {
                                        ...newItem.strategy,
                                        tactics: [...newItem.strategy.tactics, newItem.strategy.newTactic],
                                        newTactic: ''
                                      }
                                    });
                                  }
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg whitespace-nowrap"
                              >
                                Add Tactic
                              </button>
                            </div>
                            <p className="text-white/50 text-sm mt-1 ml-1">Tactics are specific, actionable steps to implement your strategy</p>
                          </div>
                          {/* Display tactics being added */}
                          {newItem.strategy.tactics.length > 0 && (
                            <div className="bg-black/20 rounded-lg p-3 space-y-2">
                              <h4 className="text-sm text-white/70">Added Tactics:</h4>
                              {newItem.strategy.tactics.map((tactic, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded">
                                  <span>{tactic}</span>
                                  <button
                                    onClick={() => {
                                      const newTactics = newItem.strategy.tactics.filter((_, i) => i !== idx);
                                      setNewItem({
                                        ...newItem,
                                        strategy: { ...newItem.strategy, tactics: newTactics }
                                      });
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (newItem.strategy.approach && newItem.strategy.tactics.length > 0) {
                                setActionPlan({
                                  ...actionPlan,
                                  problemSolving: [...actionPlan.problemSolving, {
                                    approach: newItem.strategy.approach,
                                    tactics: newItem.strategy.tactics
                                  }]
                                });
                                setNewItem({
                                  ...newItem,
                                  strategy: { approach: '', newTactic: '', tactics: [] }
                                });
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
                          >
                            Add Strategy
                          </button>
                        </div>
                      </div>

                      {/* Display strategies and their tactics */}
                      {actionPlan.problemSolving.map((strategy, index) => (
                        <div key={index} className="bg-black/20 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg">{strategy.approach}</h4>
                            <button
                              onClick={() => {
                                const newStrategies = actionPlan.problemSolving.filter((_, i) => i !== index);
                                setActionPlan({
                                  ...actionPlan,
                                  problemSolving: newStrategies
                                });
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="space-y-2">
                            {strategy.tactics.map((tactic, tacticsIdx) => (
                              <div key={tacticsIdx} className="bg-black/20 p-2 rounded-lg text-white/70">
                                • {tactic}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Navigation Buttons */}
                      <div className="mt-8 flex justify-between items-center">
                        <button
                          onClick={() => setActiveSection('analysis')}
                          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70"
                        >
                          ← Previous Step
                        </button>
                        <button
                          onClick={proceedToNext}
                          disabled={!canProceedToNext()}
                          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                            canProceedToNext()
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-white/10 text-white/50 cursor-not-allowed'
                          }`}
                        >
                          Next Step →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Section */}
                {activeSection === 'actions' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="text-2xl mr-2">⚡</span> Action Items
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-black/20 p-4 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={newItem.action.what}
                          onChange={(e) => setNewItem({
                            ...newItem,
                            action: { ...newItem.action, what: e.target.value }
                          })}
                          placeholder="What action will be taken?"
                          className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={newItem.action.why}
                          onChange={(e) => setNewItem({
                            ...newItem,
                            action: { ...newItem.action, why: e.target.value }
                          })}
                          placeholder="Why this action? (Justification)"
                          className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={newItem.action.how}
                          onChange={(e) => setNewItem({
                            ...newItem,
                            action: { ...newItem.action, how: e.target.value }
                          })}
                          placeholder="How will it be implemented?"
                          className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                        />
                        <textarea
                          value={newItem.action.expected}
                          onChange={(e) => setNewItem({
                            ...newItem,
                            action: { ...newItem.action, expected: e.target.value }
                          })}
                          placeholder="Expected results and impact..."
                          className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (newItem.action.what && newItem.action.why && newItem.action.how && newItem.action.expected) {
                                setActionPlan({
                                  ...actionPlan,
                                  actions: [...actionPlan.actions, newItem.action]
                                });
                                setNewItem({
                                  ...newItem,
                                  action: { what: '', why: '', how: '', expected: '' }
                                });
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
                          >
                            Add Action
                          </button>
                        </div>
                      </div>

                      {actionPlan.actions.map((action, index) => (
                        <div key={index} className="bg-black/20 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-lg">{action.what}</h4>
                            <button
                              onClick={() => {
                                const newActions = actionPlan.actions.filter((_, i) => i !== index);
                                setActionPlan({
                                  ...actionPlan,
                                  actions: newActions
                                });
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="space-y-2 text-white/70">
                            <p><strong>Why:</strong> {action.why}</p>
                            <p><strong>How:</strong> {action.how}</p>
                            <p><strong>Expected Results:</strong> {action.expected}</p>
                          </div>
                        </div>
                      ))}
                      <div className="mt-8 flex justify-between items-center">
                        <button
                          onClick={() => setActiveSection('problemSolving')}
                          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70"
                        >
                          ← Previous Step
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={proceedToNext}
                          disabled={!canProceedToNext()}
                          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                            canProceedToNext()
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-white/10 text-white/50 cursor-not-allowed'
                          }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleCompleteTask}
            className="bg-white text-blue-600 hover:text-blue-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
          >
            Complete Task
            <span>✓</span>
          </button>
        </div>
      </div>

      {achievements && achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="text-2xl mr-2">🏆</span> Available Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border-2 ${
                  achievement.unlocked
                    ? 'border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h5>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400">+{achievement.xp} XP</span>
                      {achievement.unlocked && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-lg">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
