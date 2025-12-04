import { useCallback, useEffect, useState } from 'react';
import {
  fetchFavorites,
  toggleFavorite,
  fetchCollections,
  createCollection,
  addItemToCollection,
  removeItemFromCollection,
} from '../services/favorites.api';
import { FavoriteItem, Collection } from '../types/favorites.types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchFavorites(), fetchCollections()]).then(([fav, cols]) => {
      setFavorites(fav);
      setCollections(cols);
      setIsLoading(false);
    });
  }, []);

  // Backwards-compatible API: isFavorite accepts (id, type?)
  const isFavorite = useCallback(
    (id: string, _type?: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  const toggle = useCallback(async (item: FavoriteItem) => {
    setIsLoading(true);
    const res = await toggleFavorite(item);
    if (res.favorite) {
      setFavorites((prev) => [...prev, item]);
    } else {
      setFavorites((prev) => prev.filter((i) => i.id !== item.id));
    }
    setIsLoading(false);
    return res;
  }, []);

  // Backwards-compatible add/remove functions (accept id and type)
  const addToFavorites = useCallback(async (idOrItem: string | FavoriteItem, type?: string) => {
    setIsLoading(true);
    const item: FavoriteItem = typeof idOrItem === 'string' ? { id: idOrItem, title: idOrItem, type: type || 'unknown' } : idOrItem;
    const res = await toggleFavorite(item);
    if (res.favorite) {
      setFavorites((prev) => [...prev, item]);
    }
    setIsLoading(false);
    return res;
  }, []);

  const removeFromFavorites = useCallback(async (id: string, _type?: string) => {
    setIsLoading(true);
    const item: FavoriteItem = { id, title: id };
    const res = await toggleFavorite(item);
    if (!res.favorite) {
      setFavorites((prev) => prev.filter((i) => i.id !== id));
    }
    setIsLoading(false);
    return res;
  }, []);

  const addCollection = useCallback(async (name: string, description?: string) => {
    setIsLoading(true);
    const col = await createCollection(name, description);
    setCollections((prev) => [...prev, col]);
    setIsLoading(false);
    return col;
  }, []);

  const addToCollection = useCallback(async (collectionId: string, item: FavoriteItem) => {
    setIsLoading(true);
    await addItemToCollection(collectionId, item);
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, items: [...c.items, item] } : c))
    );
    setIsLoading(false);
  }, []);

  const removeFromCollection = useCallback(async (collectionId: string, itemId: string) => {
    setIsLoading(true);
    await removeItemFromCollection(collectionId, itemId);
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)));
    setIsLoading(false);
  }, []);

  return {
    favorites,
    collections,
    isLoading,
    isFavorite,
    toggle,
    addToFavorites,
    removeFromFavorites,
    addCollection,
    addToCollection,
    removeFromCollection,
  };
};

export default useFavorites;
