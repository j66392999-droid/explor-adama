import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';

/**
 * A typed version of useDispatch hook
 * @returns The typed dispatch function from Redux store
 * 
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(someAction());
 * dispatch(someAsyncThunk());
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;