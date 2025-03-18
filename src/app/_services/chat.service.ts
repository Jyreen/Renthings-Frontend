import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chat } from '../_models/chat';
import { io, Socket } from 'socket.io-client';
import { AccountService } from './account.service';

const baseUrl = `${environment.apiUrl}/chat`;

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private activeRooms: Set<string> = new Set();

  private unreadMessages: Chat[] = []; // Store unread messages
  private unreadCountSubject = new Subject<number>();
  // Expose Subject as Observable to avoid multiple subscriptions
  messageSubject = new Subject<Chat>();

  constructor(private http: HttpClient, private accountService: AccountService) {
    // Initialize the Socket.IO connection
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Listen for connection status
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server:', this.socket.id);
      // Rejoin active rooms after reconnection
      this.activeRooms.forEach(roomId => {
        this.joinRoom(roomId);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for new messages but only from others
    this.socket.on('new_message', (message: Chat) => {
      console.log('New message received via socket:', message);
      
      // Only process messages that we didn't send
      if (this.socket.id !== message.socketId) {
          this.messageSubject.next(message);
      }
      
  });
  
    
  }

  /**
   * Send a message to a user.
   * @param receiver_id - ID of the receiver.
   * @param message - The content of the message.
   * @returns An Observable of the sent Chat object.
   */
  sendMessage(receiver_id: number, message: string): Observable<Chat> {
    return this.http.post<Chat>(`${baseUrl}/send`, { 
      receiver_id, 
      message,
      socketId: this.socket.id // Include socket ID to prevent echo
    });
  }

  /**
   * Retrieve the conversation with a specific user.
   * @param other_id - ID of the other participant in the conversation.
   * @returns An Observable of an array of Chat objects.
   */
  getConversation(other_id: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${baseUrl}/conversation/${other_id}`);
  }

  /**
   * Fetch the count of unread messages.
   * @returns An Observable containing an object with the unread_count property.
   */
  getUnreadMessages(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${baseUrl}/unread`);
  }

  /**
   * Mark a message as read.
   * @param message_id - ID of the message to mark as read.
   * @returns An Observable of the updated Chat object.
   */
  markAsRead(message_id: number): Observable<Chat> {
    return this.http.put<Chat>(`${baseUrl}/read/${message_id}`, {});
  }

  /**
   * Get all participants in the user's chats.
   * @param user_id - The ID of the current user (optional for tracking purposes).
   * @returns An Observable of an array of participants.
   */
  getChatUsers(user_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/participants`);
  }

  /**
   * Real-time listener for new messages.
   * @param callback - A function to handle new message events.
   */
  

  onNewMessage(callback: (message: Chat) => void): void {
    this.messageSubject.subscribe((message) => {
        const currentUserId = this.getCurrentUserId();


        // Ignore messages sent by the current user (No self-notifications)
        if (message.sender_id === currentUserId) {
            return;
        }

        

        // Add to unread messages list
        this.unreadMessages.unshift(message);
        this.unreadCountSubject.next(this.unreadMessages.length);

        callback(message);
    });
}

getCurrentUserId(): number | null {
  return Number(this.accountService.accountValue?.id || null);
}



// Getter for unread message count as observable
getUnreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
}

// Getter for unread messages
getUnreadMessagesList(): Chat[] {
    return this.unreadMessages;
}


  /**
   * Join a specific chat room.
   * @param userId - The ID of the chat room to join.
   */
  joinRoom(userId: string): void {
    console.log('Joining room:', userId);
    this.socket.emit('joinRoom', userId);
    this.activeRooms.add(userId);
  }

  /**
   * Leave a specific chat room.
   * @param userId - The ID of the chat room to leave.
   */
  leaveRoom(userId: string): void {
    console.log('Leaving room:', userId);
    this.socket.emit('leaveRoom', userId);
    this.activeRooms.delete(userId);
  }

  /**
   * Check if socket is connected
   * @returns boolean indicating connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current socket ID
   * @returns string socket ID or null if not connected
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Clean up socket connection and subscriptions.
   */
  disconnect(): void {
    if (this.socket) {
      // Leave all rooms before disconnecting
      this.activeRooms.forEach(roomId => {
        this.leaveRoom(roomId);
      });
      this.activeRooms.clear();
      
      this.socket.disconnect();
      this.messageSubject.complete();
    }
  }
  
  
}


