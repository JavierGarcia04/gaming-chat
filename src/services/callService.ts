import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Call } from '../types';

export class CallService {
  private static peerConnection: RTCPeerConnection | null = null;
  private static localStream: MediaStream | null = null;
  private static remoteStream: MediaStream | null = null;
  
  // Ice servers for WebRTC connection
  private static iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  static async initiateCall(chatId: string, initiatorId: string, participants: string[], type: 'voice' | 'video'): Promise<string> {
    const callData = {
      chatId,
      initiatorId,
      participants,
      type,
      status: 'initiating' as const,
      startedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'calls'), callData);
    
    // Update status to ringing after creating
    await updateDoc(doc(db, 'calls', docRef.id), {
      status: 'ringing'
    });

    return docRef.id;
  }

  static async answerCall(callId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'active',
      answeredBy: userId,
      answeredAt: serverTimestamp()
    });
  }

  static async declineCall(callId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'declined',
      declinedBy: userId,
      endedAt: serverTimestamp()
    });
  }

  static async endCall(callId: string): Promise<void> {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'ended',
      endedAt: serverTimestamp()
    });

    // Cleanup WebRTC resources
    this.cleanupWebRTC();
  }

  static subscribeToCall(callId: string, callback: (call: Call | null) => void) {
    const callRef = doc(db, 'calls', callId);
    
    return onSnapshot(callRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const call: Call = {
          id: doc.id,
          chatId: data.chatId,
          initiatorId: data.initiatorId,
          participants: data.participants,
          type: data.type,
          status: data.status,
          startedAt: data.startedAt?.toDate() || new Date(),
          endedAt: data.endedAt?.toDate(),
          duration: data.duration
        };
        callback(call);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToIncomingCalls(userId: string, callback: (calls: Call[]) => void) {
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('participants', 'array-contains', userId),
      where('status', 'in', ['ringing', 'active'])
    );

    return onSnapshot(q, (snapshot) => {
      const calls: Call[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        calls.push({
          id: doc.id,
          chatId: data.chatId,
          initiatorId: data.initiatorId,
          participants: data.participants,
          type: data.type,
          status: data.status,
          startedAt: data.startedAt?.toDate() || new Date(),
          endedAt: data.endedAt?.toDate(),
          duration: data.duration
        });
      });
      callback(calls);
    });
  }

  // WebRTC Methods
  static async initializeWebRTC(isVideo: boolean = false): Promise<MediaStream> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.iceServers);

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
      };

      return this.localStream;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  static async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  static async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;

    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  static async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  static async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  static toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // Return true if muted
    }
    return false;
  }

  static toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled; // Return true if video enabled
    }
    return false;
  }

  static cleanupWebRTC(): void {
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clear remote stream
    this.remoteStream = null;
  }

  static getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  static getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Cleanup active calls for a user (useful for page refresh/logout)
  static async cleanupUserCalls(userId: string): Promise<void> {
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('participants', 'array-contains', userId),
      where('status', 'in', ['ringing', 'active'])
    );

    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        status: 'ended',
        endedAt: serverTimestamp()
      })
    );

    await Promise.all(promises);
  }
}
