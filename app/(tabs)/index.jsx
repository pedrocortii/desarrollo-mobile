import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import useFetch from '../../hooks/useFetch';
import { fetchProducts, PRODUCTS_STORAGE_KEY } from '../../services/productsApi';

export default function Catalogo() {
  const { data: products, loading, error, refetch } = useFetch(fetchProducts, {
    initialValue: [],
    cacheKey: PRODUCTS_STORAGE_KEY,
  });

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTexto}>{error}</Text>
      <Button title="Reintentar" onPress={refetch} />
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#1B5FA8" />
          <Text style={styles.textoCarga}>Cargando productos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <View style={styles.centro}>{renderError()}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <Text style={styles.titulo}>Catálogo</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard {...item} showFavoriteButton />}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#1B5FA8" />}
        ListHeaderComponent={
          <View style={styles.encabezadoLista}>
            <View style={styles.cartel}>
              <Text style={styles.tituloCartel}>Elegí tu próximo favorito</Text>
              <Text style={styles.subtituloCartel}>
                Explorá el catálogo y encontrá algo para vos.
              </Text>
            </View>
            <Text style={styles.destacados}>Destacados</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>Todavía no hay productos para mostrar.</Text>
          </View>
        }
        ListFooterComponent={error ? renderError() : null}
      />
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
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  textoCarga: { marginTop: 12, color: '#5A6B84', fontSize: 14 },
  lista: { padding: 16, gap: 12 },
  encabezadoLista: { gap: 16 },
  cartel: {
    minHeight: 112,
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#0F3D6E',
  },
  tituloCartel: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtituloCartel: { color: '#E5EEF8', fontSize: 13, marginTop: 6 },
  destacados: { color: '#0F3D6E', fontSize: 17, fontWeight: '800' },
  vacio: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  textoVacio: { color: '#5A6B84', fontSize: 14 },
  errorContainer: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: '#FFF1F1', gap: 8 },
  errorTexto: { color: '#B42318', fontSize: 14, textAlign: 'center' },
});