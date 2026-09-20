import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Perfil() {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Perfil</Text>
        <Text style={styles.texto}>Pedro</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FA' },
  contenido: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#0F3D6E' },
  texto: { fontSize: 16, color: '#5A6B84' },
});