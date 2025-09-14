import { waitForPendingWrites } from 'firebase/firestore';
import { db } from '../firebase/config';

export class FirebaseUtils {
  static async waitForWrites() {
    try {
      await waitForPendingWrites(db);
      console.log('All pending writes completed');
    } catch (error) {
      console.error('Error waiting for pending writes:', error);
    }
  }

  static handleFirestoreError(error: any, context: string) {
    console.error(`Firestore error in ${context}:`, error);
    
    // Check if it's an internal assertion failure
    if (error.message && error.message.includes('INTERNAL ASSERTION FAILED')) {
      console.warn('Firestore internal error detected. Consider resetting connection.');
      // You could automatically reset here if needed
      // this.resetFirestore();
    }
    
    return error;
  }
}

// Global error handler for unhandled Firestore errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('FIRESTORE') && event.reason?.message?.includes('INTERNAL ASSERTION FAILED')) {
    console.warn('Caught unhandled Firestore error:', event.reason);
    event.preventDefault(); // Prevent the error from being logged to console as unhandled
  }
});
