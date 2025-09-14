import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, Avatar, StatusIndicator } from '../styles/GlobalStyles';
import { Chat, Message, User } from '../types';
import { ChatService } from '../services/chatService';
import { Send, Phone, Video, MoreVertical, Menu } from 'lucide-react';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #36393f;
`;

const ChatHeaderInfo = styled.div`
  flex: 1;
`;

const ChatTitle = styled.h2`
  color: #dcddde;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const ChatSubtitle = styled.div`
  color: #72767d;
  font-size: 12px;
  margin-top: 2px;
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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
`;

const MessageGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const MessageAuthor = styled.span`
  color: #dcddde;
  font-weight: 500;
  font-size: 14px;
`;

const MessageTimestamp = styled.span`
  color: #72767d;
  font-size: 12px;
`;

const MessageText = styled.div`
  color: #dcddde;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
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
    background-color: #5865f2;
    color: white;
    padding: 10px 14px;
    border-radius: 18px;
    border-bottom-right-radius: 6px;
    display: inline-block;
    max-width: 70%;
    margin-bottom: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    background-color: #40444b;
    color: #dcddde;
    padding: 10px 14px;
    border-radius: 18px;
    border-bottom-left-radius: 6px;
    display: inline-block;
    max-width: 70%;
    margin-bottom: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #4f545c;
  }
`;

const InputContainer = styled.div`
  padding: 16px 20px calc(env(safe-area-inset-bottom) + 16px);
  background-color: #36393f;
  border-top: 1px solid #202225;
`;

const MessageInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const MessageInput = styled(Input)`
  flex: 1;
  border-radius: 24px;
  padding: 12px 16px;
  background-color: #40444b;
  border: none;

  &:focus {
    background-color: #484c52;
  }
`;

const SendButton = styled(Button)`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: #72767d;
  text-align: center;

  h3 {
    color: #dcddde;
    margin-bottom: 8px;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            {otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        )}
        {!isOwn && !showAvatar && <div style={{ width: 32 }} />}
        
          <MessageContent>
            {showAvatar && (
              <MessageHeader>
                {!isOwn && (
                  <MessageAuthor>
                    {otherUser?.displayName || 'Unknown User'}
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
          <ActionButton title="Start voice call">
            <Phone size={20} />
          </ActionButton>
          <ActionButton title="Start video call">
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
