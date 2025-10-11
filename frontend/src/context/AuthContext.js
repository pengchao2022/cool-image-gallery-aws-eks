import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Date.now(),
          username: email.split('@')[0],
          email: email,
          avatar: email[0].toUpperCase(),
          registrationDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  };

  const register = async (username, email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Date.now(),
          username: username,
          email: email,
          avatar: username[0].toUpperCase(),
          registrationDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};