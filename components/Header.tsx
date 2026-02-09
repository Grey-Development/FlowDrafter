import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-700 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Grey <span className="text-emerald-700">Development</span>
            </h1>
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-widest leading-none">
              FlowDrafter - Irrigation Design
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Design Engine Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
