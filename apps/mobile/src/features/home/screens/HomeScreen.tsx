import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import type { RootStackScreenProps } from '../../../types/navigation';

type Props = RootStackScreenProps<'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ホーム画面</Text>
      <Text style={styles.subtitle}>React Navigation v6 + TypeScript</Text>
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
  },
});

export default HomeScreen;
