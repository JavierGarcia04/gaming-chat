import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Avatar, StatusIndicator } from '../styles/GlobalStyles';
import { User, Friend } from '../types';
import { FriendService } from '../services/friendService';
import { UserService } from '../services/userService';
import { ChatService } from '../services/chatService';
import { UserPlus, MessageCircle, Search } from 'lucide-react';

const FriendsContainer = styled.div`
  border-top: 1px solid #202225;
  max-height: 300px;
  display: flex;
  flex-direction: column;
`;

const FriendsHeader = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FriendsTitle = styled.h3`
  color: #dcddde;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const AddFriendButton = styled.button`
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #40444b;
    color: #dcddde;
  }
`;

const FriendsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #40444b;
  }
`;

const FriendInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const FriendName = styled.div`
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
`;

const FriendStatus = styled.div`
  color: #72767d;
  font-size: 12px;
  text-transform: capitalize;
`;

const FriendActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #5865f2;
    color: white;
  }

  &.danger:hover {
    background-color: #ed4245;
  }

  &.success:hover {
    background-color: #3ba55c;
  }
`;

interface ModalProps {
  show: boolean;
}

const Modal = styled.div<ModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #36393f;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
`;

const ModalHeader = styled.h3`
  color: #dcddde;
  margin: 0 0 20px 0;
  font-size: 18px;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchResults = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
`;

