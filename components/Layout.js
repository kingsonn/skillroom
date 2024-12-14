'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FiMenu } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { SignInModal } from './SignInModal';
import { WelcomePopup } from './WelcomePopup';
import { signout } from '../lib/auth-actions';
import { ensureUserProfile } from '../utils/profile-utils';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const isFirstLogin = !localStorage.getItem('hasLoggedInBefore');
          if (isFirstLogin) {
            localStorage.setItem('hasLoggedInBefore', 'true');
            setShowWelcomePopup(true);
          }
          const isNew = await checkNew(session.user.email);
          if (isNew) {
            setShowWelcomePopup(true);
          }
          localStorage.setItem('userEmail', session.user.email);
          setUserEmail(session.user.email);
          // Ensure user profile exists
          await ensureUserProfile(session.user.email);
         
        } else {
          const savedEmail = localStorage.getItem('userEmail');
          if (savedEmail) {
            setUserEmail(savedEmail);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email) {
        const isFirstLogin = !localStorage.getItem('hasLoggedInBefore');
        if (isFirstLogin) {
          localStorage.setItem('hasLoggedInBefore', 'true');
          setShowWelcomePopup(true);
        }
        localStorage.setItem('userEmail', session.user.email);
        setUserEmail(session.user.email);
     
      } else if (event === 'SIGNED_OUT') {
        // Don't remove email from localStorage on sign out
        setUserEmail(localStorage.getItem('userEmail'));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signout();
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      // Keep the email in localStorage but update the state
      setUserEmail(localStorage.getItem('userEmail'));
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-18'}`}
      >
        <header 
          className={`h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 fixed top-0 z-40 transition-all duration-300
            ${isSidebarOpen ? 'lg:left-64' : 'lg:left-18'} left-0 right-0`}
        >
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Toggle Sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {userEmail ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {userEmail}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 mt-16">
          {children}
        </main>
      </div>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />

      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />
    </div>
  );
}
