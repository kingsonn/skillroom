'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { calculateUserLevel, checkAchievementUnlock } from '../lib/simulation';

export function useSimulation() {
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUserProgress();
  }, []);

  useEffect(() => {
    setLevel(calculateUserLevel(xp));
  }, [xp]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await supabase
          .from('simulation_progress')
          .select('*')
          .eq('user_id', user.id);

        const { data: xpData } = await supabase
          .from('user_xp')
          .select('xp')
          .eq('user_id', user.id)
          .single();

        if (progressData) {
          setUserProgress(progressData.reduce((acc, curr) => ({
            ...acc,
            [curr.simulation_id]: curr.progress
          }), {}));
        }

        if (xpData) {
          setXp(xpData.xp);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const startSimulation = (simulation) => {
    setCurrentSimulation(simulation);
    if (simulation.tasks?.[0]) {
      setTimeRemaining(simulation.tasks[0].timeLimit * 60);
    }
    setStats({
      startTime: Date.now(),
      completionTime: 0,
      designAccuracy: 0,
    });
  };

  const completeTask = async (taskId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update stats
      const updatedStats = {
        ...stats,
        completionTime: (Date.now() - stats.startTime) / 1000,
      };
      setStats(updatedStats);

      // Check achievements
      const unlockedAchievements = currentSimulation.achievements
        .filter(achievement => !achievements.includes(achievement.id))
        .filter(achievement => checkAchievementUnlock(achievement, updatedStats));

      // Calculate XP gain
      const achievementXP = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);
      const totalXP = currentSimulation.xpReward + achievementXP;

      // Update database
      const { data, error } = await supabase.from('simulation_progress').upsert({
        user_id: user.id,
        simulation_id: currentSimulation.id,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        achievements: unlockedAchievements.map(a => a.id),
        stats: updatedStats
      });

      await supabase.from('user_xp').upsert({
        user_id: user.id,
        xp: xp + totalXP
      });

      // Update state
      setXp(prev => prev + totalXP);
      setAchievements(prev => [...prev, ...unlockedAchievements.map(a => a.id)]);

      // Move to next task or complete simulation
      const currentTaskIndex = currentSimulation.tasks.findIndex(t => t.id === taskId);
      if (currentTaskIndex < currentSimulation.tasks.length - 1) {
        const nextTask = currentSimulation.tasks[currentTaskIndex + 1];
        setTimeRemaining(nextTask.timeLimit * 60);
      } else {
        setCurrentSimulation(null);
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return {
    currentSimulation,
    userProgress,
    xp,
    level,
    timeRemaining,
    achievements,
    stats,
    startSimulation,
    completeTask
  };
}
