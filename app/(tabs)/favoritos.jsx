import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import products from '../../data/products.json';
import { useFavoritos } from '../../context/FavoritosContext';

export default function Favoritos() {
  const { favoritos } = useFavoritos();
  const productosFavoritos = products.filter((item) => favoritos.includes(item.id));

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <Text style={styles.titulo}>Favoritos</Text>
      <FlatList
        data={productosFavoritos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard {...item} />}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>Todavía no agregaste favoritos.</Text>
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
  lista: { padding: 16, gap: 12, flexGrow: 1 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  textoVacio: { color: '#5A6B84', fontSize: 14 },
});