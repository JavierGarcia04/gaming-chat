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
  padding: 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h2`
  color: #dcddde;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #40444b;
    color: #dcddde;
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
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background-color: #36393f;
  border-radius: 8px;
  padding: 20px;
  width: 520px;
  max-width: 92vw;
  max-height: 80vh;
  overflow: auto;
`;

const ModalTitle = styled.h3`
  color: #dcddde;
  margin: 0 0 12px 0;
  font-size: 18px;
`;

const ModalSection = styled.div`
  margin-top: 12px;
`;

const Label = styled.label`
  display: block;
  color: #dcddde;
  font-size: 14px;
  margin-bottom: 6px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #202225;
  background-color: #40444b;
  color: #dcddde;
  outline: none;
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
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  background-color: #4f545c;
  color: #dcddde;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
`;

interface ChatItemProps {
  active?: boolean;
}

const ChatItem = styled.div<ChatItemProps>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  background-color: ${({ active }) => active ? '#5865f2' : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => active ? '#5865f2' : '#40444b'};
  }
`;

const ChatItemAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  margin-right: 12px;
  font-size: 14px;
`;

const ChatItemInfo = styled.div`
  flex: 1;
`;

const ChatItemName = styled.div`
  color: #dcddde;
  font-weight: 500;
  font-size: 14px;
`;

const ChatItemLastMessage = styled.div`
  color: #72767d;
  font-size: 12px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #72767d;
  text-align: center;
  padding: 40px;

  h3 {
    margin-bottom: 10px;
    color: #dcddde;
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
            <Label>Invitar amigos</Label>
            <FriendsSelectList>
              {friendIds.length === 0 && (
                <div style={{ padding: '12px', color: '#72767d' }}>No tienes amigos todavía.</div>
              )}
              {friendIds.map((id) => {
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
