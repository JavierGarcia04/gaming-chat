import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, StatusIndicator } from '../styles/GlobalStyles';
import { Settings, LogOut, Mic, MicOff, Headphones } from 'lucide-react';

const Panel = styled.div`
  padding: 10px;
  background-color: #292b2f;
  border-top: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
`;

const UserStatus = styled.div`
  color: #72767d;
  font-size: 12px;
  text-transform: capitalize;
`;

const Controls = styled.div`
  display: flex;
  gap: 4px;
`;

interface ControlButtonProps {
  active?: boolean;
}

const ControlButton = styled.button<ControlButtonProps>`
  background: none;
  border: none;
  color: ${({ active }) => active ? '#23a559' : '#72767d'};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #40444b;
    color: ${({ active }) => active ? '#23a559' : '#dcddde'};
  }

  &.danger:hover {
    background-color: #ed4245;
    color: white;
  }
`;

interface StatusMenuProps {
  show: boolean;
}

const StatusMenu = styled.div<StatusMenuProps>`
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: #18191c;
  border-radius: 6px;
  padding: 6px;
  margin-bottom: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  display: ${({ show }) => show ? 'block' : 'none'};
  z-index: 1000;
  min-width: 120px;
`;

interface StatusOptionProps {
  status: string;
}

const StatusOption = styled.div<StatusOptionProps>`
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #dcddde;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5865f2;
  }

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ status }) => {
      switch (status) {
        case 'online': return '#3ba55c';
        case 'away': return '#faa61a';
        case 'busy': return '#ed4245';
        case 'offline': return '#747f8d';
        default: return '#747f8d';
      }
    }};
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
