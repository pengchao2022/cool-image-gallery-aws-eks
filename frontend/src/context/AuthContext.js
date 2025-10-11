import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    // 模拟登录API调用
    // 在实际应用中，这里应该调用您的后端API
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          username: email.split('@')[0],
          email: email,
          avatar: email[0].toUpperCase()
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  };

  const register = async (username, email, password) => {
    // 模拟注册API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          username: username,
          email: email,
          avatar: username[0].toUpperCase()
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