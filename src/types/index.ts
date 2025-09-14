export interface User {
  uid: string;
  email: string;
  displayName: string;
  friendCode: string; // Código único para agregar amigos
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  createdAt: Date;
}

export interface Friend {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
}

export interface Chat {
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string; // For group chats
  avatar?: string; // For group chats
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  encrypted?: boolean; // Indica si el mensaje está encriptado en Firebase
  replyTo?: string; // Message ID being replied to
  reactions?: MessageReaction[];
  attachments?: FileAttachment[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// Future video/voice call types
export interface Call {
  id: string;
  chatId: string;
  initiatorId: string;
  participants: string[];
  type: 'voice' | 'video';
  status: 'initiating' | 'ringing' | 'active' | 'ended' | 'declined';
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
}

export interface CallParticipant {
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
