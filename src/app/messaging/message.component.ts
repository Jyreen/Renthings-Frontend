import { Component, OnInit } from '@angular/core';
import { ChatService, AccountService } from '../_services';
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

  constructor(private chatService: ChatService, private accountService: AccountService) {}

  ngOnInit(): void {
    const account = this.accountService.accountValue;
  
    if (!account) {
      iziToast.error({
        title: 'Error',
        message: 'You must log in to use this feature.',
        position: 'topRight',
      });
      return;
    }
  
    this.userId = account.id ? Number(account.id) : 0;
  
    if (!this.userId || isNaN(this.userId)) {
      iziToast.error({
        title: 'Error',
        message: 'Invalid account data. No valid user ID found.',
        position: 'topRight',
      });
      return;
    }
  
    // Load chat users initially
    this.loadChatUsers();
  
    // Listen for new messages via WebSocket
    this.chatService.onNewMessage((message) => {
      this.handleIncomingMessage(message);
      console.log('New message received:', message);
    });
  }

  handleIncomingMessage(message: Chat): void {
    // Check if the message is part of the currently selected conversation
    if (message.sender_id === this.selectedChatUserId || message.receiver_id === this.selectedChatUserId) {
      this.messages.push({
        ...message,
        isSentByCurrentUser: message.sender_id === this.userId,
      });
    }
  
    // Update the chat user list
    const userIndex = this.chatUsers.findIndex(
      (user) => user.id === message.sender_id || user.id === message.receiver_id
    );
  
    if (userIndex !== -1) {
      this.chatUsers[userIndex].lastMessage = message.message;
  
      // Increment unread count if the message is not from the current user and not in the current chat
      if (
        message.sender_id !== this.userId &&
        message.sender_id !== this.selectedChatUserId
      ) {
        this.chatUsers[userIndex].unreadCount += 1;
      }
    } else {
      // Add new user to the list if not already present
      this.chatUsers.push({
        id: message.sender_id,
        unreadCount: message.sender_id !== this.userId ? 1 : 0,
        lastMessage: message.message,
      });
    }
  
    // Show notification if the user is not in the current chat
    if (message.sender_id !== this.selectedChatUserId) {
      iziToast.info({
        title: 'New Message',
        message: `New message from ${message.sender_id}: ${message.message}`,
        position: 'bottomRight',
      });
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
  

  // Load the list of chat users
  loadChatUsers(): void {
    this.loadingUsers = true;
    this.chatService.getChatUsers(this.userId.toString()).subscribe({
      next: (users) => {
        this.chatUsers = users.map((user: any) => ({
          ...user,
          unreadCount: user.unreadCount || 0,
          lastMessage: user.lastMessage || user.lastMessage,
        }));
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
        iziToast.error({
          title: 'Error',
          message: 'Failed to load chat users.',
          position: 'topRight',
        });
      },
    });
  }

  // Load the conversation for a specific user
  loadConversation(otherUserId: number): void {
    if (this.selectedChatUserId === otherUserId) return;
  
    // Leave the previous chat room
    if (this.selectedChatUserId) {
      this.chatService.leaveRoom(this.selectedChatUserId.toString());
    }
  
    // Join the new chat room
    this.chatService.joinRoom(otherUserId.toString());
  
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
  
        // Mark unread messages as read
        const unreadMessages = conversation.filter(
          (msg) => !msg.read && msg.receiver_id === this.userId
        );
        unreadMessages.forEach((msg) =>
          this.chatService.markAsRead(msg.id).subscribe({
            error: () => {
              iziToast.error({
                title: 'Error',
                message: 'Failed to mark message as read.',
                position: 'topRight',
              });
            },
          })
        );
  
        // Update unread count and last message
        const userIndex = this.chatUsers.findIndex((user) => user.id === otherUserId);
        if (userIndex !== -1) {
          this.chatUsers[userIndex].unreadCount = 0;
          this.chatUsers[userIndex].lastMessage =
            this.messages[this.messages.length - 1]?.message || 'No messages yet';
        }
      },
      error: () => {
        this.loadingMessages = false;
        iziToast.error({
          title: 'Error',
          message: 'Failed to load conversation.',
          position: 'topRight',
        });
      },
    });
  }
  

  // Send a new message
  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedChatUserId) {
      this.chatService.sendMessage(this.selectedChatUserId, this.newMessage).subscribe({
        next: (sentMessage) => {
          this.messages.push(sentMessage);
          this.newMessage = '';
          this.scrollToBottom();


          // Update chat user list with the new message
          const userIndex = this.chatUsers.findIndex(
            (user) => user.id === this.selectedChatUserId
          );
          if (userIndex !== -1) {
            this.chatUsers[userIndex].lastMessage = sentMessage.message;
          }

          iziToast.success({
            title: 'Success',
            message: 'Message sent successfully!',
            position: 'bottomRight',
            timeout: 3000,
          });
        },
        error: () => {
          iziToast.error({
            title: 'Error',
            message: 'Failed to send message.',
            position: 'topRight',
          });
        },
      });
    }
  }
}
