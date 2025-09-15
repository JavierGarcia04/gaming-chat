import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import { Call, User } from '../types';
import { CallService } from '../services/callService';
import { Avatar } from '../styles/GlobalStyles';

const CallOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #2c2f36 0%, #1e2124 100%);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: white;
`;

const CallContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px;
  max-width: 400px;
  width: 100%;
`;

const CallerInfo = styled.div`
  margin-bottom: 40px;
`;

const CallerName = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #dcddde;
`;

const CallStatus = styled.p`
  font-size: 16px;
  color: #72767d;
  margin: 0;
`;

const CallType = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  color: #72767d;
  font-size: 14px;
`;

const CallActions = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
`;

const CallButton = styled.button<{ variant?: 'accept' | 'decline' | 'control' }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant }) => {
    switch (variant) {
      case 'accept':
        return `
          background-color: #00d26a;
          &:hover { background-color: #00b85c; }
        `;
      case 'decline':
        return `
          background-color: #f04747;
          &:hover { background-color: #d73c3c; }
        `;
      default:
        return `
          background-color: #40444b;
          &:hover { background-color: #484c52; }
        `;
    }
  }}
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  background-color: #2f3136;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const LocalVideo = styled.video`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  background-color: #40444b;
  z-index: 10;
`;

const RemoteVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #2f3136;
`;

const CallTimer = styled.div`
  font-size: 18px;
  color: #dcddde;
  margin-bottom: 20px;
  font-weight: 500;
`;

interface CallModalProps {
  call: Call | null;
  currentUser: User;
  otherUser?: User;
  onAnswer: () => void;
  onDecline: () => void;
  onEnd: () => void;
}

const CallModal: React.FC<CallModalProps> = ({
  call,
  currentUser,
  otherUser,
  onAnswer,
  onDecline,
  onEnd
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [, setRemoteStream] = useState<MediaStream | null>(null);

  // Timer effect for active calls
  useEffect(() => {
    if (call?.status === 'active') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [call?.status]);

  // Initialize video streams
  useEffect(() => {
    if (call && call.status === 'active') {
      const initializeStreams = async () => {
        try {
          const stream = await CallService.initializeWebRTC(call.type === 'video');
          setLocalStream(stream);
          
          if (localVideoRef.current && call.type === 'video') {
            localVideoRef.current.srcObject = stream;
          }
          
          setIsVideoEnabled(call.type === 'video');
        } catch (error) {
          console.error('Error initializing streams:', error);
        }
      };

      initializeStreams();
    }

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [call, localStream]);

  // Handle remote stream
  useEffect(() => {
    const remote = CallService.getRemoteStream();
    if (remote && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remote;
      setRemoteStream(remote);
    }
  }, [call, localStream]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const muted = CallService.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = () => {
    const enabled = CallService.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const getCallerName = (): string => {
    if (!call) return 'Unknown';
    
    if (call.type === 'voice' || call.type === 'video') {
      if (call.initiatorId === currentUser.uid) {
        return otherUser?.displayName || 'Unknown User';
      } else {
        return otherUser?.displayName || 'Unknown User';
      }
    }
    
    return 'Group Call';
  };

  const getCallStatus = (): string => {
    if (!call) return '';
    
    switch (call.status) {
      case 'ringing':
        return call.initiatorId === currentUser.uid ? 'Calling...' : 'Incoming call';
      case 'active':
        return 'Connected';
      default:
        return '';
    }
  };

  const isIncoming = call && call.initiatorId !== currentUser.uid && call.status === 'ringing';
  const isActive = call?.status === 'active';
  const showVideo = call?.type === 'video' && isActive;

  if (!call || call.status === 'ended' || call.status === 'declined') {
    return null;
  }

  return (
    <CallOverlay show={true}>
      <CallContent>
        {showVideo ? (
          <VideoContainer>
            <RemoteVideo ref={remoteVideoRef} autoPlay playsInline />
            {isVideoEnabled && (
              <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
            )}
          </VideoContainer>
        ) : (
          <CallerInfo>
            <Avatar size={120}>
              {getCallerName().charAt(0).toUpperCase()}
            </Avatar>
            <CallerName>{getCallerName()}</CallerName>
            <CallStatus>{getCallStatus()}</CallStatus>
            <CallType>
              {call.type === 'video' ? (
                <>
                  <Video size={16} />
                  Video call
                </>
              ) : (
                <>
                  <Phone size={16} />
                  Voice call
                </>
              )}
              {call.participants.length > 2 && (
                <>
                  <Users size={16} />
                  Group call
                </>
              )}
            </CallType>
          </CallerInfo>
        )}

        {isActive && (
          <CallTimer>{formatDuration(callDuration)}</CallTimer>
        )}

        <CallActions>
          {isIncoming ? (
            <>
              <CallButton variant="decline" onClick={onDecline} title="Decline call">
                <PhoneOff size={24} />
              </CallButton>
              <CallButton variant="accept" onClick={onAnswer} title="Answer call">
                <Phone size={24} />
              </CallButton>
            </>
          ) : (
            <>
              {isActive && (
                <>
                  <CallButton variant="control" onClick={handleToggleMute} title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </CallButton>
                  {call.type === 'video' && (
                    <CallButton variant="control" onClick={handleToggleVideo} title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}>
                      {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                    </CallButton>
                  )}
                </>
              )}
              <CallButton variant="decline" onClick={onEnd} title="End call">
                <PhoneOff size={24} />
              </CallButton>
            </>
          )}
        </CallActions>
      </CallContent>
    </CallOverlay>
  );
};

export default CallModal;
