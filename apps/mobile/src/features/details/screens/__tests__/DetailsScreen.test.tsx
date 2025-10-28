import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailsScreen from '../DetailsScreen';

const Stack = createNativeStackNavigator();

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Details" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
};

describe('DetailsScreen', () => {
  const mockRoute = {
    params: { itemId: '123' },
  } as any;

  it('should render details screen title', () => {
    renderWithNavigation(
      <DetailsScreen navigation={{} as any} route={mockRoute} />,
    );
    expect(screen.getByText('詳細画面')).toBeTruthy();
  });

  it('should display item ID from route params', () => {
    renderWithNavigation(
      <DetailsScreen navigation={{} as any} route={mockRoute} />,
    );
    expect(screen.getByText('Item ID: 123')).toBeTruthy();
  });

  it('should show back button', () => {
    renderWithNavigation(
      <DetailsScreen navigation={{} as any} route={mockRoute} />,
    );
    expect(screen.getByText('戻る')).toBeTruthy();
  });

  it('should call navigation.goBack when back button is pressed', () => {
    const mockGoBack = jest.fn();
    const mockNavigation = {
      goBack: mockGoBack,
    } as any;

    renderWithNavigation(
      <DetailsScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const backButton = screen.getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('should display different item IDs correctly', () => {
    const differentRoute = {
      params: { itemId: '456' },
    } as any;

    renderWithNavigation(
      <DetailsScreen navigation={{} as any} route={differentRoute} />,
    );

    expect(screen.getByText('Item ID: 456')).toBeTruthy();
  });
});
