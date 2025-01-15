export class Chat {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    read: boolean;
    created_at?: Date;
    updated_at?: Date;
    isSentByCurrentUser?: boolean;
    sender?: { acc_firstname: string; acc_lastname: string };
    receiver?: { acc_firstname: string; acc_lastname: string };
}
