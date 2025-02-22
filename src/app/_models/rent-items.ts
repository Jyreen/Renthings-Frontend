export class RentItem {
    RentItem_id: number;
    Item_id: number;
    renter_acc_id: number;
    rental_start_date: Date;
    rental_end_date: Date;
    total_rental_price: number;
    rental_status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Cancelled';
    verification_image: string;
    created_at: Date;
    updated_at?: Date;
  }
  