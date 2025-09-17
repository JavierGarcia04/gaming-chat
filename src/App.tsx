import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CallProvider, useCall } from './contexts/CallContext';
import { GlobalStyle } from './styles/GlobalStyles';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import CallModal from './components/CallModal';
import { UserService } from './services/userService';
import { User } from './types';

const AppRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { currentCall, answerCall, declineCall, endCall } = useCall();
  const [otherUser, setOtherUser] = React.useState<User | null>(null);

  // Load other user data for direct calls
  React.useEffect(() => {
    if (currentCall && currentCall.participants.length === 2) {
      const otherUserId = currentCall.participants.find(id => id !== currentUser?.uid);
      if (otherUserId) {
        UserService.getUser(otherUserId).then(setOtherUser);
      }
    }
  }, [currentCall, currentUser]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2f3136 0%, #36393f 50%, #3c4043 100%)',
        color: '#f1f3f4'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(102, 126, 234, 0.2)',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          letterSpacing: '0.025em'
        }}>
          Loading...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
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
      
      {currentUser && currentCall && (
        <CallModal
          call={currentCall}
          currentUser={currentUser}
          otherUser={otherUser || undefined}
          onAnswer={() => answerCall(currentCall.id)}
          onDecline={() => declineCall(currentCall.id)}
          onEnd={() => endCall(currentCall.id)}
        />
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CallProvider>
          <GlobalStyle />
          <AppRoutes />
        </CallProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
