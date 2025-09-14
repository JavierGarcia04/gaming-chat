import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

export class UserService {
  static async createUser(uid: string, email: string, displayName: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    
    // Generar código de amigo único (6 dígitos)
    const friendCode = Math.random().toString().substr(2, 6);
    
    const userData: Omit<User, 'uid'> = {
      email,
      displayName,
      friendCode,
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date()
    };
    
    await setDoc(userRef, {
      ...userData,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  }

  static async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        friendCode: data.friendCode,
        avatar: data.avatar,
        status: data.status,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as User;
    }
    
    return null;
  }

  static async updateUserStatus(uid: string, status: User['status']): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status,
      lastSeen: serverTimestamp()
    });
  }

  // Función de búsqueda por nombre removida - ahora usamos códigos de amigo

  static async getUserByFriendCode(friendCode: string): Promise<User | null> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('friendCode', '==', friendCode));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      friendCode: data.friendCode,
      avatar: data.avatar,
      status: data.status,
      lastSeen: data.lastSeen?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date()
    } as User;
  }

  static async getAllUsers(currentUserId: string): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        const data = doc.data();
        users.push({
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          friendCode: data.friendCode,
          avatar: data.avatar,
          status: data.status,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as User);
      }
    });
    
    return users;
  }

  static subscribeToUserStatus(uid: string, callback: (user: User | null) => void) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            uid,
            email: data.email,
            displayName: data.displayName,
            friendCode: data.friendCode,
            avatar: data.avatar,
            status: data.status,
            lastSeen: data.lastSeen?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as User);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in subscribeToUserStatus:', error);
        callback(null); // Return null on error
      }
    );
  }
}
