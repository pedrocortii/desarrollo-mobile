import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import FavoritoDraggableRow from '../../components/FavoritoDraggableRow';
import { useFavoritos } from '../../context/FavoritosContext';
import useFetch from '../../hooks/useFetch';
import { fetchProducts, PRODUCTS_STORAGE_KEY } from '../../services/productsApi';

export default function Favoritos() {
  const { favoritos, favoritosCargados, quitarFavorito, reordenarFavoritos } = useFavoritos();
  const { data: products, loading, error } = useFetch(fetchProducts, {
    initialValue: [],
    cacheKey: PRODUCTS_STORAGE_KEY,
  });
  const productosPorId = new Map(products.map((product) => [product.id, product]));
  const productosFavoritos = favoritos
    .map((id) => productosPorId.get(id))
    .filter(Boolean);

  const confirmarEliminacion = (id) => {
    const producto = productosPorId.get(id);

    Alert.alert(
      'Eliminar favorito',
      `¿Querés quitar ${producto?.nombre || 'este producto'} de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => quitarFavorito(id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <Text style={styles.titulo}>Favoritos</Text>
      <Text style={styles.instrucciones}>
        Deslizá un favorito para eliminarlo. Mantené presionado el asa para reordenarlo.
      </Text>

      {(!favoritosCargados || (loading && products.length === 0)) ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#1B5FA8" />
          <Text style={styles.textoCarga}>Cargando favoritos...</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={productosFavoritos}
          keyExtractor={(item) => String(item.id)}
          activationDistance={12}
          onDragEnd={({ data }) => reordenarFavoritos(data.map((item) => item.id))}
          renderItem={({ item, drag, isActive }) => (
            <FavoritoDraggableRow
              item={item}
              drag={drag}
              isActive={isActive}
              onDelete={confirmarEliminacion}
            />
          )}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>
                {error ? error : 'Todavía no agregaste favoritos.'}
              </Text>
            </View>
          }
          ListFooterComponent={error && productosFavoritos.length > 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>{error}</Text>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FA' },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F3D6E',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  instrucciones: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    color: '#5A6B84',
    fontSize: 13,
  },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  textoCarga: { marginTop: 12, color: '#5A6B84', fontSize: 14 },
  lista: { padding: 16, flexGrow: 1 },
  separador: { height: 12 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  textoVacio: { color: '#5A6B84', fontSize: 14, textAlign: 'center' },
});