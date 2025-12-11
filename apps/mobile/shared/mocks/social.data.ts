import {
  BlogPost,
  UserProfile,
  Comment,
  Collection,
  Notification,
} from '../../features/social/types/social.types';

export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Alex Traveler',
    username: 'alextravels',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Digital nomad exploring the world one city at a time ✈️',
    followerCount: 2450,
    followingCount: 380,
    postCount: 128,
    isVerified: true,
    isFollowing: false,
  },
  {
    id: 'user_2',
    name: 'Sarah Explorer',
    username: 'sarahexplores',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Adventure seeker & travel photographer 📸',
    followerCount: 1890,
    followingCount: 420,
    postCount: 95,
    isVerified: false,
    isFollowing: true,
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post_1',
    authorId: 'user_1',
    author: mockUserProfiles[0],
    title: 'Hidden Gems of Addis Ababa',
    content: 'After spending a month in Addis Ababa, I discovered some incredible places that most tourists never see...',
    excerpt: 'Discovering the secret spots of Ethiopia\'s capital',
    category: 'City Guide',
    tags: ['ethiopia', 'addisababa', 'travel', 'hidden-gems'],
    status: 'APPROVED',
    viewCount: 15420,
    likeCount: 892,
    commentCount: 147,
    shareCount: 89,
    isLiked: true,
    isBookmarked: false,
    media: [
      {
        id: 'media_1',
        postId: 'post_1',
        url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
        type: 'IMAGE',
        thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
        caption: 'View from Entoto Mountain',
        order: 0,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'post_2',
    authorId: 'user_2',
    author: mockUserProfiles[1],
    title: 'Traditional Coffee Ceremony Experience',
    content: 'The Ethiopian coffee ceremony is a beautiful tradition that goes far beyond just drinking coffee...',
    excerpt: 'Experiencing the authentic Ethiopian coffee ritual',
    category: 'Culture',
    tags: ['ethiopia', 'coffee', 'culture', 'tradition'],
    status: 'APPROVED',
    viewCount: 8920,
    likeCount: 567,
    commentCount: 89,
    shareCount: 42,
    isLiked: false,
    isBookmarked: true,
    media: [
      {
        id: 'media_2',
        postId: 'post_2',
        url: 'https://images.unsplash.com/photo-1561047029-3000c68339ca',
        type: 'IMAGE',
        thumbnail: 'https://images.unsplash.com/photo-1561047029-3000c68339ca',
        caption: 'Traditional coffee preparation',
        order: 0,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockComments: Comment[] = [
  {
    id: 'comment_1',
    postId: 'post_1',
    userId: 'user_2',
    user: mockUserProfiles[1],
    content: 'Amazing photos! Can\'t wait to visit these spots.',
    likeCount: 24,
    replyCount: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const mockCollections: Collection[] = [
  {
    id: 'collection_1',
    userId: 'user_1',
    name: 'Ethiopian Adventures',
    description: 'My favorite travel experiences in Ethiopia',
    isPrivate: false,
    postCount: 15,
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notification_1',
    userId: 'user_1',
    type: 'LIKE',
    actor: mockUserProfiles[1],
    postId: 'post_1',
    message: 'Sarah Explorer liked your post',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default {
  userProfiles: mockUserProfiles,
  blogPosts: mockBlogPosts,
  comments: mockComments,
  collections: mockCollections,
  notifications: mockNotifications,
};