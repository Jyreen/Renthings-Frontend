import { Role } from './role';

export class Account {
    id: string;
    acc_email: string;
    acc_passwordHash: string;
    acc_firstName: string;
    acc_lastName: string;
    acc_image: string;
    acc_address : string;
    acc_role: Role;
    acc_acceptTerms: string;
    acc_resetToken?: string;
    jwtToken?: string;
    refreshToken?: string;
    acc_created? : Date;
    acc_status: string; 
    acc_subscription: string; 

    acc_verificationToken?: string;
    acc_verified?: Date;
    acc_passwordReset?: Date;

    acc_verification_image? : string;
    acc_verification_status?: 'pending' | 'approved' | 'rejected';
    acc_verification_notes?: string;

}