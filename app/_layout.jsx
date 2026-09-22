import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritosProvider } from '../context/FavoritosContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FavoritosProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="producto/[id]" options={{ headerShown: false }} />
        </Stack>
      </FavoritosProvider>
    </SafeAreaProvider>
  );
}