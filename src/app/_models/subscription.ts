export class Subscription {
    id: number;
    acc_id: number;
    start_date: Date;
    end_date: Date;
    subscription_plan: '1_month' | '3_months' | '6_months';
    plan_duration: number;
    subscription_receipt: string;
}
