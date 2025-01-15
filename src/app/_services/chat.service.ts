import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chat } from '../_models/chat';
import { io, Socket } from 'socket.io-client';

const baseUrl = `${environment.apiUrl}/chat`;

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    // Initialize the Socket.IO connection
    this.socket = io(environment.apiUrl);

    // Listen for connection status
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  /**
   * Send a message to a user.
   * @param receiver_id - ID of the receiver.
   * @param message - The content of the message.
   * @returns An Observable of the sent Chat object.
   */
  sendMessage(receiver_id: number, message: string): Observable<Chat> {
    return this.http.post<Chat>(`${baseUrl}/send`, { receiver_id, message });
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
    this.socket.on('new_message', callback);
  }

  /**
   * Join a specific chat room.
   * @param roomId - The ID of the chat room to join.
   */
  joinRoom(roomId: string): void {
    this.socket.emit('join', roomId);
  }

  /**
   * Leave a specific chat room.
   * @param roomId - The ID of the chat room to leave.
   */
  leaveRoom(roomId: string): void {
    this.socket.emit('leave', roomId);
  }

  /**
   * Disconnect the WebSocket connection.
   */
  disconnect(): void {
    this.socket.disconnect();
  }
}
