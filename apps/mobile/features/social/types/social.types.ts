export interface Post {
	id: string;
	author: string;
	content: string;
	createdAt: string;
	likes: number;
	comments: Comment[];
}

export interface Comment {
	id: string;
	author: string;
	text: string;
	createdAt: string;
	liked?: boolean;
}
