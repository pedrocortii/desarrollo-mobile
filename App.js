import { useState } from 'react';
import { StyleSheet, View, Text, Image, Pressable, Alert, Platform } from 'react-native';

const FOTO = 'https://picsum.photos/id/1060/600/400';

export default function App() {
  const [vecesComprado, setVecesComprado] = useState(0);

  const comprar = () =>
    Alert.alert(
      'Confirmar compra',
      '¿Querés comprar Auriculares Pro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            setVecesComprado((prev) => prev + 1);
            Alert.alert('¡Gracias!', 'Tu compra fue registrada.');
          },
        },
      ]
    );

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <Image
          source={{ uri: FOTO }}
          style={styles.foto}
          resizeMode="cover"
        />
        <View style={styles.cuerpo}>
          <Text style={styles.titulo}>Auriculares Pro</Text>
          <Text style={styles.desc}>Sonido envolvente y batería de larga duración.</Text>
          <Text style={styles.precio}>$ 45.999</Text>

          <Pressable
            onPress={comprar}
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.botonPressed,
            ]}
          >
            <Text style={styles.textoBoton}>Comprar</Text>
          </Pressable>

          <Text style={styles.contador}>
            Agregado al carrito: {vecesComprado} {vecesComprado === 1 ? 'vez' : 'veces'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tarjeta: {
    width: 280,
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
  foto: {
    width: '100%',
    height: 160,
  },
  cuerpo: {
    padding: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F3D6E',
  },
  desc: {
    fontSize: 13,
    color: '#5A6B84',
    marginTop: 4,
  },
  precio: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  boton: {
    backgroundColor: '#1B5FA8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  botonPressed: {
    backgroundColor: '#0F3D6E',
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  contador: {
    fontSize: 13,
    color: '#5A6B84',
    marginTop: 10,
    textAlign: 'center',
  },
});