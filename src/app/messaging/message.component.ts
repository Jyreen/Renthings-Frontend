  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { ChatService, AccountService, UserReportService } from '../_services';
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
    isReportModalOpen = false;
    file: File | null = null;

    filePreviewUrl: string | null = null;

    reportReasons = [
      { value: 'inappropriate_content', label: 'Inappropriate Content' },
      { value: 'harassment', label: 'Harassment or Bullying' },
      { value: 'spam', label: 'Spam or Misleading' },
      { value: 'fraud', label: 'Fraud or Scam' },
      { value: 'fake_account', label: 'Fake Account' },
      { value: 'hate_speech', label: 'Hate Speech' },
      { value: 'violence', label: 'Violence or Threats' },
      { value: 'impersonation', label: 'Impersonation' },
      { value: 'intellectual_property', label: 'Intellectual Property Violation' },
      { value: 'other', label: 'Other' }
  ];


    reportData = {
      reason_type: '',
      description: '',
      evidence: null as File | null,
    };

    constructor(private chatService: ChatService, private accountService: AccountService, private reportService : UserReportService) {}

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
    

    onFileChange(event: any): void {
      const input = event.target as HTMLInputElement;
      if (event.target.files && event.target.files.length) {
        this.file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = () => {
          this.filePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(this.file);
      }
      input.value = '';
    }

    removeImage(): void {
      this.file = null;
      this.filePreviewUrl = null;
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
      if ((!this.newMessage.trim() && !this.file) || !this.selectedChatUserId) {
        return;
      }

      const formData = new FormData();
      formData.append('sender_id', this.userId.toString());
      formData.append('receiver_id', this.selectedChatUserId.toString());
    
      if (this.newMessage.trim()) {
        formData.append('message', this.newMessage.trim());
      }
    
      if (this.file) {
        formData.append('image', this.file);
      }
    
      // Temporary UI message preview
      const tempMessage: Chat = {
        id: Math.random(), // temp ID
        sender_id: this.userId,
        receiver_id: this.selectedChatUserId,
        message: this.newMessage.trim(),
        read: false,
        created_at: new Date(),
        isSentByCurrentUser: true,
        image_url: this.file ? 'preview' : null, // placeholder
      };
    
      this.messages.push(tempMessage);
      this.scrollToBottom();
    
      this.newMessage = '';
      this.file = null;
    
      this.chatService.sendMessageWithFile(formData).subscribe({
        next: (sentMessage) => {
          // Optional: remove the temp message
          this.messages = this.messages.filter(msg => msg !== tempMessage);
      
          // Push the actual message from the server
          const newMsg: Chat = {
            ...sentMessage,
            isSentByCurrentUser: true,
          };
          this.messages.push(newMsg); // Push updated message with real image URL
          this.scrollToBottom(); // Scroll after appending new message
      
          this.filePreviewUrl = null;
          this.newMessage = '';
          this.file = null;
      
          iziToast.success({
            title: 'Success',
            message: 'Message sent!',
            position: 'bottomRight',
          });
      
          // Optional: reload the whole conversation if needed
          // this.loadConversation(); // <- only needed if you want to sync from server again
        },
        error: () => {
          iziToast.error({
            title: 'Error',
            message: 'Failed to send message.',
            position: 'topRight',
          });
          this.messages = this.messages.filter(msg => msg !== tempMessage);
        },
      });      
    }
    
      

    onFileSelected(event: any): void {
      const file = event.target.files[0];
      if (file) {
        this.reportData.evidence = file;
      }
    }

    openReportModal(): void {
      this.isReportModalOpen = true;
    }

    closeReportModal(): void {
      this.isReportModalOpen = false;
      this.reportData = { reason_type: '', description: '', evidence: null };
    }

    submitReport(): void {

      const formData = new FormData();
      formData.append('reporter_id', this.userId.toString());
      formData.append('reported_id', this.selectedChatUserId?.toString() || '');
      formData.append('reason_type', this.reportData.reason_type);
      formData.append('description', this.reportData.description);
      if (this.reportData.evidence) {
        formData.append('evidence', this.reportData.evidence);
      }

      this.reportService.create(formData).subscribe({
        next: () => {
          iziToast.success({ title: 'Success', message: 'Report submitted successfully.', position: 'topRight' });
          this.closeReportModal();
        },
        error: () => {
          iziToast.error({ title: 'Error', message: 'Failed to submit report.', position: 'topRight' });
        }
      });
    }
  }
