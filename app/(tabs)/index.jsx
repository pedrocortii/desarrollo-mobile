import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import products from '../../data/products.json';

export default function Catalogo() {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <Text style={styles.titulo}>Catálogo</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard {...item} />}
        contentContainerStyle={styles.lista}
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
});