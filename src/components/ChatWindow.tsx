import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useCall } from '../contexts/CallContext';
import { Input, Button, Avatar, StatusIndicator } from '../styles/GlobalStyles';
import { Chat, Message, User } from '../types';
import { ChatService } from '../services/chatService';
import { Send, Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { UserService } from '../services/userService';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
`;

const ChatHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChatHeaderInfo = styled.div`
  flex: 1;
`;

const ChatTitle = styled.h2`
  color: #f1f3f4;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
`;

const ChatSubtitle = styled.div`
  color: #a0a6b0;
  font-size: 13px;
  margin-top: 4px;
  font-weight: 400;
`;

const ChatActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MobileMenuButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #dcddde;
    padding: 8px;
    border-radius: 4px;
  }
`;

const ActionButton = styled.button`
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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.01) 0%, transparent 70%);
`;

const MessageGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: slideInMessage 0.3s ease-out;

  @keyframes slideInMessage {
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

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

const MessageAuthor = styled.span`
  color: #f1f3f4;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
`;

const MessageTimestamp = styled.span`
  color: #a0a6b0;
  font-size: 12px;
  opacity: 0.8;
  font-weight: 400;
`;

const MessageText = styled.div`
  color: #f1f3f4;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  font-weight: 400;
`;

const OwnMessage = styled(MessageGroup)`
  flex-direction: row-reverse;
  justify-content: flex-end;
  
  ${MessageContent} {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  
  ${MessageText} {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 18px;
    border-radius: 20px;
    border-bottom-right-radius: 8px;
    display: inline-block;
    max-width: 75%;
    margin-bottom: 6px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    font-weight: 400;
    position: relative;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom-right-radius: 8px;
    }
  }
`;

const OtherMessage = styled(MessageGroup)`
  justify-content: flex-start;
  
  ${MessageContent} {
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  ${MessageText} {
    background: rgba(255, 255, 255, 0.08);
    color: #f1f3f4;
    padding: 12px 18px;
    border-radius: 20px;
    border-bottom-left-radius: 8px;
    display: inline-block;
    max-width: 75%;
    margin-bottom: 6px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(20px);
    font-weight: 400;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: -1px;
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-bottom-left-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-top: none;
      border-right: none;
    }
  }
`;

const InputContainer = styled.div`
  padding: 20px 24px calc(env(safe-area-inset-bottom) + 20px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
`;

const MessageInputContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const MessageInput = styled(Input)`
  flex: 1;
  border-radius: 25px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #f1f3f4;
  font-size: 15px;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);

  &:focus {
    background: rgba(255, 255, 255, 0.12);
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }

  &::placeholder {
    color: #a0a6b0;
  }
`;

const SendButton = styled(Button)`
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// const TypingIndicator = styled.div`
//   color: #72767d;
//   font-size: 12px;
//   font-style: italic;
//   padding: 8px 20px;
// `;

const EmptyMessages = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0a6b0;
  text-align: center;
  padding: 40px;

  h3 {
    color: #f1f3f4;
    margin-bottom: 16px;
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

interface ChatWindowProps {
  chat: Chat;
  otherUser?: User;
}

interface ChatWindowWithSidebar extends ChatWindowProps {
  onOpenSidebar?: () => void;
}

const ChatWindow: React.FC<ChatWindowWithSidebar> = ({ chat, otherUser, onOpenSidebar }) => {
  const { currentUser } = useAuth();
  const { initiateCall } = useCall();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [participantsById, setParticipantsById] = useState<{ [key: string]: User }>(() => ({}));

  useEffect(() => {
    if (!chat.id) {
      console.log('No chat ID, skipping message subscription');
      return;
    }

    console.log('Setting up message subscription for chat:', chat.id);
    const unsubscribe = ChatService.subscribeToChatMessages(chat.id, (chatMessages) => {
      console.log('ChatWindow received messages:', chatMessages);
      setMessages(chatMessages);
    });

    return unsubscribe;
  }, [chat.id]);

  // Load participant info for group chats to display names
  useEffect(() => {
    const loadParticipants = async () => {
      if (chat.type !== 'group') return;
      const ids = chat.participants || [];
      if (!ids.length) return;
      const users = await Promise.all(ids.map((id) => UserService.getUser(id)));
      const mapping: { [key: string]: User } = {};
      users.filter(Boolean).forEach((u) => { mapping[(u as User).uid] = u as User; });
      setParticipantsById(mapping);
    };
    loadParticipants();
  }, [chat.type, chat.participants]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || loading) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasUser: !!currentUser, 
        loading 
      });
      return;
    }

    console.log('Sending message:', { 
      chatId: chat.id, 
      userId: currentUser.uid, 
      message: newMessage.trim() 
    });

    setLoading(true);
    try {
      await ChatService.sendMessage(chat.id, currentUser.uid, newMessage.trim());
      console.log('Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const getChatTitle = () => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    return otherUser?.displayName || 'Unknown User';
  };

  const getChatSubtitle = () => {
    if (chat.type === 'group') {
      return `${chat.participants.length} members`;
    }
    if (otherUser) {
      return `${otherUser.status} • Last seen ${otherUser.lastSeen.toLocaleString()}`;
    }
    return 'User not found';
  };

  const handleVoiceCall = () => {
    if (!currentUser) return;
    
    const participants = chat.participants.filter(id => id !== currentUser.uid);
    initiateCall(chat.id, participants, 'voice');
  };

  const handleVideoCall = () => {
    if (!currentUser) return;
    
    const participants = chat.participants.filter(id => id !== currentUser.uid);
    initiateCall(chat.id, participants, 'video');
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    
    if (isToday) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return timestamp.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === currentUser?.uid;
    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
    const isGroup = chat.type === 'group';
    const shouldShowHeader = isGroup || showAvatar;

    const getSenderName = (userId: string): string => {
      if (userId === currentUser?.uid) return currentUser?.displayName || 'You';
      if (isGroup) {
        const u = participantsById[userId];
        return u?.displayName || 'Unknown User';
      }
      return otherUser?.displayName || 'Unknown User';
    };
    
    console.log('Rendering message:', { 
      messageId: message.id, 
      isOwn, 
      senderId: message.senderId, 
      currentUserId: currentUser?.uid,
      content: message.content 
    });
    
    const MessageComponent = isOwn ? OwnMessage : OtherMessage;
    
    return (
      <MessageComponent key={message.id}>
        {!isOwn && showAvatar && (
          <Avatar size={32}>
            {(chat.type === 'group'
              ? participantsById[message.senderId]?.displayName?.charAt(0).toUpperCase()
              : otherUser?.displayName?.charAt(0).toUpperCase()) || '?'}
          </Avatar>
        )}
        {!isOwn && !showAvatar && <div style={{ width: 32 }} />}
        
          <MessageContent>
            {shouldShowHeader && (
              <MessageHeader>
                {(isGroup || !isOwn) && (
                  <MessageAuthor>
                    {getSenderName(message.senderId)}
                  </MessageAuthor>
                )}
                <MessageTimestamp>
                  {formatMessageTime(message.timestamp)}
                  {message.encrypted && (
                    <span style={{ 
                      marginLeft: '6px', 
                      color: '#00d26a', 
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      🔒
                    </span>
                  )}
                </MessageTimestamp>
              </MessageHeader>
            )}
            <MessageText>{message.content}</MessageText>
          </MessageContent>
        
        {isOwn && showAvatar && (
          <Avatar size={32}>
            {currentUser?.displayName?.charAt(0).toUpperCase()}
          </Avatar>
        )}
        {isOwn && !showAvatar && <div style={{ width: 32 }} />}
      </MessageComponent>
    );
  };

  // Debug logging
  console.log('ChatWindow render:', { 
    chatId: chat.id, 
    messagesCount: messages.length, 
    currentUser: currentUser?.uid 
  });

  return (
    <ChatContainer>
      <ChatHeader>
        <MobileMenuButton onClick={onOpenSidebar} aria-label="Open menu">
          <Menu size={20} />
        </MobileMenuButton>
        <div style={{ position: 'relative' }}>
          <Avatar size={32}>
            {getChatTitle().charAt(0).toUpperCase()}
          </Avatar>
          {otherUser && <StatusIndicator status={otherUser.status} />}
        </div>
        
        <ChatHeaderInfo>
          <ChatTitle>
            {getChatTitle()}
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '12px', 
              color: '#00d26a',
              fontWeight: 'normal'
            }}>
              🔒 Encriptado
            </span>
          </ChatTitle>
          <ChatSubtitle>{getChatSubtitle()}</ChatSubtitle>
        </ChatHeaderInfo>

        <ChatActions>
          <ActionButton title="Start voice call" onClick={handleVoiceCall}>
            <Phone size={20} />
          </ActionButton>
          <ActionButton title="Start video call" onClick={handleVideoCall}>
            <Video size={20} />
          </ActionButton>
          <ActionButton title="More options">
            <MoreVertical size={20} />
          </ActionButton>
        </ChatActions>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyMessages>
            <h3>This is the beginning of your conversation</h3>
            <p>Send a message to get started!</p>
          </EmptyMessages>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <InputContainer>
        <form onSubmit={handleSendMessage}>
          <MessageInputContainer>
            <MessageInput
              type="text"
              placeholder={`Message ${getChatTitle()}`}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
              disabled={loading}
            />
            <SendButton type="submit" disabled={!newMessage.trim() || loading}>
              <Send size={18} />
            </SendButton>
          </MessageInputContainer>
        </form>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;
