import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Chat, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService } from './encryptionService';

export class ChatService {
  static async createDirectChat(userId1: string, userId2: string): Promise<string> {
    // Check if chat already exists
    const existingChat = await this.getDirectChat(userId1, userId2);
    if (existingChat) {
      return existingChat.id;
    }

    const chatData = {
      participants: [userId1, userId2].sort(), // Sort for consistent ordering
      type: 'direct' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'chats'), chatData);
    return docRef.id;
  }

  static async getDirectChat(userId1: string, userId2: string): Promise<Chat | null> {
    const chatsRef = collection(db, 'chats');
    const participants = [userId1, userId2].sort();
    
    const q = query(
      chatsRef,
      where('participants', '==', participants),
      where('type', '==', 'direct')
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Chat;
    }

    return null;
  }

  static async getUserChats(userId: string): Promise<Chat[]> {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const chats: Chat[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Chat);
    });

    // Sort by updatedAt in client
    chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return chats;
  }

  static async sendMessage(chatId: string, senderId: string, content: string, type: Message['type'] = 'text'): Promise<void> {
    console.log('Sending message:', { chatId, senderId, content: content.substring(0, 20) + '...', type });
    
    // Encriptar el contenido del mensaje antes de guardarlo
    const encryptedContent = type === 'text' ? 
      EncryptionService.encryptMessage(content, chatId) : 
      content; // Solo encriptar mensajes de texto
    
    console.log('Content encrypted, saving to Firebase...');
    
    const messageData = {
      chatId,
      senderId,
      content: encryptedContent,
      type,
      timestamp: serverTimestamp(),
      edited: false,
      encrypted: type === 'text' // Marcar si está encriptado
    };

    // Add message to messages collection
    console.log('Adding encrypted message to Firestore...');
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('Encrypted message added with ID:', docRef.id);

    // Para el lastMessage del chat, encriptar también el preview para que no sea visible en la DB
    const lastMessagePreviewPlain = type === 'text'
      ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
      : `Sent a ${type}`;
    const lastMessageEncrypted = EncryptionService.encryptMessage(lastMessagePreviewPlain, chatId);

    // Update chat's last message (encriptado) and updatedAt
    const chatRef = doc(db, 'chats', chatId);
    console.log('Updating chat lastMessage...');
    await updateDoc(chatRef, {
      lastMessage: {
        id: docRef.id,
        chatId,
        senderId,
        content: lastMessageEncrypted, // Encriptado para no ser legible en DB
        type,
        timestamp: new Date(),
        edited: false,
        encrypted: true
      },
      updatedAt: serverTimestamp()
    });
    console.log('Chat updated successfully');
  }

  static async getChatMessages(chatId: string, limitCount: number = 50): Promise<Message[]> {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Desencriptar el contenido si está encriptado
      let decryptedContent = data.content;
      if (data.encrypted && data.type === 'text') {
        decryptedContent = EncryptionService.decryptMessage(data.content, chatId);
      } else if (data.type === 'text' && !data.hasOwnProperty('encrypted')) {
        // Manejar mensajes legacy (anteriores a la encriptación)
        decryptedContent = EncryptionService.handleLegacyMessage(data.content, chatId);
      }
      
      messages.push({
        id: doc.id,
        chatId: data.chatId,
        senderId: data.senderId,
        content: decryptedContent,
        type: data.type,
        timestamp: data.timestamp?.toDate() || new Date(),
        editedAt: data.editedAt?.toDate(),
        edited: data.edited || false
      } as Message);
    });

    // Sort by timestamp and limit in client
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return messages.slice(-limitCount); // Return last N messages in chronological order
  }

  static subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
    const chatsRef = collection(db, 'chats');
    // Simplified query without orderBy to avoid composite index requirement
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const chats: Chat[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let decryptedLastMessage = data.lastMessage;
          try {
            if (data.lastMessage?.content && data.lastMessage?.encrypted) {
              decryptedLastMessage = {
                ...data.lastMessage,
                content: EncryptionService.decryptMessage(data.lastMessage.content, doc.id),
                encrypted: true
              };
            }
          } catch (e) {
            // Si falla la desencriptación, dejar el contenido como está
            decryptedLastMessage = data.lastMessage;
          }

          chats.push({
            id: doc.id,
            ...data,
            lastMessage: decryptedLastMessage,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Chat);
        });
        
        // Sort by updatedAt in client instead of server
        chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        
        callback(chats);
      },
      (error) => {
        console.error('Error in subscribeToUserChats:', error);
        callback([]); // Return empty array on error
      }
    );
  }

  static subscribeToChatMessages(chatId: string, callback: (messages: Message[]) => void, limitCount: number = 50) {
    console.log('Setting up message subscription for chat:', chatId);
    
    const messagesRef = collection(db, 'messages');
    // Simplified query without orderBy to avoid composite index requirement
    const q = query(
      messagesRef,
      where('chatId', '==', chatId)
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        console.log('Messages snapshot received, docs:', querySnapshot.docs.length);
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          console.log('Processing message doc:', doc.id);
          const data = doc.data();
          
          // Desencriptar el contenido si está encriptado
          let decryptedContent = data.content;
          if (data.encrypted && data.type === 'text') {
            decryptedContent = EncryptionService.decryptMessage(data.content, chatId);
            console.log('Message decrypted for real-time display');
          } else if (data.type === 'text' && !data.hasOwnProperty('encrypted')) {
            // Manejar mensajes legacy (anteriores a la encriptación)
            decryptedContent = EncryptionService.handleLegacyMessage(data.content, chatId);
          }
          
          messages.push({
            id: doc.id,
            chatId: data.chatId,
            senderId: data.senderId,
            content: decryptedContent,
            type: data.type,
            timestamp: data.timestamp?.toDate() || new Date(),
            editedAt: data.editedAt?.toDate(),
            edited: data.edited || false
          } as Message);
        });
        
        // Sort by timestamp and limit in client
        messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const limitedMessages = messages.slice(-limitCount); // Get last N messages
        
        console.log('Processed and decrypted messages:', limitedMessages.length);
        callback(limitedMessages);
      },
      (error) => {
        console.error('Error in subscribeToChatMessages:', error);
        callback([]); // Return empty array on error
      }
    );
  }

  static async getChat(chatId: string): Promise<Chat | null> {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      const data = chatSnap.data();
      return {
        id: chatId,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Chat;
    }
    
    return null;
  }
}
