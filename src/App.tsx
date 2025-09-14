import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalStyle } from './styles/GlobalStyles';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';

const AppRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#36393f',
        color: '#dcddde'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={currentUser ? <Navigate to="/chat" /> : <LandingPage />} 
      />
      <Route 
        path="/chat" 
        element={currentUser ? <ChatInterface /> : <Navigate to="/" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyle />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
