import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'demo' | 'blockchain';

interface ModeContextType {
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => void;
  toggleMode: () => void;
  isDemoMode: boolean;
  isBlockchainMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    // Load mode from localStorage on initialization
    const savedMode = localStorage.getItem('appMode');
    return (savedMode === 'blockchain' || savedMode === 'demo') ? savedMode : 'demo';
  });

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appMode', currentMode);
    
    // Dispatch custom event for backward compatibility with existing components
    window.dispatchEvent(new CustomEvent('modeChanged', { 
      detail: { mode: currentMode } 
    }));
  }, [currentMode]);

  const toggleMode = () => {
    setCurrentMode(prevMode => prevMode === 'demo' ? 'blockchain' : 'demo');
  };

  const isDemoMode = currentMode === 'demo';
  const isBlockchainMode = currentMode === 'blockchain';

  return (
    <ModeContext.Provider value={{
      currentMode,
      setCurrentMode,
      toggleMode,
      isDemoMode,
      isBlockchainMode
    }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

// Helper hook for backward compatibility
export function useModeStatus() {
  const { currentMode, isDemoMode, isBlockchainMode } = useMode();
  return {
    currentMode,
    isDemoMode,
    isBlockchainMode
  };
}
