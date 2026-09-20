import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProductCard({ id, nombre, precio, categoria, imagen }) {
  const router = useRouter();

  const abrirDetalle = () => {
    router.push({ pathname: '/producto/[id]', params: { id: String(id) } });
  };

  return (
    <Pressable
      onPress={abrirDetalle}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image source={{ uri: imagen }} style={styles.imagen} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.categoria}>{categoria}</Text>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.precio}>$ {precio.toLocaleString('es-AR')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
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
  cardPressed: { opacity: 0.85 },
  imagen: { width: 110, height: 110 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  categoria: { fontSize: 12, fontWeight: '700', color: '#1B5FA8', textTransform: 'uppercase' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#0F3D6E', marginTop: 4 },
  precio: { fontSize: 16, fontWeight: '700', marginTop: 6, color: '#0F3D6E' },
});