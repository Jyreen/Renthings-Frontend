import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService, AccountService } from '../_services';
import { Chat } from '../_models/chat';
import iziToast from 'izitoast';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html'
})
export class MessageComponent implements OnInit, OnDestroy {
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

    this.chatService.joinRoom(this.userId.toString());

    // Load chat users initially
    this.loadChatUsers();

    // Listen for new messages
    this.chatService.onNewMessage((message: Chat) => {
      console.log('Message received in component:', message);
      this.handleIncomingMessage(message);
    });
  }

  ngOnDestroy(): void {
    if (this.selectedChatUserId) {
      this.chatService.leaveRoom(this.selectedChatUserId.toString());
    }
    this.chatService.leaveRoom(this.userId.toString());
    this.chatService.disconnect();
  }

  handleIncomingMessage(message: Chat): void {
    // Ignore messages sent by the current user
    if (message.sender_id === this.userId) {
      return;
    }
  
    if (message.sender_id === this.selectedChatUserId || message.receiver_id === this.selectedChatUserId) {
      this.messages.push({
        ...message,
        isSentByCurrentUser: false,
      });
    }
  
    const userIndex = this.chatUsers.findIndex(
      (user) => user.id === message.sender_id || user.id === message.receiver_id
    );
  
    if (userIndex !== -1) {
      this.chatUsers[userIndex].lastMessage = message.message;
  
      if (message.sender_id !== this.userId && message.sender_id !== this.selectedChatUserId) {
        this.chatUsers[userIndex].unreadCount += 1;
      }
    } else {
      this.chatUsers.push({
        id: message.sender_id,
        unreadCount: message.sender_id !== this.userId ? 1 : 0,
        lastMessage: message.message,
      });
    }
  
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

  loadConversation(otherUserId: number): void {
    if (this.selectedChatUserId === otherUserId) return;

    if (this.selectedChatUserId) {
      this.chatService.leaveRoom(this.selectedChatUserId.toString());
    }

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

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedChatUserId) {
      const messageContent = this.newMessage.trim();
      const tempMessage: Chat = {
        id: Math.random(), // Temporary ID to uniquely identify the message in the UI
        sender_id: this.userId,
        receiver_id: this.selectedChatUserId,
        message: messageContent,
        read: false,
        created_at: new Date(), // Use current date for created_at
        isSentByCurrentUser: true,
      };
  
      // Add the message immediately for a responsive UI
      this.messages.push(tempMessage);
      this.scrollToBottom();
      this.newMessage = '';
  
      // Update the last message for the selected user
      const userIndex = this.chatUsers.findIndex(user => user.id === this.selectedChatUserId);
      if (userIndex !== -1) {
        this.chatUsers[userIndex].lastMessage = tempMessage.message;
      }
  
      // Send the message to the backend
      this.chatService.sendMessage(this.selectedChatUserId, messageContent).subscribe({
        next: (sentMessage) => {
          // Optionally replace tempMessage with the server's message
          tempMessage.id = sentMessage.id; // Replace temporary ID with the actual one
          tempMessage.created_at = sentMessage.created_at; // Update timestamp from the server
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
          // Optionally remove the tempMessage from the UI
          this.messages = this.messages.filter(msg => msg !== tempMessage);
        },
      });
    }
  }  
}
