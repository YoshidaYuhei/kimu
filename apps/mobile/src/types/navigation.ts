import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Details: { itemId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
