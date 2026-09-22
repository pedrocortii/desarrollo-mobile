import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import products from '../../data/products.json';
import { useFavoritos } from '../../context/FavoritosContext';

export default function ProductoDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { esFavorito, toggleFavorito } = useFavoritos();
  const [vecesComprado, setVecesComprado] = useState(0);

  const producto = products.find((item) => item.id === Number(id));

  if (!producto) {
    return (
      <SafeAreaView style={styles.centro} edges={['top']}>
        <Text style={styles.noEncontrado}>Producto no encontrado</Text>
        <Pressable style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.textoBotonVolver}>‹ Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const favorito = esFavorito(producto.id);

  const comprar = () =>
    Alert.alert('Confirmar compra', `¿Querés comprar ${producto.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Comprar',
        onPress: () => {
          setVecesComprado((prev) => prev + 1);
          Alert.alert('¡Gracias!', 'Tu compra fue registrada.');
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.textoBotonVolver}>‹ Volver</Text>
        </Pressable>

        <View style={styles.tarjeta}>
          <Image source={{ uri: producto.imagen }} style={styles.foto} resizeMode="cover" />
          <View style={styles.cuerpo}>
            <Text style={styles.categoria}>{producto.categoria}</Text>
            <Text style={styles.titulo}>{producto.nombre}</Text>
            <Text style={styles.desc}>{producto.descripcion}</Text>
            <Text style={styles.precio}>$ {producto.precio.toLocaleString('es-AR')}</Text>

            <Pressable
              onPress={() => toggleFavorito(producto.id)}
              style={({ pressed }) => [
                styles.botonFavorito,
                favorito && styles.botonFavoritoActivo,
                pressed && styles.botonPressed,
              ]}
            >
              <Text style={[styles.textoFavorito, favorito && styles.textoFavoritoActivo]}>
                {favorito ? '★ En favoritos' : '☆ Agregar a favoritos'}
              </Text>
            </Pressable>

            <Pressable
              onPress={comprar}
              style={({ pressed }) => [styles.boton, pressed && styles.botonPressedFondo]}
            >
              <Text style={styles.textoBoton}>Agregar al carrito</Text>
            </Pressable>

            <Text style={styles.contador}>
              En el carrito: {vecesComprado} {vecesComprado === 1 ? 'vez' : 'veces'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FA' },
  contenido: { padding: 20, alignItems: 'center' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  noEncontrado: { fontSize: 16, color: '#5A6B84' },
  botonVolver: { alignSelf: 'flex-start', marginBottom: 12 },
  textoBotonVolver: { fontSize: 16, color: '#1B5FA8', fontWeight: '600' },
  tarjeta: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      default: { borderWidth: 1, borderColor: '#ddd' },
    }),
  },
  foto: { width: '100%', height: 200 },
  cuerpo: { padding: 16 },
  categoria: { fontSize: 12, fontWeight: '700', color: '#1B5FA8', textTransform: 'uppercase' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#0F3D6E', marginTop: 4 },
  desc: { fontSize: 13, color: '#5A6B84', marginTop: 6 },
  precio: { fontSize: 22, fontWeight: '700', marginTop: 10, color: '#0F3D6E' },
  botonFavorito: {
    borderWidth: 1.5,
    borderColor: '#1B5FA8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  botonFavoritoActivo: { backgroundColor: '#1B5FA8' },
  botonPressed: { opacity: 0.85 },
  textoFavorito: { color: '#1B5FA8', fontWeight: 'bold', fontSize: 14 },
  textoFavoritoActivo: { color: '#fff' },
  boton: {
    backgroundColor: '#1B5FA8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonPressedFondo: { backgroundColor: '#0F3D6E', opacity: 0.9, transform: [{ scale: 0.97 }] },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  contador: { fontSize: 13, color: '#5A6B84', marginTop: 10, textAlign: 'center' },
});