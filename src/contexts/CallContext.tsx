import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Call } from '../types';
import { CallService } from '../services/callService';
import { useAuth } from './AuthContext';

interface CallContextType {
  currentCall: Call | null;
  incomingCalls: Call[];
  isCallModalOpen: boolean;
  initiateCall: (chatId: string, participants: string[], type: 'voice' | 'video') => Promise<void>;
  answerCall: (callId: string) => Promise<void>;
  declineCall: (callId: string) => Promise<void>;
  endCall: (callId: string) => Promise<void>;
  playRingtone: () => void;
  stopRingtone: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingCalls, setIncomingCalls] = useState<Call[]>([]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const callSubscriptionRef = useRef<(() => void) | null>(null);

  // Initialize ringtone audio
  useEffect(() => {
    ringtoneRef.current = new Audio('/SONIDO DE LLAMADA.mp3');
    ringtoneRef.current.loop = true;
    ringtoneRef.current.volume = 0.7;

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = CallService.subscribeToIncomingCalls(currentUser.uid, (calls) => {
      console.log('Incoming calls updated:', calls);
      setIncomingCalls(calls);

      // Find new incoming calls (ringing status and not initiated by current user)
      const newIncomingCalls = calls.filter(call => 
        call.status === 'ringing' && 
        call.initiatorId !== currentUser.uid &&
        !currentCall
      );

      if (newIncomingCalls.length > 0) {
        const latestCall = newIncomingCalls[0];
        setCurrentCall(latestCall);
        setIsCallModalOpen(true);
        playRingtone();

        // Subscribe to this specific call for status updates
        if (callSubscriptionRef.current) {
          callSubscriptionRef.current();
        }
        
        callSubscriptionRef.current = CallService.subscribeToCall(latestCall.id, (updatedCall) => {
          if (updatedCall) {
            setCurrentCall(updatedCall);
            
            // Stop ringtone and close modal when call ends or is declined
            if (updatedCall.status === 'ended' || updatedCall.status === 'declined') {
              stopRingtone();
              setIsCallModalOpen(false);
              setCurrentCall(null);
              if (callSubscriptionRef.current) {
                callSubscriptionRef.current();
                callSubscriptionRef.current = null;
              }
            } else if (updatedCall.status === 'active') {
              stopRingtone();
            }
          } else {
            // Call was deleted
            stopRingtone();
            setIsCallModalOpen(false);
            setCurrentCall(null);
            if (callSubscriptionRef.current) {
              callSubscriptionRef.current();
              callSubscriptionRef.current = null;
            }
          }
        });
      }
    });

    return unsubscribe;
  }, [currentUser, currentCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callSubscriptionRef.current) {
        callSubscriptionRef.current();
      }
      stopRingtone();
      CallService.cleanupWebRTC();
    };
  }, []);

  // Cleanup calls on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        CallService.cleanupUserCalls(currentUser.uid);
      }
      CallService.cleanupWebRTC();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser]);

  const playRingtone = () => {
    if (ringtoneRef.current) {
      try {
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current.play().catch(error => {
          console.warn('Could not play ringtone:', error);
        });
      } catch (error) {
        console.warn('Error playing ringtone:', error);
      }
    }
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const initiateCall = async (chatId: string, participants: string[], type: 'voice' | 'video') => {
    if (!currentUser) return;

    try {
      const callId = await CallService.initiateCall(chatId, currentUser.uid, participants, type);
      
      // Subscribe to the call we just created
      if (callSubscriptionRef.current) {
        callSubscriptionRef.current();
      }

      callSubscriptionRef.current = CallService.subscribeToCall(callId, (call) => {
        if (call) {
          setCurrentCall(call);
          setIsCallModalOpen(true);

          if (call.status === 'ended' || call.status === 'declined') {
            setIsCallModalOpen(false);
            setCurrentCall(null);
            if (callSubscriptionRef.current) {
              callSubscriptionRef.current();
              callSubscriptionRef.current = null;
            }
          }
        }
      });

    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to start call');
    }
  };

  const answerCall = async (callId: string) => {
    if (!currentUser) return;

    try {
      await CallService.answerCall(callId, currentUser.uid);
      stopRingtone();
    } catch (error) {
      console.error('Error answering call:', error);
      alert('Failed to answer call');
    }
  };

  const declineCall = async (callId: string) => {
    if (!currentUser) return;

    try {
      await CallService.declineCall(callId, currentUser.uid);
      stopRingtone();
      setIsCallModalOpen(false);
      setCurrentCall(null);
      
      if (callSubscriptionRef.current) {
        callSubscriptionRef.current();
        callSubscriptionRef.current = null;
      }
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const endCall = async (callId: string) => {
    try {
      await CallService.endCall(callId);
      stopRingtone();
      setIsCallModalOpen(false);
      setCurrentCall(null);
      
      if (callSubscriptionRef.current) {
        callSubscriptionRef.current();
        callSubscriptionRef.current = null;
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const value = {
    currentCall,
    incomingCalls,
    isCallModalOpen,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    playRingtone,
    stopRingtone
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
