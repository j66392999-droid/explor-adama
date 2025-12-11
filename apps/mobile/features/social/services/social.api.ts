import { apiClient } from '../../../shared/services/api/client';
import { PaginatedResponse } from '../../../shared/types/api.types';
import {
  BlogPost,
  UserProfile,
  Comment,
  Collection,
  Notification,
  CreatePostData,
  FeedFilters,
  SocialStats,
} from '../types/social.types';

const emptyPage = <T>(page = 1, limit = 10): PaginatedResponse<T> => ({
  data: [],
  pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
});

export const socialApi = {
  // Posts
  async getFeed(page = 1, limit = 20, filters?: FeedFilters): Promise<PaginatedResponse<BlogPost>> {
    const params: any = { page, limit, ...filters };
    const res = await apiClient.get<PaginatedResponse<BlogPost>>('/social/feed', { params });
    return res.data ?? emptyPage<BlogPost>(page, limit);
  },

  async getPost(postId: string): Promise<BlogPost> {
    const res = await apiClient.get<BlogPost>(`/social/posts/${postId}`);
    return res.data!;
  },

  async createPost(data: CreatePostData): Promise<BlogPost> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('tags', JSON.stringify(data.tags));
    
    if (data.category) {
      formData.append('category', data.category);
    }
    
    if (data.isDraft) {
      formData.append('isDraft', 'true');
    }
    
    // Append media files
    data.media.forEach((media, index) => {
      const file = {
        uri: media.uri,
        type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: media.filename || `media_${index}.${media.type === 'image' ? 'jpg' : 'mp4'}`,
      } as any;
      
      formData.append('media', file);
    });

    const res = await apiClient.post<BlogPost>('/social/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data!;
  },

  async updatePost(postId: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const res = await apiClient.patch<BlogPost>(`/social/posts/${postId}`, updates);
    return res.data!;
  },

  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/social/posts/${postId}`);
  },

  async likePost(postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const res = await apiClient.post<{ liked: boolean; likeCount: number }>(
      `/social/posts/${postId}/like`
    );
    return res.data!;
  },

  async unlikePost(postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const res = await apiClient.delete<{ liked: boolean; likeCount: number }>(
      `/social/posts/${postId}/like`
    );
    return res.data!;
  },

  async bookmarkPost(postId: string, collectionId?: string): Promise<void> {
    await apiClient.post(`/social/posts/${postId}/bookmark`, { collectionId });
  },

  async removeBookmark(postId: string): Promise<void> {
    await apiClient.delete(`/social/posts/${postId}/bookmark`);
  },

  async sharePost(postId: string): Promise<{ shareUrl: string; shareCount: number }> {
    const res = await apiClient.post<{ shareUrl: string; shareCount: number }>(
      `/social/posts/${postId}/share`
    );
    return res.data!;
  },

  // Comments
  async getComments(postId: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    const res = await apiClient.get<PaginatedResponse<Comment>>(
      `/social/posts/${postId}/comments`,
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<Comment>(page, limit);
  },

  async createComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const res = await apiClient.post<Comment>(`/social/posts/${postId}/comments`, {
      content,
      parentId,
    });
    return res.data!;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const res = await apiClient.patch<Comment>(`/social/comments/${commentId}`, { content });
    return res.data!;
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/social/comments/${commentId}`);
  },

  async likeComment(commentId: string): Promise<{ liked: boolean; likeCount: number }> {
    const res = await apiClient.post<{ liked: boolean; likeCount: number }>(
      `/social/comments/${commentId}/like`
    );
    return res.data!;
  },

  // Users
  async getUserProfile(userId: string): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>(`/social/users/${userId}`);
    return res.data!;
  },

  async getUserPosts(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> {
    const res = await apiClient.get<PaginatedResponse<BlogPost>>(
      `/social/users/${userId}/posts`,
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<BlogPost>(page, limit);
  },

  async followUser(userId: string): Promise<{ following: boolean; followerCount: number }> {
    const res = await apiClient.post<{ following: boolean; followerCount: number }>(
      `/social/users/${userId}/follow`
    );
    return res.data!;
  },

  async unfollowUser(userId: string): Promise<{ following: boolean; followerCount: number }> {
    const res = await apiClient.delete<{ following: boolean; followerCount: number }>(
      `/social/users/${userId}/follow`
    );
    return res.data!;
  },

  async getFollowers(userId: string, page = 1, limit = 50): Promise<PaginatedResponse<UserProfile>> {
    const res = await apiClient.get<PaginatedResponse<UserProfile>>(
      `/social/users/${userId}/followers`,
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<UserProfile>(page, limit);
  },

  async getFollowing(userId: string, page = 1, limit = 50): Promise<PaginatedResponse<UserProfile>> {
    const res = await apiClient.get<PaginatedResponse<UserProfile>>(
      `/social/users/${userId}/following`,
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<UserProfile>(page, limit);
  },

  // Collections
  async getCollections(userId?: string): Promise<Collection[]> {
    const params = userId ? { userId } : {};
    const res = await apiClient.get<Collection[]>('/social/collections', { params });
    return res.data ?? [];
  },

  async createCollection(name: string, description?: string, isPrivate = false): Promise<Collection> {
    const res = await apiClient.post<Collection>('/social/collections', {
      name,
      description,
      isPrivate,
    });
    return res.data!;
  },

  async updateCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection> {
    const res = await apiClient.patch<Collection>(`/social/collections/${collectionId}`, updates);
    return res.data!;
  },

  async deleteCollection(collectionId: string): Promise<void> {
    await apiClient.delete(`/social/collections/${collectionId}`);
  },

  async getCollectionPosts(collectionId: string, page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> {
    const res = await apiClient.get<PaginatedResponse<BlogPost>>(
      `/social/collections/${collectionId}/posts`,
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<BlogPost>(page, limit);
  },

  // Notifications
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const res = await apiClient.get<PaginatedResponse<Notification>>(
      '/social/notifications',
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<Notification>(page, limit);
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/social/notifications/${notificationId}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch('/social/notifications/read-all');
  },

  // Search
  async searchPosts(query: string, page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> {
    const res = await apiClient.get<PaginatedResponse<BlogPost>>('/social/search/posts', {
      params: { q: query, page, limit },
    });
    return res.data ?? emptyPage<BlogPost>(page, limit);
  },

  async searchUsers(query: string, page = 1, limit = 20): Promise<PaginatedResponse<UserProfile>> {
    const res = await apiClient.get<PaginatedResponse<UserProfile>>('/social/search/users', {
      params: { q: query, page, limit },
    });
    return res.data ?? emptyPage<UserProfile>(page, limit);
  },

  async searchTags(tag: string, page = 1, limit = 20): Promise<PaginatedResponse<BlogPost>> {
    const res = await apiClient.get<PaginatedResponse<BlogPost>>('/social/search/tags', {
      params: { tag, page, limit },
    });
    return res.data ?? emptyPage<BlogPost>(page, limit);
  },

  // Stats
  async getSocialStats(): Promise<SocialStats> {
    const res = await apiClient.get<SocialStats>('/social/stats');
    return res.data!;
  },

  async getTrendingPosts(limit = 10): Promise<BlogPost[]> {
    const res = await apiClient.get<BlogPost[]>('/social/trending', { params: { limit } });
    return res.data ?? [];
  },

  async getSuggestedUsers(limit = 10): Promise<UserProfile[]> {
    const res = await apiClient.get<UserProfile[]>('/social/suggestions/users', { params: { limit } });
    return res.data ?? [];
  },

  // Categories
  async getCategories(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/social/categories');
    return res.data ?? [];
  },

  async getPopularTags(limit = 20): Promise<string[]> {
    const res = await apiClient.get<string[]>('/social/tags/popular', { params: { limit } });
    return res.data ?? [];
  },
};

export default socialApi;