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
