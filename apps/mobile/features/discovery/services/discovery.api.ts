import { apiClient } from '../../../shared/services/api/client';
import { Place, Event } from '../types/discovery.types';

export const discoveryApi = {
  // Get single place by id
  getPlaceById: async (id: string): Promise<Place> => {
    const response = await apiClient.get<{ place: Place }>(`/places/${id}`);
    return response.data?.place ?? (response.data as unknown as Place);
  },

  // Get single event by id
  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<{ event: Event }>(`/events/${id}`);
    return response.data?.event ?? (response.data as unknown as Event);
  },
  // Get category data (places/events belonging to a category)
  getCategoryById: async (id: string): Promise<any> => {
    const response = await apiClient.get<{ category: any }>(`/categories/${id}`);
    return response.data?.category ?? (response.data as unknown as any);
  },
};

export default discoveryApi;
