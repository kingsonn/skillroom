// Simulation data and types
export const SIMULATION_TYPES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  FULLSTACK: 'fullstack',
  DEVOPS: 'devops',
  MOBILE: 'mobile',
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const SKILL_CATEGORIES = {
  LANGUAGES: 'Programming Languages',
  FRAMEWORKS: 'Frameworks',
  TOOLS: 'Tools',
  CONCEPTS: 'Concepts',
};

export const simulations = [
  {
    id: 'frontend-dashboard',
    type: SIMULATION_TYPES.FRONTEND,
    title: "Dashboard Redesign",
    description: "Transform a complex dashboard into a user-friendly interface using React and modern UI principles.",
    duration: "2-3 hours",
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    xpReward: 500,
    skills: ['React', 'TypeScript', 'UI/UX'],
    prerequisites: ['HTML', 'CSS', 'JavaScript'],
    achievements: [
      {
        id: "speed_demon",
        title: "Speed Demon",
        description: "Complete the task in under 20 minutes",
        icon: "⚡",
        xp: 100
      },
      {
        id: "pixel_perfect",
        title: "Pixel Perfect",
        description: "Match the design exactly",
        icon: "🎯",
        xp: 150
      }
    ],
    brief: {
      overview: "As a Frontend Developer at TechStart Inc., you've been tasked with redesigning the company's analytics dashboard.",
      context: "The current dashboard is functional but lacks modern design principles and user-friendly features.",
      objectives: [
        "Analyze current dashboard pain points",
        "Create wireframes for the new design",
        "Implement responsive components",
        "Add interactive data visualizations"
      ],
      rolePlay: {
        character: "Junior Frontend Developer",
        team: "UI/UX Team",
        manager: "Sarah Chen, Senior UI/UX Designer",
        scenario: "You've just joined TechStart Inc.'s UI/UX team. Your first major project is to modernize the company's analytics dashboard, which has been a pain point for users."
      }
    },
    resources: {
      documentation: [
        {
          title: "React Documentation",
          url: "https://react.dev",
          type: "Official Docs",
          tags: ['React', 'Frontend', 'Components']
        },
        {
          title: "Material-UI Components",
          url: "https://mui.com/components/",
          type: "Component Library",
          tags: ['UI', 'Components', 'Design']
        }
      ],
      tools: [
        {
          name: "Figma",
          purpose: "UI Design and Prototyping",
          icon: "🎨",
          link: "https://www.figma.com"
        },
        {
          name: "Chrome DevTools",
          purpose: "Testing and Debugging",
          icon: "🔧",
          link: "https://developers.google.com/web/tools/chrome-devtools"
        }
      ],
      tips: [
        "Start with mobile-first design",
        "Use CSS Grid for layout",
        "Implement proper error handling",
        "Add loading states for better UX"
      ]
    }
  },
  // Add more simulations here
];

export function getSimulationById(id) {
  return simulations.find(sim => sim.id === id);
}

export function getSimulationsByType(type) {
  return simulations.filter(sim => sim.type === type);
}

export function getSimulationsByDifficulty(difficulty) {
  return simulations.filter(sim => sim.difficulty === difficulty);
}

export function calculateUserLevel(xp) {
  return Math.floor(xp / 1000) + 1;
}

export function getNextLevelXP(currentXP) {
  const currentLevel = calculateUserLevel(currentXP);
  return currentLevel * 1000;
}

export function calculateProgress(currentXP) {
  const nextLevelXP = getNextLevelXP(currentXP);
  const currentLevelXP = (calculateUserLevel(currentXP) - 1) * 1000;
  return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}

export function checkAchievementUnlock(achievement, stats) {
  switch (achievement.id) {
    case 'speed_demon':
      return stats.completionTime < 1200; // 20 minutes
    case 'pixel_perfect':
      return stats.designAccuracy >= 95;
    default:
      return false;
  }
}
