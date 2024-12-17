'use client';

import { useState } from 'react';
import { FiX, FiUser, FiBriefcase, FiHeart, FiMapPin, FiBook, FiTarget, FiAward, FiChevronDown, FiShield, FiCode, FiCpu, FiUsers, FiStar, FiCompass } from 'react-icons/fi';
import { createClient } from '../utils/supabase/client';

export function WelcomePopup({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    location: '',
    educationLevel: 'high_school',
    professionalBackground: 'student',
    primaryCareerInterest: 'technology',
    skillSet: '',
    careerGoals: '',
    hobbies: ''
  });
  const [selectedSkills, setSelectedSkills] = useState(formData.skillSet ? formData.skillSet.split(',').map(s => s.trim()).filter(Boolean) : []);

  const supabase = createClient();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      const newSkill = value.slice(0, -1).trim();
      if (newSkill && !selectedSkills.includes(newSkill)) {
        const newSkills = [...selectedSkills, newSkill];
        setSelectedSkills(newSkills);
        handleInputChange({
          target: {
            name: 'skillSet',
            value: newSkills.join(', ')
          }
        });
      }
      // Clear the input after adding skill
      handleInputChange({
        target: {
          name: 'skillSet',
          value: ''
        }
      });
    } else {
      handleInputChange(e);
    }
  };

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      handleInputChange({
        target: {
          name: 'skillSet',
          value: ''
        }
      });
      // Update the hidden input that stores all skills
      handleInputChange({
        target: {
          name: 'allSkills',
          value: newSkills.join(', ')
        }
      });
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    handleInputChange({
      target: {
        name: 'allSkills',
        value: newSkills.join(', ')
      }
    });
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
     

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          age: formData.age,
          location: formData.location,
          
          preferences: formData.hobbies,
          first_time: false,
          professional_profile:{education_level: formData.educationLevel,
            professional_background: formData.professionalBackground,
            primary_career_interest: formData.primaryCareerInterest,
            skill_set: formData.skillSet,
            career_goals: formData.careerGoals},
          
        })
        .eq('email', localStorage.getItem('userEmail'));

      if (error) throw error;
      
      onClose(); // Close the popup after successful submission
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { 
      icon: FiUser, 
      label: "Character Creation",
      description: "Create your avatar"
    },
    { 
      icon: FiBriefcase, 
      label: "Choose Your Path",
      description: "Select your journey"
    },
    { 
      icon: FiHeart, 
      label: "Set Your Quest",
      description: "Define your mission"
    }
  ];

  const educationOptions = [
    { value: 'high_school', label: 'Apprentice (High School)', icon: FiStar },
    { value: 'undergraduate', label: 'Scholar (Undergraduate)', icon: FiBook },
    { value: 'postgraduate', label: 'Master (Postgraduate)', icon: FiAward },
    { value: 'masters', label: 'Grand Master', icon: FiAward }
  ];

  const backgroundOptions = [
    { value: 'student', label: 'Adventurer (Student)', icon: FiCompass },
    { value: 'working_professional', label: 'Warrior (Professional)', icon: FiShield },
    { value: 'job_seeker', label: 'Explorer (Job Seeker)', icon: FiTarget }
  ];

  const careerOptions = [
    { value: 'technology', label: 'Tech Mage', icon: FiCpu },
    { value: 'management', label: 'Guild Leader', icon: FiUsers },
    { value: 'creative', label: 'Creative Artisan', icon: FiHeart },
    { value: 'services', label: 'Support Hero', icon: FiBriefcase },
    { value: 'no_idea', label: 'Undecided Adventurer', icon: FiCompass }
  ];

  const commonSkills = [
    { category: "Programming", skills: ["JavaScript", "Python", "Java", "C++", "React", "Node.js"] },
    { category: "Design", skills: ["UI/UX", "Figma", "Adobe XD", "Photoshop", "Illustration"] },
    { category: "Soft Skills", skills: ["Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management"] },
    { category: "Data", skills: ["SQL", "Data Analysis", "Machine Learning", "Excel", "Tableau"] },
    { category: "Other", skills: ["Project Management", "Marketing", "Content Writing", "SEO", "Social Media"] }
  ];

  const CustomSelect = ({ options, value, onChange, name, question }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{question}</div>
        <div className="relative group">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 bg-gray-50 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              {selectedOption && (
                <>
                  <selectedOption.icon className="h-4 w-4 text-blue-500" />
                  <span>{selectedOption.label}</span>
                </>
              )}
            </div>
            <FiChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange({ target: { name, value: option.value } });
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                    option.value === value ? 'bg-blue-100 dark:bg-gray-600' : ''
                  }`}
                >
                  <option.icon className="h-4 w-4 text-blue-500" />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    What shall we call you, brave adventurer?
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                      placeholder="Choose your username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    What level have you achieved in this realm?
                  </div>
                  <div className="relative group">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                      placeholder="Enter your age"
                      min="13"
                      max="120"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    From which realm do you hail?
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
                <CustomSelect
                  options={educationOptions}
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  name="educationLevel"
                  question="What is your current training level?"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                options={backgroundOptions}
                value={formData.professionalBackground}
                onChange={handleInputChange}
                name="professionalBackground"
                question="Choose your character class"
              />
              <CustomSelect
                options={careerOptions}
                value={formData.primaryCareerInterest}
                onChange={handleInputChange}
                name="primaryCareerInterest"
                question="Select your destiny path"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What special abilities have you mastered?
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type="text"
                    name="skillSet"
                    value={formData.skillSet}
                    onChange={handleSkillsChange}
                    className="w-full px-4 py-2 bg-gray-50 border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                    placeholder="Type a skill and press comma to add..."
                  />
                  <input 
                    type="hidden"
                    name="allSkills"
                    value={selectedSkills.join(', ')}
                  />
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1">
                    {selectedSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="group px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 p-1">
                    {commonSkills.map((category, index) => (
                      <div key={index} className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-800 py-1">
                          {category.category}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {category.skills.map((skill, skillIndex) => (
                            <button
                              key={skillIndex}
                              onClick={() => addSkill(skill)}
                              className={`px-2 py-0.5 text-xs rounded-full transition-all transform hover:scale-105 
                                ${selectedSkills.includes(skill)
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-purple-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What legendary achievements do you seek?
              </div>
              <div className="relative group">
                <textarea
                  name="careerGoals"
                  value={formData.careerGoals}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border-2 border-green-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                  rows="2"
                  placeholder="Describe your career goals..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What side quests interest you?
              </div>
              <div className="relative group">
                <textarea
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border-2 border-green-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all"
                  rows="2"
                  placeholder="Share your hobbies..."
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute top-3 right-3">
          {/* <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button> */}
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiAward className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Begin Your Adventure!
              </h1>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Create your character and embark on your journey
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        index + 1 === currentStep
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : index + 1 < currentStep
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <step.icon
                        className={`w-6 h-6 ${
                          index + 1 === currentStep
                            ? 'text-blue-500'
                            : index + 1 < currentStep
                            ? 'text-green-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-20 h-0.5 mx-1 ${
                        index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 mb-6">
            {renderStep()}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className={`px-6 py-2 rounded-lg transition-all transform hover:scale-105 ${
                currentStep === 1
                  ? 'invisible'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              Back
            </button>
            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 hover:shadow-lg"
            >
              {currentStep === 3 ? 'Complete Quest' : 'Continue Journey'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
