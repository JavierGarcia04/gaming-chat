import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { MainContainer, Sidebar, ChatArea } from '../styles/GlobalStyles';
import FriendsList from './FriendsList';
import ChatWindow from './ChatWindow';
import UserPanel from './UserPanel';
import { Chat, User } from '../types';
import { ChatService } from '../services/chatService';
import { UserService } from '../services/userService';
import { FriendService } from '../services/friendService';
import { Users, Plus } from 'lucide-react';

const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(10px);
`;

const SidebarTitle = styled.h2`
  color: #f1f3f4;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a0a6b0;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f3f4;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChatsList = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 10px;
  min-height: 0;
`;

const Modal = styled.div<{ show: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: ${({ show }) => show ? 'fadeIn 0.3s ease' : 'none'};

  @keyframes fadeIn {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #2f3136 0%, #36393f 100%);
  border-radius: 16px;
  padding: 32px;
  width: 540px;
  max-width: 92vw;
  max-height: 85vh;
  overflow: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalTitle = styled.h3`
  color: #f1f3f4;
  margin: 0 0 24px 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
`;

const ModalSection = styled.div`
  margin-top: 20px;
`;

const Label = styled.label`
  display: block;
  color: #f1f3f4;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.025em;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: #f1f3f4;
  outline: none;
  font-size: 15px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    border-color: #667eea;
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0a6b0;
  }
`;

const FriendsSelectList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #2f3136;
  border: 1px solid #202225;
  border-radius: 8px;
`;

const FriendRow = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? '#40444b' : 'transparent')};
  &:hover { background-color: #40444b; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 24px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled { 
    opacity: 0.6; 
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: #f1f3f4;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 14px 24px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ChatItemProps {
  active?: boolean;
}

const ChatItem = styled.div<ChatItemProps>`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 6px;
  background-color: ${({ active }) => active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  background: ${({ active }) => active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  border: 1px solid ${({ active }) => active ? 'rgba(102, 126, 234, 0.3)' : 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ active }) => active ? 'none' : 'rgba(255, 255, 255, 0.02)'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${({ active }) => active ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' : 'rgba(255, 255, 255, 0.05)'};
    border-color: ${({ active }) => active ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateX(4px);
    box-shadow: ${({ active }) => active ? '0 4px 20px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ChatItemAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  margin-right: 14px;
  font-size: 15px;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  ${ChatItem}:hover & {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const ChatItemInfo = styled.div`
  flex: 1;
`;

const ChatItemName = styled.div`
  color: #f1f3f4;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
  letter-spacing: 0.01em;
`;

const ChatItemLastMessage = styled.div`
  color: #a0a6b0;
  font-size: 13px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.9;
  font-weight: 400;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0a6b0;
  text-align: center;
  padding: 60px 40px;

  h3 {
    margin-bottom: 16px;
    color: #f1f3f4;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  p {
    font-size: 16px;
    opacity: 0.8;
    line-height: 1.5;
  }
`;

const MobileOverlay = styled.div<{ open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 900;
  }
`;

