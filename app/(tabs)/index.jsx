import { FlatList, StyleSheet, Text } from 'react-native';
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
});