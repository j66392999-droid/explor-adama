import { PostStatus, MediaType } from '../../../shared/types/api.types';

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified?: boolean;
  isFollowing?: boolean;
}

export interface BlogPost {
  id: string;
  authorId: string;
  author: UserProfile;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  media: BlogMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogMedia {
  id: string;
  postId: string;
  url: string;
  type: MediaType;
  thumbnail?: string;
  caption?: string;
  order: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: UserProfile;
  content: string;
  likeCount: number;
  replyCount: number;
  isLiked?: boolean;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  type: 'POST' | 'COMMENT';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  collectionId?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  postCount: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SHARE' | 'MENTION';
  actor: UserProfile;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeedItem {
  type: 'POST' | 'REPOST' | 'TRENDING';
  data: BlogPost | any;
  timestamp: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  media: MediaFile[];
  isDraft?: boolean;
}

export interface MediaFile {
  uri: string;
  type: 'image' | 'video';
  filename?: string;
  size?: number;
}

export interface SocialStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  trendingPosts: BlogPost[];
  suggestedUsers: UserProfile[];
}

export interface FeedFilters {
  sortBy: 'latest' | 'popular' | 'trending';
  category?: string;
  tags?: string[];
  followingOnly?: boolean;
}