'use client';

import { FiMenu, FiHome, FiLayout, FiBook, FiUser, FiInfo, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/learning', label: 'Learning', icon: FiBook },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${isOpen ? 'w-64' : 'lg:w-18'}`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 pt-2">
            <h1 className={`text-xl font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0'}`}>
              SkillRoom
            </h1>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Close Sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:hidden'}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Footer content if needed */}
          </div>
        </div>
      </div>
    </>
  );
}
