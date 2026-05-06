import React, { ReactNode, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar'; 

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const getActiveTab = (pathname: string): 'home' | 'appointments' | 'favorites' | 'profile' | 'admin' | null => {
    if (pathname.startsWith('/explore')) return 'home';
    if (pathname.startsWith('/appointments')) return 'appointments';
    if (pathname.startsWith('/my-favorites') || pathname.startsWith('/favorites')) return 'favorites';
    if (pathname.startsWith('/user-profile') || pathname.startsWith('/profile')) return 'profile';
    if (pathname.startsWith('/admin')) return 'admin';
    return null; 
  };

  const activeTab = getActiveTab(location.pathname);

  const showBottomTabBar = [
    '/explore',
    '/appointments',
    '/my-favorites',
    '/favorites',
    '/user-profile',
    '/profile',
    '/business',
    '/admin'
  ].some(path => location.pathname.startsWith(path));

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden bg-[#f6f8f8] dark:bg-[#101f22] text-slate-900 dark:text-white transition-colors duration-200"
      aria-label="Main application layout"
    >
      <main className="flex-grow relative overflow-y-auto no-scrollbar"> 
        {children}
      </main>

      {showBottomTabBar && activeTab && <BottomTabBar activeTab={activeTab} />}
    </div>
  );
};

export default memo(MainLayout);