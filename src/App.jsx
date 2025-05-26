import React, { useEffect, useState } from 'react';
import { Calendar } from './components/Calendar';
import { EventProvider } from './context/EventContext';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-primary transition-colors duration-200">
      <header className="bg-white dark:bg-dark-secondary shadow-sm py-4 px-6 border-b dark:border-dark-border transition-colors duration-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Event Calendar</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-dark-hover text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-hover/80 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      
      <main className="container mx-auto py-6">
        <EventProvider>
          <Calendar />
        </EventProvider>
      </main>
    </div>
  );
}

export default App;