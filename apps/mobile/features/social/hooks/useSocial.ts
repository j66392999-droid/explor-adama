import { useState, useEffect } from 'react';
import { fetchPosts, createPost, addComment } from '../services/social.api';
import { Post, Comment } from '../types/social.types';

export const useSocial = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetchPosts().then((data) => {
			setPosts(data);
			setLoading(false);
		});
	}, []);

	const handleCreatePost = async (content: string, media?: any) => {
		setLoading(true);
		const newPost = await createPost(content, media);
		setPosts((prev) => [newPost, ...prev]);
		setLoading(false);
	};

	const handleAddComment = async (postId: string, text: string) => {
		setLoading(true);
		const newComment = await addComment(postId, text);
		setPosts((prev) =>
			prev.map((post) =>
				post.id === postId
					? { ...post, comments: [...post.comments, newComment] }
					: post
			)
		);
		setLoading(false);
	};

	return { posts, loading, handleCreatePost, handleAddComment };
};
