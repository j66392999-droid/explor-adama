import { Post, Comment } from '../types/social.types';

export const fetchPosts = async (): Promise<Post[]> => {
	// Simulate API call
	return [
		{
			id: '1',
			author: 'Jane Doe',
			content: 'Hello world!',
			createdAt: new Date().toISOString(),
			likes: 10,
			comments: [],
		},
	];
};

export const createPost = async (content: string, media?: any): Promise<Post> => {
	// Simulate post creation
	return {
		id: String(Date.now()),
		author: 'Current User',
		content,
		createdAt: new Date().toISOString(),
		likes: 0,
		comments: [],
	};
};

export const addComment = async (postId: string, text: string): Promise<Comment> => {
	// Simulate comment creation
	return {
		id: String(Date.now()),
		author: 'Current User',
		text,
		createdAt: new Date().toISOString(),
		liked: false,
	};
};
