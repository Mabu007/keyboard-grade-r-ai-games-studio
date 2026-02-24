import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateSessionId } from '../utils/helpers';

interface SessionContextType {
  sessionId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Keep session ID logic just for "Profile" consistency, even if local
    const existing = sessionStorage.getItem('grade_r_session');
    const sid = existing || generateSessionId();
    if (!existing) sessionStorage.setItem('grade_r_session', sid);
    setSessionId(sid);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};