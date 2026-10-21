import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from './ProductCard';

export default function FavoritoDraggableRow({ item, drag, isActive, onDelete }) {
  const swipeableRef = useRef(null);

  return (
    <ScaleDecorator>
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.nombre} de favoritos`}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(item.id);
            }}
            style={styles.botonEliminar}
          >
            <Text style={styles.textoEliminar}>Eliminar</Text>
          </Pressable>
        )}
      >
        <View style={[styles.fila, isActive && styles.filaActiva]}>
          <View style={styles.producto}>
            <ProductCard {...item} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mantener presionado para mover ${item.nombre}`}
            delayLongPress={350}
            disabled={isActive}
            onLongPress={drag}
            style={styles.asa}
          >
            <Ionicons name="reorder-three-outline" size={26} color="#1B5FA8" />
          </Pressable>
        </View>
      </ReanimatedSwipeable>
    </ScaleDecorator>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F6FA',
    borderRadius: 16,
    gap: 8,
  },
  filaActiva: {
    backgroundColor: '#E5EEF8',
    elevation: 5,
  },
  producto: { flex: 1 },
  asa: {
    width: 36,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEliminar: {
    width: 96,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B42318',
    borderRadius: 16,
    marginLeft: 8,
  },
  textoEliminar: { color: '#fff', fontWeight: '700' },
});
