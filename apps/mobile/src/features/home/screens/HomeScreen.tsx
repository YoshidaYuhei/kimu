import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import type { RootStackScreenProps } from '../../../types/navigation';
import { useUserStore } from '../../../store';

type Props = RootStackScreenProps<'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { user, setUser, clearUser } = useUserStore();

  const handleLogin = () => {
    setUser({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ホーム画面</Text>
      <Text style={styles.subtitle}>
        React Navigation v6 + TypeScript + Zustand
      </Text>

      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>ログイン中: {user.name}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>
          <Button title="ログアウト" onPress={clearUser} />
        </View>
      ) : (
        <Button title="ログイン" onPress={handleLogin} />
      )}

      <View style={styles.spacer} />

      <Button
        title="詳細画面へ"
        onPress={() => navigation.navigate('Details', { itemId: '123' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userText: {
    fontSize: 16,
    marginBottom: 8,
  },
  spacer: {
    height: 20,
  },
});

export default HomeScreen;
