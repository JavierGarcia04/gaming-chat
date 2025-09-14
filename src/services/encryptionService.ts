import CryptoJS from 'crypto-js';

export class EncryptionService {
  // Clave base - en producción esto debería estar en variables de entorno
  private static readonly BASE_KEY = 'gaminghat-secure-key-2024';
  
  /**
   * Genera una clave única para cada chat basada en los participantes
   */
  private static generateChatKey(chatId: string): string {
    const chatKey = CryptoJS.SHA256(this.BASE_KEY + chatId).toString();
    return chatKey.substring(0, 32); // AES-256 requiere 32 caracteres
  }

  /**
   * Encripta un mensaje usando AES-256
   */
  static encryptMessage(message: string, chatId: string): string {
    try {
      const key = this.generateChatKey(chatId);
      const encrypted = CryptoJS.AES.encrypt(message, key).toString();
      console.log('Message encrypted successfully');
      return encrypted;
    } catch (error) {
      console.error('Error encrypting message:', error);
      // En caso de error, devolver el mensaje original (fallback)
      return message;
    }
  }

  /**
   * Desencripta un mensaje usando AES-256
   */
  static decryptMessage(encryptedMessage: string, chatId: string): string {
    try {
      const key = this.generateChatKey(chatId);
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Failed to decrypt message');
      }
      
      console.log('Message decrypted successfully');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting message:', error);
      // En caso de error, devolver el mensaje encriptado (fallback)
      return '[Mensaje encriptado - Error al desencriptar]';
    }
  }

  /**
   * Verifica si un texto está encriptado (heurística simple)
   */
  static isEncrypted(text: string): boolean {
    // Los mensajes encriptados con CryptoJS suelen ser base64 y tener cierta longitud
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(text) && text.length > 20;
  }

  /**
   * Maneja la migración de mensajes no encriptados
   */
  static handleLegacyMessage(message: string, chatId: string): string {
    if (this.isEncrypted(message)) {
      return this.decryptMessage(message, chatId);
    }
    // Si no está encriptado, devolverlo tal como está
    return message;
  }

  /**
   * Genera hash para verificar integridad (opcional)
   */
  static generateMessageHash(message: string): string {
    return CryptoJS.SHA256(message).toString().substring(0, 16);
  }
}
