import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../HomeScreen';
import { useUserStore } from '../../../../store';

// Mock the navigation
const Stack = createNativeStackNavigator();

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useUserStore.getState();
    store.clearUser();
    store.setLoading(false);
    store.setError(null);
  });

  it('should render home screen title', () => {
    renderWithNavigation(
      <HomeScreen navigation={{} as any} route={{} as any} />,
    );
    expect(screen.getByText('ホーム画面')).toBeTruthy();
  });

  it('should render subtitle with tech stack', () => {
    renderWithNavigation(
      <HomeScreen navigation={{} as any} route={{} as any} />,
    );
    expect(
      screen.getByText('React Navigation v6 + TypeScript + Zustand'),
    ).toBeTruthy();
  });

  describe('When user is not logged in', () => {
    it('should show login button', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.getByText('ログイン')).toBeTruthy();
    });

    it('should not show user info', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.queryByText(/ログイン中:/)).toBeNull();
    });

    it('should set user when login button is pressed', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );

      const loginButton = screen.getByText('ログイン');
      fireEvent.press(loginButton);

      const store = useUserStore.getState();
      expect(store.user).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('When user is logged in', () => {
    beforeEach(() => {
      const store = useUserStore.getState();
      store.setUser({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should show user info', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.getByText('ログイン中: John Doe')).toBeTruthy();
      expect(screen.getByText('Email: john@example.com')).toBeTruthy();
    });

    it('should show logout button', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.getByText('ログアウト')).toBeTruthy();
    });

    it('should not show login button', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.queryByText('ログイン')).toBeNull();
    });

    it('should clear user when logout button is pressed', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );

      const logoutButton = screen.getByText('ログアウト');
      fireEvent.press(logoutButton);

      const store = useUserStore.getState();
      expect(store.user).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should show navigation button to details screen', () => {
      renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(screen.getByText('詳細画面へ')).toBeTruthy();
    });

    it('should call navigation.navigate when details button is pressed', () => {
      const mockNavigate = jest.fn();
      const mockNavigation = {
        navigate: mockNavigate,
      } as any;

      renderWithNavigation(
        <HomeScreen navigation={mockNavigation} route={{} as any} />,
      );

      const detailsButton = screen.getByText('詳細画面へ');
      fireEvent.press(detailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('Details', { itemId: '123' });
    });
  });

  describe('Styling', () => {
    it('should render with proper container structure', () => {
      const { root } = renderWithNavigation(
        <HomeScreen navigation={{} as any} route={{} as any} />,
      );
      expect(root).toBeTruthy();
    });
  });
});
