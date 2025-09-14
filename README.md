# Gaming Hat Chat - Discord-Style Chat Application

A modern, real-time chat application built with React and Firebase, featuring a Discord-inspired interface with comprehensive messaging and friend management capabilities.

## Features

### 🔐 Authentication
- User registration and login
- Email/password authentication via Firebase Auth
- Secure user session management
- Beautiful landing page with sign-in/sign-up forms

### 👥 Friend System
- Search and add friends by username
- Send and receive friend requests
- Accept/decline friend requests
- Real-time friend status updates
- Online status indicators (Online, Away, Busy, Offline)

### 💬 Real-time Messaging
- Direct messaging with friends
- Real-time message delivery
- Message history persistence
- Typing indicators
- Timestamp display
- Discord-style message bubbles

### 🎨 Discord-Style UI
- Dark theme with Discord color scheme
- Responsive design for all screen sizes
- Smooth animations and transitions
- Clean, modern interface
- Status indicators and avatars

### 🔮 Future-Ready Architecture
The database schema is optimized for upcoming features:
- Voice calls
- Video calls
- Group chats
- File sharing
- Message reactions
- Message replies

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: Styled Components
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  createdAt: Date;
}
```

### Friends Collection
```typescript
{
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
}
```

### Chats Collection
```typescript
{
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string; // For group chats
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}
```

### Messages Collection
```typescript
{
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string;
  reactions?: MessageReaction[];
}
```

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gaminghat-chat
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - The Firebase configuration is already set up in `src/firebase/config.ts`
   - Ensure your Firebase project has:
     - Authentication enabled (Email/Password provider)
     - Firestore database created
     - Security rules configured

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app

### Firebase Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for friend search
    }
    
    // Friends collection rules
    match /friends/{friendId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
    }
    
    // Chats collection rules
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
    }
    
    // Messages collection rules
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
  }
}
```

## Project Structure

```
src/
├── components/           # React components
│   ├── ChatInterface.tsx # Main chat layout
│   ├── ChatWindow.tsx    # Chat messages and input
│   ├── FriendsList.tsx   # Friends management
│   ├── LandingPage.tsx   # Authentication page
│   └── UserPanel.tsx     # User status and controls
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── firebase/            # Firebase configuration
│   └── config.ts       # Firebase setup and exports
├── services/           # Business logic services
│   ├── chatService.ts  # Chat and messaging operations
│   ├── friendService.ts # Friend management operations
│   └── userService.ts  # User operations
├── styles/             # Styled components
│   └── GlobalStyles.ts # Global styles and theme
├── types/              # TypeScript type definitions
│   └── index.ts       # Application types
└── App.tsx            # Main application component
```

## Usage

### Getting Started
1. Register a new account or sign in with existing credentials
2. Search for friends using the "Add Friend" button
3. Send friend requests to other users
4. Accept incoming friend requests
5. Click on a friend to start chatting

### Key Features
- **Real-time messaging**: Messages appear instantly for all participants
- **Friend management**: Add, accept, and manage friend relationships
- **Status indicators**: See when friends are online, away, busy, or offline
- **Responsive design**: Works on desktop and mobile devices

## Future Enhancements

The application is architected to support these upcoming features:

- **Voice Calls**: WebRTC integration for voice communication
- **Video Calls**: Video calling with screen sharing capabilities
- **Group Chats**: Multi-user chat rooms
- **File Sharing**: Image and document sharing
- **Message Reactions**: Emoji reactions to messages
- **Message Threading**: Reply to specific messages
- **Push Notifications**: Real-time notifications for new messages
- **Mobile App**: React Native version for iOS and Android

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.