const UserResult = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  background-color: #40444b;
`;

const UserResultInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

// Removed unused RequestsTitle styled component

const FriendsListComponent: React.FC = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [requestSenders, setRequestSenders] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping subscriptions');
      return;
    }

    console.log('Setting up subscriptions for user:', currentUser.uid);

    // Subscribe to friends
    const friendsUnsubscribe = FriendService.subscribeToFriends(currentUser.uid, async (friendIds) => {
      console.log('Friends updated:', friendIds);
      const friendUsers = await Promise.all(
        friendIds.map(id => UserService.getUser(id))
      );
      setFriends(friendUsers.filter(Boolean) as User[]);
    });

    // Subscribe to pending requests
    const requestsUnsubscribe = FriendService.subscribeToPendingRequests(currentUser.uid, async (requests) => {
      console.log('Pending requests updated:', requests);
      console.log('Number of pending requests:', requests.length);
      setPendingRequests(requests);
      
      // Load sender data
      const senders: { [key: string]: User } = {};
      for (const request of requests) {
        console.log('Loading sender data for request:', request);
        const sender = await UserService.getUser(request.senderId);
        if (sender) {
          console.log('Loaded sender:', sender);
          senders[request.senderId] = sender;
        }
      }
      setRequestSenders(senders);
    });

    return () => {
      console.log('Cleaning up subscriptions');
      friendsUnsubscribe();
      requestsUnsubscribe();
    };
  }, [currentUser]);

  const handleSearchByFriendCode = async () => {
    if (!currentUser || !friendCode.trim()) {
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      console.log('Searching for friend code:', friendCode);
      const user = await UserService.getUserByFriendCode(friendCode.trim());
      
      if (user && user.uid !== currentUser.uid) {
        // Verificar si ya son amigos o hay una solicitud pendiente
        const existingFriendship = await FriendService.getFriendship(currentUser.uid, user.uid);
        if (existingFriendship) {
          alert('Ya tienes una relación con este usuario o hay una solicitud pendiente.');
          setSearchResult(null);
        } else {
          setSearchResult(user);
        }
      } else if (user && user.uid === currentUser.uid) {
        alert('No puedes agregarte a ti mismo como amigo.');
        setSearchResult(null);
      } else {
        alert('No se encontró ningún usuario con ese código de amigo.');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Error searching by friend code:', error);
      alert('Error al buscar el código de amigo.');
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!currentUser) return;

    try {
      console.log('Sending friend request from', currentUser.uid, 'to', receiverId);
      await FriendService.sendFriendRequest(currentUser.uid, receiverId);
      console.log('Friend request sent successfully');
      setSearchResult(null);
      setFriendCode('');
      alert('Solicitud de amistad enviada correctamente!');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      alert(error.message);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await FriendService.respondToFriendRequest(requestId, 'accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await FriendService.respondToFriendRequest(requestId, 'declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const handleStartChat = async (friendId: string) => {
    if (!currentUser) return;

    try {
      await ChatService.createDirectChat(currentUser.uid, friendId);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Debug logging
  console.log('FriendsList render - pendingRequests:', pendingRequests);
  console.log('FriendsList render - requestSenders:', requestSenders);
  console.log('FriendsList render - friends:', friends);

  return (
    <>
      <FriendsContainer>
        <FriendsHeader>
          <FriendsTitle>Friends ({friends.length})</FriendsTitle>
          <div style={{ position: 'relative' }}>
            <AddFriendButton onClick={() => setShowAddModal(true)}>
              <UserPlus size={16} />
            </AddFriendButton>
            {pendingRequests.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#ed4245',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid #2f3136'
              }}>
                {pendingRequests.length}
              </div>
            )}
          </div>
        </FriendsHeader>


        <FriendsList>
          {friends.map(friend => (
            <FriendItem key={friend.uid}>
              <div style={{ position: 'relative' }}>
                <Avatar size={32}>
                  {friend.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <StatusIndicator status={friend.status} />
              </div>
              <FriendInfo>
                <FriendName>{friend.displayName}</FriendName>
                <FriendStatus>{friend.status}</FriendStatus>
              </FriendInfo>
              <FriendActions>
                <ActionButton onClick={() => handleStartChat(friend.uid)}>
                  <MessageCircle size={14} />
                </ActionButton>
              </FriendActions>
            </FriendItem>
          ))}
        </FriendsList>
      </FriendsContainer>

      <Modal show={showAddModal}>
        <ModalContent style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
          <ModalHeader>Gestionar Amigos</ModalHeader>
          
          <SearchContainer>
            {/* Tu código de amigo */}
            <div style={{ marginBottom: '20px', textAlign: 'center', padding: '16px', backgroundColor: '#40444b', borderRadius: '8px' }}>
              <p style={{ color: '#dcddde', fontSize: '14px', marginBottom: '8px' }}>
                Tu código de amigo: <strong>#{currentUser?.friendCode}</strong>
              </p>
              <p style={{ color: '#72767d', fontSize: '12px' }}>
                Comparte este código con tus amigos para que puedan agregarte
              </p>
            </div>

            {/* Solicitudes pendientes */}
            {pendingRequests.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#dcddde', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📨 Solicitudes Pendientes ({pendingRequests.length})
                </h4>
                <div style={{ backgroundColor: '#2f3136', borderRadius: '8px', padding: '8px' }}>
                  {pendingRequests.map(request => {
                    const sender = requestSenders[request.senderId];
                    if (!sender) return null;

                    return (
                      <div key={request.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        backgroundColor: '#36393f',
                        border: '1px solid #5865f2'
                      }}>
                        <div style={{ position: 'relative' }}>
                          <Avatar size={40}>
                            {sender.displayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <StatusIndicator status={sender.status} />
                        </div>
                        <div style={{ flex: 1, marginLeft: '12px' }}>
                          <FriendName style={{ fontSize: '15px' }}>{sender.displayName}</FriendName>
                          <FriendStatus style={{ fontSize: '12px' }}>#{sender.friendCode} • Quiere ser tu amigo</FriendStatus>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            variant="primary"
                            onClick={() => handleAcceptRequest(request.id)}
                            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#3ba55c' }}
                          >
                            ✓ Aceptar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDeclineRequest(request.id)}
                            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ed4245' }}
                          >
                            ✗ Rechazar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Añadir nuevo amigo */}
            <div>
              <h4 style={{ color: '#dcddde', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ➕ Añadir Nuevo Amigo
              </h4>
              
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Input
                  type="text"
                  placeholder="Ingresa el código de amigo (ej: 123456)"
                  value={friendCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchByFriendCode();
                    }
                  }}
                  style={{ paddingRight: '40px' }}
                  maxLength={6}
                />
                <button
                  onClick={handleSearchByFriendCode}
                  disabled={searching}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: searching ? '#40444b' : '#72767d',
                    cursor: searching ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!searching) {
                      e.currentTarget.style.backgroundColor = '#5865f2';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!searching) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#72767d';
                    }
                  }}
                >
                  <Search size={16} />
                </button>
              </div>
              <Button 
                variant="primary" 
                onClick={handleSearchByFriendCode}
                disabled={!friendCode.trim() || searching}
                style={{ marginBottom: '16px', width: '100%' }}
              >
                {searching ? 'Buscando...' : 'Buscar Usuario'}
              </Button>
              
              <SearchResults>
                {searchResult && (
                  <UserResult style={{ border: '1px solid #5865f2' }}>
                    <Avatar size={40}>
                      {searchResult.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <UserResultInfo>
                      <FriendName>{searchResult.displayName}</FriendName>
                      <FriendStatus>#{searchResult.friendCode}</FriendStatus>
                    </UserResultInfo>
                    <Button
                      variant="primary"
                      onClick={() => handleSendFriendRequest(searchResult.uid)}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Enviar Solicitud
                    </Button>
                  </UserResult>
                )}
              </SearchResults>
            </div>
          </SearchContainer>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => {
              setShowAddModal(false);
              setFriendCode('');
              setSearchResult(null);
            }}>
              Cerrar
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FriendsListComponent;