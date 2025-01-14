import { Component, OnInit } from '@angular/core';
import { ChatService } from '../_services/chat.service';
import { Chat } from '../_models/chat';
import iziToast from 'izitoast';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html'
})
export class MessageComponent implements OnInit {
  userId: number = 0;
  selectedChatUserId: number | null = null;
  selectedChatUser: any = null;
  chatUsers: any[] = [];
  messages: Chat[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  loadingUsers: boolean = false;
  loadingMessages: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user?.id || 0; // Set the current user's ID from localStorage
    if (!this.userId) {
      iziToast.error({
        title: 'Error',
        message: 'No user is logged in.',
        position: 'topRight',
      });
      return;
    }
    this.loadChatUsers();
  }

  loadChatUsers(): void {
    this.loadingUsers = true;
    this.chatService.getChatUsers(this.userId.toString()).subscribe({
      next: (users) => {
        this.chatUsers = users.map((user: any) => ({
          ...user,
          unreadCount: user.unreadCount || 0,
          lastMessage: user.lastMessage || 'No messages yet',
        }));
        this.loadingUsers = false;
      },
      error: (err) => {
        this.loadingUsers = false;
        iziToast.error({
          title: 'Error',
          message: 'Failed to load chat users.',
          position: 'topRight',
        });
        console.error(err);
      },
    });
  }
  

  loadConversation(otherUserId: number): void {
    if (this.selectedChatUserId === otherUserId) return;

    this.selectedChatUserId = otherUserId;
    this.selectedChatUser = this.chatUsers.find((user) => user.id === otherUserId) || null;
    this.loadingMessages = true;

    this.chatService.getConversation(otherUserId).subscribe({
      next: (conversation) => {
        this.messages = conversation.map((msg: Chat) => ({
          ...msg,
          isSentByCurrentUser: msg.sender_id === this.userId,
        }));
        this.loadingMessages = false;

        const unreadMessages = conversation.filter(
          (msg) => !msg.read && msg.receiver_id === this.userId
        );
        unreadMessages.forEach((msg) =>
          this.chatService.markAsRead(msg.id).subscribe({
            error: (err) => {
              iziToast.error({
                title: 'Error',
                message: 'Failed to mark message as read.',
                position: 'topRight',
              });
              console.error(err);
            },
          })
        );
      },
      error: (err) => {
        this.loadingMessages = false;
        iziToast.error({
          title: 'Error',
          message: 'Failed to load conversation.',
          position: 'topRight',
        });
        console.error(err);
      },
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedChatUserId) {
      this.chatService.sendMessage(this.selectedChatUserId, this.newMessage).subscribe({
        next: (sentMessage) => {
          this.messages.push(sentMessage);
          this.newMessage = '';
          iziToast.success({
            title: 'Success',
            message: 'Your message was sent successfully!',
            position: 'bottomRight',
            timeout: 3000,
          });
        },
        error: (err) => {
          iziToast.error({
            title: 'Error',
            message: 'Failed to send message.',
            position: 'topRight',
          });
          console.error(err);
        },
      });
    }
  }
}
