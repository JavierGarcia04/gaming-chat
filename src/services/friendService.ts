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
  and,
  or
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Friend } from '../types';

export class FriendService {
  static async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    console.log('FriendService.sendFriendRequest called:', { senderId, receiverId });
    
    // Check if request already exists
    const existingRequest = await this.getFriendship(senderId, receiverId);
    console.log('Existing friendship check:', existingRequest);
    
    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    const friendRequestData = {
      senderId,
      receiverId,
      status: 'pending' as const,
      createdAt: serverTimestamp()
    };

    console.log('Creating friend request with data:', friendRequestData);
    const docRef = await addDoc(collection(db, 'friends'), friendRequestData);
    console.log('Friend request created with ID:', docRef.id);
  }

  static async respondToFriendRequest(requestId: string, response: 'accepted' | 'declined'): Promise<void> {
    const requestRef = doc(db, 'friends', requestId);
    const updateData: any = {
      status: response
    };

    if (response === 'accepted') {
      updateData.acceptedAt = serverTimestamp();
    }

    await updateDoc(requestRef, updateData);
  }

  static async getFriendship(userId1: string, userId2: string): Promise<Friend | null> {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef,
      or(
        and(where('senderId', '==', userId1), where('receiverId', '==', userId2)),
        and(where('senderId', '==', userId2), where('receiverId', '==', userId1))
      )
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        acceptedAt: data.acceptedAt?.toDate()
      } as Friend;
    }

    return null;
  }

  static async getFriends(userId: string): Promise<string[]> {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef,
      or(
        and(where('senderId', '==', userId), where('status', '==', 'accepted')),
        and(where('receiverId', '==', userId), where('status', '==', 'accepted'))
      )
    );

    const querySnapshot = await getDocs(q);
    const friendIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const friendId = data.senderId === userId ? data.receiverId : data.senderId;
      friendIds.push(friendId);
    });

    return friendIds;
  }

  static async getPendingRequests(userId: string): Promise<Friend[]> {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef,
      where('receiverId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests: Friend[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        acceptedAt: data.acceptedAt?.toDate()
      } as Friend);
    });

    // Sort by createdAt in client
    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return requests;
  }

  static subscribeToPendingRequests(userId: string, callback: (requests: Friend[]) => void) {
    console.log('Setting up subscribeToPendingRequests for user:', userId);
    
    const friendsRef = collection(db, 'friends');
    // Simplified query without orderBy to avoid composite index requirement
    const q = query(
      friendsRef,
      where('receiverId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        console.log('subscribeToPendingRequests snapshot received, docs:', querySnapshot.docs.length);
        const requests: Friend[] = [];
        querySnapshot.forEach((doc) => {
          console.log('Processing pending request doc:', doc.id, doc.data());
          const data = doc.data();
          requests.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            acceptedAt: data.acceptedAt?.toDate()
          } as Friend);
        });
        
        // Sort by createdAt in client instead of server to avoid composite index
        requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        console.log('Processed pending requests:', requests);
        callback(requests);
      },
      (error) => {
        console.error('Error in subscribeToPendingRequests:', error);
        callback([]); // Return empty array on error
      }
    );
  }

  static subscribeToFriends(userId: string, callback: (friendIds: string[]) => void) {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef,
      or(
        and(where('senderId', '==', userId), where('status', '==', 'accepted')),
        and(where('receiverId', '==', userId), where('status', '==', 'accepted'))
      )
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const friendIds: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const friendId = data.senderId === userId ? data.receiverId : data.senderId;
          friendIds.push(friendId);
        });
        callback(friendIds);
      },
      (error) => {
        console.error('Error in subscribeToFriends:', error);
        callback([]); // Return empty array on error
      }
    );
  }
}
