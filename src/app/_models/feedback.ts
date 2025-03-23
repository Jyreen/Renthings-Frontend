export interface Feedback {
  id?: number;
  RentItem_id: number;
  acc_id: number;
  rating: number;
  comment?: string;
  status?: 'Active' | 'Inactive';
}