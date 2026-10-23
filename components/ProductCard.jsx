import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../context/FavoritosContext';

export default function ProductCard({ id, nombre, precio, categoria, imagen, showFavoriteButton = false }) {
  const router = useRouter();
  const { favoritosCargados, esFavorito, toggleFavorito } = useFavoritos();
  const favorito = esFavorito(id);

  const abrirDetalle = () => {
    router.push({ pathname: '/producto/[id]', params: { id: String(id) } });
  };

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${nombre}`}
        onPress={abrirDetalle}
        style={({ pressed }) => [styles.detalle, pressed && styles.cardPressed]}
      >
        <Image source={{ uri: imagen }} style={styles.imagen} resizeMode="cover" />
        <View style={styles.info}>
          <Text style={styles.categoria} numberOfLines={1}>{categoria}</Text>
          <Text style={styles.nombre} numberOfLines={2}>{nombre}</Text>
          <Text style={styles.precio}>$ {precio.toLocaleString('es-AR')}</Text>
        </View>
      </Pressable>
      {showFavoriteButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorito ? `Quitar ${nombre} de favoritos` : `Agregar ${nombre} a favoritos`}
          accessibilityState={{ checked: favorito, disabled: !favoritosCargados }}
          disabled={!favoritosCargados}
          onPress={() => toggleFavorito(id)}
          hitSlop={8}
          style={({ pressed }) => [styles.botonFavorito, pressed && styles.botonFavoritoPresionado]}
        >
          <Ionicons
            name={favorito ? 'star' : 'star-outline'}
            size={24}
            color={favorito ? '#F2A900' : '#1B5FA8'}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      default: { borderWidth: 1, borderColor: '#ddd' },
    }),
  },
  detalle: { flex: 1, flexDirection: 'row', gap: 12 },
  cardPressed: { opacity: 0.85 },
  imagen: { width: 110, height: 110 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  categoria: { fontSize: 12, fontWeight: '700', color: '#1B5FA8', textTransform: 'uppercase' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#0F3D6E', marginTop: 4 },
  precio: { fontSize: 16, fontWeight: '700', marginTop: 6, color: '#0F3D6E' },
  botonFavorito: { width: 48, alignItems: 'center', justifyContent: 'center' },
  botonFavoritoPresionado: { opacity: 0.65 },
});