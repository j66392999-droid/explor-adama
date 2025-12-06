import { HomeData, Place, Event, Recommendation } from '../../features/home/types/home.types';
import { RecommendationItemType, InteractionType } from '../types/api.types';

const now = new Date().toISOString();

const featuredPlaces: Place[] = [
  {
    id: 'place-1',
    name: 'Riverside Cafe',
    description: 'A cozy cafe by the river with great coffee and views.',
    categoryId: 'cat-food',
    latitude: 9.0065,
    longitude: 38.7636,
    address: '12 River St, Addis Ababa',
    images: [
      { id: 'm1', url: 'https://placehold.co/600x400?text=Riverside+Cafe', type: 'IMAGE', createdAt: now },
    ],
    viewCount: 1245,
    bookingCount: 312,
    avgRating: 4.6,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'place-2',
    name: 'Green Park',
    description: 'Large public park with walking trails and picnic areas.',
    categoryId: 'cat-outdoor',
    latitude: 9.0216,
    longitude: 38.7619,
    address: 'Green Park Ave, Addis Ababa',
    images: [
      { id: 'm2', url: 'https://placehold.co/600x400?text=Green+Park', type: 'IMAGE', createdAt: now },
    ],
    viewCount: 987,
    bookingCount: 45,
    avgRating: 4.4,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'place-3',
    name: 'City Museum',
    description: 'Museum showcasing local history and exhibitions.',
    categoryId: 'cat-culture',
    latitude: 9.0153,
    longitude: 38.7469,
    address: 'Museum Rd, Addis Ababa',
    images: [
      { id: 'm3', url: 'https://placehold.co/600x400?text=City+Museum', type: 'IMAGE', createdAt: now },
    ],
    viewCount: 642,
    bookingCount: 88,
    avgRating: 4.5,
    createdAt: now,
    updatedAt: now,
  },
];

const trendingEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Summer Jazz Night',
    description: 'Live jazz performances by local artists.',
    placeId: 'place-1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '19:00',
    endTime: '22:00',
    capacity: 200,
    price: 15,
    images: [{ id: 'e1', url: 'https://placehold.co/800x400?text=Jazz+Night', type: 'IMAGE', createdAt: now }],
    bookingCount: 120,
    viewCount: 540,
    avgRating: 4.7,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'event-2',
    title: 'Art & Coffee Meetup',
    description: 'Meet local artists and enjoy coffee.',
    placeId: 'place-3',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '10:00',
    endTime: '13:00',
    capacity: 80,
    price: 0,
    images: [{ id: 'e2', url: 'https://placehold.co/800x400?text=Art+Meetup', type: 'IMAGE', createdAt: now }],
    bookingCount: 35,
    viewCount: 230,
    avgRating: 4.3,
    createdAt: now,
    updatedAt: now,
  },
];

const personalizedRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    userId: 'user-1',
    itemId: 'place-1',
    itemType: 'PLACE' as RecommendationItemType,
    score: 0.92,
    reason: 'Based on your recent visits to cafes',
    metadata: { matchedTags: ['coffee', 'outdoor'] },
    item: featuredPlaces[0],
    createdAt: now,
    updatedAt: now,
    type: 'VIEW' as InteractionType,
  },
  {
    id: 'rec-2',
    userId: 'user-1',
    itemId: 'event-1',
    itemType: 'EVENT' as RecommendationItemType,
    score: 0.86,
    reason: 'Events similar to ones you liked',
    metadata: { popularity: 'high' },
    item: trendingEvents[0],
    createdAt: now,
    updatedAt: now,
    type: 'VIEW' as InteractionType,
  },
  {
    id: 'rec-3',
    userId: 'user-1',
    itemId: 'place-3',
    itemType: 'PLACE' as RecommendationItemType,
    score: 0.72,
    reason: 'Cultural places you may like',
    metadata: { matchedCategories: ['culture'] },
    item: featuredPlaces[2],
    createdAt: now,
    updatedAt: now,
    type: 'VIEW' as InteractionType,
  },
];

export const mockHomeData: HomeData = {
  featuredPlaces,
  trendingEvents,
  personalizedRecommendations,
  categories: [
    { id: 'cat-food', key: 'food', name: 'Food & Drink', createdAt: now },
    { id: 'cat-outdoor', key: 'outdoor', name: 'Outdoor', createdAt: now },
    { id: 'cat-culture', key: 'culture', name: 'Culture', createdAt: now },
  ],
};

export default mockHomeData;
