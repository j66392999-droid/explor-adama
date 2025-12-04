export interface UserProfile {
	id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	avatar?: string | null;
	bio?: string | null;
	locale?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface NotificationSettings {
	push: boolean;
	email: boolean;
	sms: boolean;
}

export default UserProfile;

