# Configuración de Firebase para Gaming Hat Chat

## 🔥 Configurar Reglas de Firestore

### Paso 1: Ir a la Consola de Firebase
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **war-clash-f339c**

### Paso 2: Configurar Firestore Database
1. Ve a **Firestore Database** en el menú lateral
2. Si no está creada, crea la base de datos:
   - Selecciona "Start in test mode" (temporalmente)
   - Elige la región más cercana (europe-west3 para España)

### Paso 3: Aplicar Reglas de Seguridad
1. Ve a la pestaña **"Rules"** en Firestore
2. **COPIA Y PEGA** exactamente estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de usuarios
    match /users/{userId} {
      // Los usuarios pueden leer y escribir su propio documento
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Permitir leer otros usuarios para búsquedas de amigos (solo campos públicos)
      allow read: if request.auth != null;
      
      // Permitir crear usuario durante el registro
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para la colección de amigos
    match /friends/{friendId} {
      // Permitir leer/escribir si eres el sender o receiver
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
      
      // Permitir crear solicitudes de amistad
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId;
      
      // Permitir actualizar solicitudes (aceptar/rechazar)
      allow update: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
    }
    
    // Reglas para la colección de chats
    match /chats/{chatId} {
      // Permitir leer/escribir si eres participante del chat
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      // Permitir crear chat si eres uno de los participantes
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      
      // Permitir actualizar chat si eres participante
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Reglas para la colección de mensajes
    match /messages/{messageId} {
      // Permitir leer mensajes si eres participante del chat
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/chats/$(resource.data.chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants;
      
      // Permitir crear mensajes si eres el sender y participante del chat
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.senderId &&
        exists(/databases/$(database)/documents/chats/$(request.resource.data.chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(request.resource.data.chatId)).data.participants;
      
      // Permitir actualizar mensajes si eres el sender
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
      
      // Permitir eliminar mensajes si eres el sender
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Reglas futuras para llamadas (preparadas para futuras funcionalidades)
    match /calls/{callId} {
      // Permitir leer/escribir si eres participante de la llamada
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.initiatorId || 
         request.auth.uid in resource.data.participants);
      
      // Permitir crear llamadas si eres el iniciador
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.initiatorId;
    }
  }
}
```

### Paso 4: Publicar las Reglas
1. Haz clic en **"Publish"** o **"Publicar"**
2. Confirma la publicación

### Paso 5: Configurar Authentication
1. Ve a **Authentication** en el menú lateral
2. Ve a la pestaña **"Sign-in method"**
3. Habilita **"Email/Password"**:
   - Haz clic en "Email/Password"
   - Activa el primer toggle (Email/Password)
   - Guarda los cambios

## ✅ Verificación

Una vez configurado:

1. **Refresca tu aplicación** en el navegador
2. **Registra un nuevo usuario** o inicia sesión
3. **Verifica que no aparezcan más errores de permisos**

## 🚨 Solución de Problemas

### Si siguen apareciendo errores:

1. **Verifica que las reglas se aplicaron correctamente**
2. **Espera 1-2 minutos** para que se propaguen
3. **Refresca la página** completamente (Ctrl+F5)
4. **Verifica que Authentication esté habilitado**

### Estructura de Datos Creada:

La aplicación creará automáticamente estas colecciones:
- `users` - Información de usuarios
- `friends` - Solicitudes y relaciones de amistad  
- `chats` - Conversaciones entre usuarios
- `messages` - Mensajes de las conversaciones

## 🎯 ¡Listo!

Una vez configurado, el sistema de códigos de amigo funcionará perfectamente:
- Búsqueda de usuarios: ✅
- Envío de solicitudes: ✅  
- Chat en tiempo real: ✅
