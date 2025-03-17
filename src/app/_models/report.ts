export class UserReport {
    id?: number;
    reporter_id: number;
    reported_id: number;
    reason_type: string;
    description?: string;
    evidence?: string;
    status?: string;
    reviewer_id?: number;
    reviewer_comments?: string;
    action_taken?: string;
    created_at?: Date;
    updated_at?: Date;
}
