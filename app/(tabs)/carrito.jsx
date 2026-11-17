import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCarrito } from '../../context/CarritoContext';

const formatearPrecio = (valor) =>
  `$ ${Number(valor).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;

function FilaCarrito({ item, onAumentar, onDisminuir, onEliminar }) {
  const subtotal = item.precio * item.cantidad;

  return (
    <View style={styles.tarjeta} testID={`fila-producto-${item.id}`}>
      <Image source={{ uri: item.imagen }} style={styles.imagen} resizeMode="cover" />

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.precioUnitario}>{formatearPrecio(item.precio)} c/u</Text>

        <View style={styles.filaAcciones}>
          <View style={styles.controlCantidad}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Quitar una unidad de ${item.nombre}`}
              hitSlop={6}
              onPress={onDisminuir}
              testID={`disminuir-producto-${item.id}`}
              style={({ pressed }) => [styles.botonCantidad, pressed && styles.botonPresionado]}
            >
              <Ionicons name="remove" size={18} color="#1B5FA8" />
            </Pressable>
            <Text style={styles.cantidad} testID={`cantidad-producto-${item.id}`}>
              {item.cantidad}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Agregar una unidad de ${item.nombre}`}
              hitSlop={6}
              onPress={onAumentar}
              testID={`aumentar-producto-${item.id}`}
              style={({ pressed }) => [styles.botonCantidad, pressed && styles.botonPresionado]}
            >
              <Ionicons name="add" size={18} color="#1B5FA8" />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.nombre} del carrito`}
            hitSlop={6}
            onPress={onEliminar}
            testID={`eliminar-producto-${item.id}`}
            style={({ pressed }) => [styles.botonEliminar, pressed && styles.botonPresionado]}
          >
            <Ionicons name="trash-outline" size={20} color="#B42318" />
          </Pressable>
        </View>

        <Text style={styles.subtotal} testID={`subtotal-producto-${item.id}`}>
          Subtotal: {formatearPrecio(subtotal)}
        </Text>
      </View>
    </View>
  );
}

export default function Carrito() {
  const router = useRouter();
  const {
    items,
    cargando,
    error,
    total,
    totalUnidades,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    vaciarCarrito,
    recargarCarrito,
  } = useCarrito();

  const confirmarAccion = (titulo, mensaje, textoConfirmar, onConfirmar) => {
    // En web, React Native Web no implementa los botones de Alert,
    // así que usamos la confirmación nativa del navegador.
    if (Platform.OS === 'web') {
      if (window.confirm(`${titulo}\n\n${mensaje}`)) {
        onConfirmar();
      }
      return;
    }

    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: textoConfirmar, style: 'destructive', onPress: onConfirmar },
    ]);
  };

  const confirmarEliminacion = (item) => {
    confirmarAccion(
      'Eliminar producto',
      `¿Querés quitar ${item.nombre} del carrito?`,
      'Eliminar',
      () => eliminarProducto(item.id),
    );
  };

  const confirmarVaciado = () => {
    confirmarAccion(
      'Vaciar carrito',
      '¿Querés eliminar todos los productos del carrito?',
      'Vaciar',
      vaciarCarrito,
    );
  };

  const irAlCatalogo = () => {
    router.navigate('/(tabs)');
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#1B5FA8" />
          <Text style={styles.textoCarga}>Cargando carrito...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoTexto}>
          <Text style={styles.titulo}>Carrito</Text>
          <Text style={styles.subtitulo}>
            {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}
          </Text>
        </View>

        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vaciar carrito"
            onPress={confirmarVaciado}
            style={({ pressed }) => [styles.botonVaciar, pressed && styles.botonPresionado]}
          >
            <Ionicons name="trash-outline" size={16} color="#B42318" />
            <Text style={styles.textoVaciar}>Vaciar</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={20} color="#B42318" />
          <View style={styles.errorContenido}>
            <Text style={styles.errorTexto}>{error}</Text>
            {items.length === 0 ? (
              <Pressable onPress={recargarCarrito}>
                <Text style={styles.errorReintentar}>Reintentar</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={styles.vacio}>
          <View style={styles.iconoVacio}>
            <Ionicons name="cart-outline" size={56} color="#1B5FA8" />
          </View>
          <Text style={styles.tituloVacio}>No tenés productos en tu carrito</Text>
          <Text style={styles.textoVacio}>
            Explorá el catálogo y agregá tus productos favoritos.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={irAlCatalogo}
            style={({ pressed }) => [styles.botonCatalogo, pressed && styles.botonPresionado]}
          >
            <Text style={styles.textoBotonCatalogo}>Volver al catálogo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <FilaCarrito
              item={item}
              onAumentar={() => aumentarCantidad(item.id)}
              onDisminuir={() => disminuirCantidad(item.id)}
              onEliminar={() => confirmarEliminacion(item)}
            />
          )}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          ListFooterComponent={
            <View style={styles.resumen}>
              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaResumen}>Cantidad de unidades</Text>
                <Text style={styles.valorResumen} testID="unidades-carrito">
                  {totalUnidades}
                </Text>
              </View>
              <View style={styles.separadorResumen} />
              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaTotal}>Total de la compra</Text>
                <Text style={styles.valorTotal} testID="total-carrito">
                  {formatearPrecio(total)}
                </Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FA' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  textoCarga: { marginTop: 12, color: '#5A6B84', fontSize: 14 },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  encabezadoTexto: { flex: 1 },
  titulo: { fontSize: 28, fontWeight: '800', color: '#0F3D6E' },
  subtitulo: { color: '#5A6B84', fontSize: 13, marginTop: 2 },
  botonVaciar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F2B8B5',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  textoVaciar: { color: '#B42318', fontSize: 12, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF1F1',
  },
  errorContenido: { flex: 1, gap: 4 },
  errorTexto: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  errorReintentar: { color: '#B42318', fontSize: 13, fontWeight: '800' },
  lista: { padding: 16, paddingBottom: 28 },
  separador: { height: 12 },
  tarjeta: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      default: { borderWidth: 1, borderColor: '#E1E8F0' },
    }),
  },
  imagen: { width: 88, height: 88, borderRadius: 12, backgroundColor: '#E5EEF8' },
  info: { flex: 1, gap: 4 },
  nombre: { color: '#0F3D6E', fontSize: 15, fontWeight: '700' },
  precioUnitario: { color: '#5A6B84', fontSize: 12 },
  filaAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  controlCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFE0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  botonCantidad: {
    width: 34,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FB',
  },
  cantidad: {
    minWidth: 34,
    textAlign: 'center',
    color: '#0F3D6E',
    fontSize: 14,
    fontWeight: '800',
  },
  botonEliminar: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
  },
  botonPresionado: { opacity: 0.7 },
  subtotal: { color: '#1B5FA8', fontSize: 13, fontWeight: '800', marginTop: 2 },
  resumen: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0F3D6E',
    gap: 10,
  },
  filaResumen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  etiquetaResumen: { color: '#D8E6F5', fontSize: 13 },
  valorResumen: { color: '#fff', fontSize: 14, fontWeight: '700' },
  separadorResumen: { height: 1, backgroundColor: '#2B5480' },
  etiquetaTotal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  valorTotal: { color: '#fff', fontSize: 22, fontWeight: '800' },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  iconoVacio: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EEF8',
    marginBottom: 4,
  },
  tituloVacio: { color: '#0F3D6E', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  textoVacio: { color: '#5A6B84', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  botonCatalogo: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1B5FA8',
  },
  textoBotonCatalogo: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
