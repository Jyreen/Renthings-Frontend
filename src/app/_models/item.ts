export class Item {
    Item_id: number;
    acc_id: number;
    Item_name: string;
    Item_Description?: string;
    Item_image?: string;
    created_at?: Date;
    updated_at?: Date;
    Item_price: number;
    Item_approvalstatus: string;
    Item_status: string;

    account?: {
        acc_address?: string;
      };
}
