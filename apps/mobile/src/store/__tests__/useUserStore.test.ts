import { renderHook, act } from '@testing-library/react-native';
import { useUserStore } from '../useUserStore';
import type { User } from '../types';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.clearUser();
      result.current.setLoading(false);
      result.current.setError(null);
    });
  });

  describe('Initial state', () => {
    it('should have null user initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.user).toBeNull();
    });

    it('should have isLoading false initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.isLoading).toBe(false);
    });

    it('should have null error initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and clear error', () => {
      const { result } = renderHook(() => useUserStore());
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('should clear previous error when setting user', () => {
      const { result } = renderHook(() => useUserStore());
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      act(() => {
        result.current.setError('Previous error');
      });
      expect(result.current.error).toBe('Previous error');

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user and error', () => {
      const { result } = renderHook(() => useUserStore());
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      act(() => {
        result.current.setUser(mockUser);
        result.current.setError('Some error');
      });

      act(() => {
        result.current.clearUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useUserStore());
      const errorMessage = 'Something went wrong';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setError('Error message');
      });
      expect(result.current.error).toBe('Error message');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should handle complete user flow', () => {
      const { result } = renderHook(() => useUserStore());
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Start loading
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      // Set user
      act(() => {
        result.current.setUser(mockUser);
        result.current.setLoading(false);
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Clear user
      act(() => {
        result.current.clearUser();
      });
      expect(result.current.user).toBeNull();
    });

    it('should handle error flow', () => {
      const { result } = renderHook(() => useUserStore());
      const errorMessage = 'Failed to load user';

      // Start loading
      act(() => {
        result.current.setLoading(true);
      });

      // Set error
      act(() => {
        result.current.setError(errorMessage);
        result.current.setLoading(false);
      });
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
