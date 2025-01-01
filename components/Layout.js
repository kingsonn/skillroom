'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FiMenu } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { WelcomePopup } from './WelcomePopup';
import { signout } from '../lib/auth-actions';
import Sidebar from './Sidebar';
import { useWeb3Auth } from '../context/Web3AuthContext';
import { type } from 'os';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { login, logout,initt, user: web3AuthUser, web3auth,tokenclaim, provider, balanceToken } = useWeb3Auth();
  const [tokenBalance, setTokenBalance] = useState("0");

  useEffect(() => {
    handleWeb3Login();
    
  }, [provider]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (web3AuthUser) {
        try {
          const balance = await balanceToken();
          setTokenBalance(balance.toString());
          console.log(typeof balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      }
    };
    fetchBalance();
  }, [initt, provider, tokenclaim]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const isFirstLogin = !localStorage.getItem('hasLoggedInBefore');
          if (isFirstLogin) {
            localStorage.setItem('hasLoggedInBefore', 'true');
            setShowWelcomePopup(true);
          }
          localStorage.setItem('userEmail', session.user.email);
          setUserEmail(session.user.email);
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
        setUserEmail(localStorage.getItem('userEmail'));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleWeb3Login = async () => {
    try {
      await login();
      const userInfo = await web3auth.getUserInfo();
      if (userInfo?.email) {
        localStorage.setItem('userEmail', userInfo.email);
        setUserEmail(userInfo.email);
        await ensureUserProfile(userInfo.email);
      }
    } catch (error) {
      console.error('Web3Auth login error:', error);
    }
  };

  const handleWeb3Logout = async () => {
    try {
      await logout();
      await supabase.auth.signOut();
      localStorage.removeItem('userEmail'); 
      setUserEmail(null);
      localStorage.setItem('userReload', 'false');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      await signout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
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
            {!isLoading && (
              <>
                {web3AuthUser ? (
                  <div className="flex items-center space-x-4">
                    {tokenBalance !== null && (
                      <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          ✨ {tokenBalance} Learning Points
                        </span>
                      </div>
                    )}
                    {web3AuthUser.profileImage && (
                      <img 
                        src={web3AuthUser.profileImage} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {web3AuthUser.name || web3AuthUser.email}
                    </span>
                    <button
                      onClick={handleWeb3Logout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleWeb3Login}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 mt-16">
          {children}
        </main>

        <WelcomePopup
          isOpen={showWelcomePopup}
          onClose={() => setShowWelcomePopup(false)}
        />
      </div>
    </div>
  );
}
