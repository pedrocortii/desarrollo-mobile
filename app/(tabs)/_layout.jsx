import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCarrito } from '../../context/CarritoContext';

export default function TabsLayout() {
  const { totalUnidades } = useCarrito();

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B5FA8' }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catálogo',
          tabBarLabel: 'Catálogo',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
          tabBarBadge: totalUnidades > 0 ? (totalUnidades > 99 ? '99+' : totalUnidades) : undefined,
          tabBarBadgeStyle: { backgroundColor: '#1B5FA8', color: '#fff', fontSize: 11 },
        }}
      />
    </Tabs>
  );
}