const ChatInterface: React.FC = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatUsers, setChatUsers] = useState<{ [key: string]: User }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friendsById, setFriendsById] = useState<{ [key: string]: User }>({});
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [groupMemberQuery, setGroupMemberQuery] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = ChatService.subscribeToUserChats(currentUser.uid, (userChats) => {
      setChats(userChats);
      
      // Load user data for each chat
      userChats.forEach(async (chat) => {
        if (chat.type === 'direct') {
          const otherUserId = chat.participants.find(id => id !== currentUser.uid);
          if (otherUserId) {
            const user = await UserService.getUser(otherUserId);
            if (user) {
              setChatUsers(prev => ({ ...prev, [otherUserId]: user }));
            }
          }
        }
      });
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = FriendService.subscribeToFriends(currentUser.uid, async (ids) => {
      setFriendIds(ids);
      const users = await Promise.all(ids.map((id) => UserService.getUser(id)));
      const mapping: { [key: string]: User } = {};
      users.filter(Boolean).forEach((u) => { mapping[(u as User).uid] = u as User; });
      setFriendsById(mapping);
    });
    return unsubscribe;
  }, [currentUser]);

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    const otherUserId = chat.participants.find(id => id !== currentUser?.uid);
    const otherUser = otherUserId ? chatUsers[otherUserId] : null;
    return otherUser?.displayName || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name?.charAt(0).toUpperCase() || 'G';
    }
    
    const otherUserId = chat.participants.find(id => id !== currentUser?.uid);
    const otherUser = otherUserId ? chatUsers[otherUserId] : null;
    return otherUser?.displayName?.charAt(0).toUpperCase() || '?';
  };

  const getLastMessagePreview = (chat: Chat): string => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const isOwn = chat.lastMessage.senderId === currentUser?.uid;
    const prefix = isOwn ? 'You: ' : '';
    
    if (chat.lastMessage.type === 'text') {
      return prefix + chat.lastMessage.content;
    }
    
    return prefix + `Sent a ${chat.lastMessage.type}`;
  };

  const handleOpenChat = (chat: Chat) => {
    setSelectedChat(chat);
    setSidebarOpen(false);
  };

  const toggleSelectFriend = (id: string) => {
    setSelectedFriendIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreateGroup = async () => {
    if (!currentUser) return;
    const memberIds = Array.from(selectedFriendIds);
    if (!groupName.trim() || memberIds.length === 0) return;
    try {
      const chatId = await ChatService.createGroupChat(groupName.trim(), currentUser.uid, memberIds);
      // Clear and close
      setGroupName('');
      setSelectedFriendIds(new Set());
      setShowGroupModal(false);
      setSidebarOpen(false);
      // Load and open created chat
      const newChat = await ChatService.getChat(chatId);
      if (newChat) setSelectedChat(newChat);
    } catch (e) {
      alert('Error creating group');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <MainContainer>
      <Sidebar open={sidebarOpen}>
        <SidebarHeader>
          <SidebarTitle>Direct Messages</SidebarTitle>
          <HeaderActions>
            <IconButton title="New Group" onClick={() => setShowGroupModal(true)}>
              <Users size={18} />
            </IconButton>
          </HeaderActions>
        </SidebarHeader>
        
        <ChatsList>
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              active={selectedChat?.id === chat.id}
              onClick={() => handleOpenChat(chat)}
            >
              <ChatItemAvatar>
                {getChatAvatar(chat)}
              </ChatItemAvatar>
              <ChatItemInfo>
                <ChatItemName>{getChatDisplayName(chat)}</ChatItemName>
                <ChatItemLastMessage>
                  {getLastMessagePreview(chat)}
                </ChatItemLastMessage>
              </ChatItemInfo>
            </ChatItem>
          ))}
        </ChatsList>

        <FriendsList />
        <UserPanel />
      </Sidebar>
      <MobileOverlay open={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <ChatArea>
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat} 
            otherUser={selectedChat.type === 'direct' 
              ? chatUsers[selectedChat.participants.find(id => id !== currentUser?.uid) || ''] 
              : undefined
            }
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <EmptyState>
            <h3>Welcome to your chat!</h3>
            <p>Select a conversation from the sidebar or add a friend to start chatting.</p>
          </EmptyState>
        )}
      </ChatArea>

      <Modal show={showGroupModal}>
        <ModalContent>
          <ModalTitle>Crear Grupo</ModalTitle>
          <ModalSection>
            <Label>Nombre del grupo</Label>
            <TextInput
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ej: Squad de Valorant"
            />
          </ModalSection>
          <ModalSection>
            <Label>Buscar usuarios</Label>
            <TextInput
              value={groupMemberQuery}
              onChange={(e) => setGroupMemberQuery(e.target.value)}
              placeholder="Buscar por nombre o código de amigo"
            />
          </ModalSection>
          <ModalSection>
            <Label>Invitar amigos</Label>
            <FriendsSelectList>
              {friendIds.length === 0 && (
                <div style={{ padding: '12px', color: '#72767d' }}>No tienes amigos todavía.</div>
              )}
              {friendIds
                .filter((id) => {
                  if (!groupMemberQuery.trim()) return true;
                  const friend = friendsById[id];
                  const q = groupMemberQuery.toLowerCase();
                  const name = friend?.displayName?.toLowerCase() || '';
                  const code = friend?.friendCode?.toLowerCase?.() || String(friend?.friendCode || '');
                  return name.includes(q) || code.includes(q);
                })
                .map((id) => {
                const friend = friendsById[id];
                const selected = selectedFriendIds.has(id);
                return (
                  <FriendRow key={id} selected={selected} onClick={() => toggleSelectFriend(id)}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelectFriend(id)}
                      style={{ margin: 0 }}
                    />
                    <div style={{ color: '#dcddde', fontSize: '14px' }}>
                      {friend ? friend.displayName : id}
                    </div>
                  </FriendRow>
                );
              })}
              {friendIds.length > 0 && friendIds.filter((id) => {
                if (!groupMemberQuery.trim()) return false; // we only show this when searching and none matched
                const friend = friendsById[id];
                const q = groupMemberQuery.toLowerCase();
                const name = friend?.displayName?.toLowerCase() || '';
                const code = friend?.friendCode?.toLowerCase?.() || String(friend?.friendCode || '');
                return name.includes(q) || code.includes(q);
              }).length === 0 && groupMemberQuery.trim() && (
                <div style={{ padding: '12px', color: '#72767d' }}>No se encontraron resultados.</div>
              )}
            </FriendsSelectList>
          </ModalSection>
          <ModalActions>
            <SecondaryButton onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedFriendIds(new Set()); }}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={handleCreateGroup} disabled={!groupName.trim() || selectedFriendIds.size === 0}>
              <Plus size={16} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} /> Crear
            </PrimaryButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </MainContainer>
  );
};

export default ChatInterface;
