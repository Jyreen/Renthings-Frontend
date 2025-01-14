import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat } from '../_models/chat';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}/chat`;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) {}

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
   * Delete a specific message.
   * @param message_id - ID of the message to be deleted.
   * @returns An Observable indicating the deletion status.
   */
  deleteMessage(message_id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/delete/${message_id}`);
  }

  /**
   * Search messages in the chat.
   * @param query - The search term to filter messages.
   * @returns An Observable of the filtered Chat objects.
   */
  searchMessages(query: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${baseUrl}/search`, { params: { query } });
  }
}
