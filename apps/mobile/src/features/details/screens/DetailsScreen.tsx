import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import type { RootStackScreenProps } from '../../../types/navigation';

type Props = RootStackScreenProps<'Details'>;

const DetailsScreen = ({ route, navigation }: Props) => {
  const { itemId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>詳細画面</Text>
      <Text style={styles.text}>Item ID: {itemId}</Text>
      <Button title="戻る" onPress={() => navigation.goBack()} />
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
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 30,
  },
});

export default DetailsScreen;
