import { apiClient } from '../../../shared/services/api/client'
import { PaginatedResponse } from '../../../shared/types/api.types'
import { HomeData, Place, Event, Recommendation } from '../types/home.types'

const emptyPage = <T>(page = 1, limit = 10): PaginatedResponse<T> => ({
  data: [] as T[],
  pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
})

export const homeApi = {
  async getHomeData(): Promise<HomeData> {
    const res = await apiClient.get<HomeData>('/home')
    return res.data ?? { featuredPlaces: [], trendingEvents: [], personalizedRecommendations: [], categories: [] }
  },

  async getRecommendations(page = 1, limit = 10): Promise<PaginatedResponse<Recommendation>> {
    const res = await apiClient.get<PaginatedResponse<Recommendation>>('/home/recommendations', { params: { page, limit } })
    return res.data ?? emptyPage<Recommendation>(page, limit)
  },

  async getTrendingEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    const res = await apiClient.get<PaginatedResponse<Event>>('/home/trending', { params: { page, limit } })
    return res.data ?? emptyPage<Event>(page, limit)
  },

  async getFeaturedPlaces(page = 1, limit = 15): Promise<PaginatedResponse<Place>> {
    const res = await apiClient.get<PaginatedResponse<Place>>('/home/featured', { params: { page, limit } })
    return res.data ?? emptyPage<Place>(page, limit)
  },

  async search(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Place | Event | Recommendation>> {
    const res = await apiClient.get<PaginatedResponse<Place | Event | Recommendation>>('/home/search', { params: { q: query, page, limit } })
    return res.data ?? emptyPage(page, limit)
  },

  async getInteractions(page = 1, limit = 50): Promise<PaginatedResponse<any>> {
    const res = await apiClient.get<PaginatedResponse<any>>('/interactions', { params: { page, limit } })
    return res.data ?? emptyPage(page, limit)
  },

  async recordInteraction(data: any): Promise<void> {
    await apiClient.post('/interactions', data)
  },

  async getSimilarItems(itemId: string, itemType: 'PLACE' | 'EVENT', page = 1, limit = 10): Promise<PaginatedResponse<Place | Event>> {
    const res = await apiClient.get<PaginatedResponse<Place | Event>>(`/home/similar/${itemType}/${itemId}`, { params: { page, limit } })
    return res.data ?? emptyPage(page, limit)
  },

  async getRecommendedCategories(page = 1, limit = 10): Promise<PaginatedResponse<any>> {
    const res = await apiClient.get<PaginatedResponse<any>>('/home/categories/recommended', { params: { page, limit } })
    return res.data ?? emptyPage(page, limit)
  },

  async getAllItems<T>(endpoint: string): Promise<T[]> {
    const res = await apiClient.get<PaginatedResponse<T>>(endpoint, { params: { page: 1, limit: 50 } })
    return res.data?.data ?? []
  },
}

export default homeApi

