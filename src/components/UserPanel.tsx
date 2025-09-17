import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, StatusIndicator } from '../styles/GlobalStyles';
import { Settings, LogOut, Mic, MicOff, Headphones } from 'lucide-react';

const Panel = styled.div`
  padding: 16px 20px;
  background: linear-gradient(135deg, #1e1f23 0%, #292b2f 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  color: #f1f3f4;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  margin-bottom: 2px;
`;

const UserStatus = styled.div`
  color: #a0a6b0;
  font-size: 13px;
  text-transform: capitalize;
  opacity: 0.9;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #667eea;
    opacity: 1;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 6px;
`;

interface ControlButtonProps {
  active?: boolean;
}

const ControlButton = styled.button<ControlButtonProps>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ active }) => active ? '#00d26a' : '#a0a6b0'};
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: ${({ active }) => active ? '#00d26a' : '#f1f3f4'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &.danger {
    &:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-color: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }

  ${({ active }) => active && `
    background: rgba(0, 210, 106, 0.15);
    border-color: rgba(0, 210, 106, 0.3);
    box-shadow: 0 0 0 2px rgba(0, 210, 106, 0.1);
  `}
`;

interface StatusMenuProps {
  show: boolean;
}

const StatusMenu = styled.div<StatusMenuProps>`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: linear-gradient(135deg, #1a1b1e 0%, #2f3136 100%);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  display: ${({ show }) => show ? 'block' : 'none'};
  z-index: 1000;
  min-width: 140px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${({ show }) => show ? 'slideUp 0.2s ease-out' : 'none'};

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface StatusOptionProps {
  status: string;
}

const StatusOption = styled.div<StatusOptionProps>`
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: #f1f3f4;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  margin: 2px 0;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: translateX(2px);
  }

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background-color: ${({ status }) => {
      switch (status) {
        case 'online': return '#00d26a';
        case 'away': return '#fbbf24';
        case 'busy': return '#ef4444';
        case 'offline': return '#6b7280';
        default: return '#6b7280';
      }
    }};
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
  }
`;

const UserPanel: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  if (!currentUser) return null;

  const handleStatusChange = async (status: 'online' | 'away' | 'busy' | 'offline') => {
    try {
      // This would be implemented with UserService.updateUserStatus
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Panel>
      <UserInfo>
        <div 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowStatusMenu(!showStatusMenu)}
        >
          <Avatar size={32}>
            {currentUser.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <StatusIndicator status={currentUser.status} />
          
          <StatusMenu show={showStatusMenu}>
            <StatusOption status="online" onClick={() => handleStatusChange('online')}>
              Online
            </StatusOption>
            <StatusOption status="away" onClick={() => handleStatusChange('away')}>
              Away
            </StatusOption>
            <StatusOption status="busy" onClick={() => handleStatusChange('busy')}>
              Do Not Disturb
            </StatusOption>
            <StatusOption status="offline" onClick={() => handleStatusChange('offline')}>
              Invisible
            </StatusOption>
          </StatusMenu>
        </div>
        
        <UserDetails>
          <UserName>{currentUser.displayName}</UserName>
          <UserStatus 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(currentUser.friendCode);
              alert('Código de amigo copiado al portapapeles!');
            }}
            title="Haz clic para copiar tu código de amigo"
          >
            #{currentUser.friendCode}
          </UserStatus>
        </UserDetails>
      </UserInfo>

      <Controls>
        <ControlButton
          active={!isMuted}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </ControlButton>
        
        <ControlButton
          active={!isDeafened}
          onClick={() => setIsDeafened(!isDeafened)}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          <Headphones size={16} />
        </ControlButton>
        
        <ControlButton title="User Settings">
          <Settings size={16} />
        </ControlButton>
        
        <ControlButton 
          className="danger" 
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
        </ControlButton>
      </Controls>
    </Panel>
  );
};

export default UserPanel;
