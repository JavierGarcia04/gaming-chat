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

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #202225;
`;

const SidebarTitle = styled.h2`
  color: #dcddde;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const ChatsList = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 10px;
  min-height: 0;
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

  return (
    <MainContainer>
      <Sidebar open={sidebarOpen}>
        <SidebarHeader>
          <SidebarTitle>Direct Messages</SidebarTitle>
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
    </MainContainer>
  );
};

export default ChatInterface;
