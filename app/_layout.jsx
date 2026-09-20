import { Stack } from 'expo-router';
import { FavoritosProvider } from '../context/FavoritosContext';

export default function RootLayout() {
  return (
    <FavoritosProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="producto/[id]" options={{ headerShown: false }} />
      </Stack>
    </FavoritosProvider>
  );
}