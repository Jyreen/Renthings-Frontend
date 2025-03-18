import { Component, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { AccountService } from './_services';
import { Account, Role } from './_models';
import { ChatService } from './_services/chat.service';
import { Chat } from './_models/chat';
import { Subscription } from 'rxjs';
import iziToast from 'izitoast';
import { environment } from '../environments/environment';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
    Role = Role;
    account: Account;

    userId: Number = 0;
    unreadCount: number = 0;
    messages: Chat[] = [];
    private messageSubscription: Subscription;

    constructor(
        private accountService: AccountService,
        private chatService: ChatService
    ) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
    }

    isLoggedIn(){
        this.accountService.isLoggedIn();
    }

    ngOnInit() {
        const currentUserId = this.chatService.getCurrentUserId();
        this.chatService.getUnreadCount().subscribe(count => {
            this.unreadCount = count;
        });
    
        this.chatService.onNewMessage((message) => {
            if (message.sender_id === currentUserId) {
                return;
            }
    
            this.chatService.getConversation(message.sender_id).subscribe((conversations) => {
                if (conversations.length > 0) {
                    const senderData = conversations[0].sender;
                    message.sender = senderData; // Attach sender data to the message
                    
                    this.showNotification(senderData, message);
    
                    // Update the messages array with new message
                    this.messages = [...this.messages, message]; 
                }
            });
        });
    
        this.loadUnreadMessages();
    }

    getUserDetails(message: Chat) {
        this.chatService.getConversation(message.sender_id).subscribe((conversations) => {
            if (conversations.length > 0) {
                const senderData = conversations[0].sender; // Get sender details from the first message
                this.showNotification(senderData, message);
            }
        });
    }
    
    showNotification(sender: any, message: Chat): void {
        iziToast.info({
            title: 'New Message',
            message: `New message from ${sender.acc_firstname} ${sender.acc_lastname}: ${message.message}`,
            image: sender.acc_image ? `${environment.apiUrl}/assets/${sender.acc_image}` : 'assets/default-profile.png',
            position: 'bottomRight',
        });
    }
    

    loadUnreadMessages() {
        this.chatService.getUnreadMessages().subscribe((data) => {
            this.unreadCount = data.unread_count;
        });
    }

    markAllAsRead() {
        this.chatService.getUnreadMessages().subscribe(() => {
            this.messages = [];
            this.unreadCount = 0;
        });
    }
    

    ngOnDestroy() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }
}
