import { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUsuario } from '../../context/UsuarioContext';
import FormularioCuenta from '../../components/FormularioCuenta';

export default function Perfil() {
  const { perfil, autenticado, cambiarFoto, cerrarSesion } = useUsuario();
  const scrollRef = useRef(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const iniciales = perfil.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || '')
    .join('');

  const guardarFoto = async (uri) => {
    setCargandoFoto(true);

    try {
      await cambiarFoto(uri);
    } catch (error) {
      console.error('No se pudo actualizar la foto del perfil:', error);
      Alert.alert('No se pudo guardar la foto', 'Probá con otra imagen e intentá de nuevo.');
    } finally {
      setCargandoFoto(false);
    }
  };

  const elegirFoto = async () => {
    setCargandoFoto(true);

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        await cambiarFoto(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('No se pudo elegir o guardar la foto:', error);
      Alert.alert('No se pudo actualizar la foto', 'Probá de nuevo en unos instantes.');
    } finally {
      setCargandoFoto(false);
    }
  };

  const pedirPermisoCamara = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();

      if (permiso.granted) {
        return true;
      }

      if (permiso.canAskAgain) {
        Alert.alert(
          'Se necesita permiso para la cámara',
          'Podés permitir el acceso cuando vuelvas a intentar tomar la foto.',
        );
      } else {
        Alert.alert(
          'Permiso de cámara desactivado',
          'Activá el acceso a la cámara desde los ajustes del dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir ajustes',
              onPress: () => {
                Linking.openSettings().catch((error) => {
                  console.error('No se pudieron abrir los ajustes:', error);
                  Alert.alert('No se pudieron abrir los ajustes', 'Revisá los permisos de la app.');
                });
              },
            },
          ],
        );
      }

      return false;
    } catch (error) {
      console.error('No se pudo solicitar el permiso de cámara:', error);
      Alert.alert('No se pudo acceder a la cámara', 'Revisá los permisos de la app e intentá de nuevo.');
      return false;
    }
  };

  const tomarFoto = async () => {
    setCargandoFoto(true);

    try {
      const permisoConcedido = await pedirPermisoCamara();
      if (!permisoConcedido) {
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        await cambiarFoto(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('No se pudo tomar o guardar la foto:', error);
      Alert.alert('No se pudo actualizar la foto', 'Probá de nuevo en unos instantes.');
    } finally {
      setCargandoFoto(false);
    }
  };

  const quitarFoto = () => {
    Alert.alert('Quitar foto de perfil', '¿Querés volver a usar tus iniciales?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar foto',
        style: 'destructive',
        onPress: () => guardarFoto(null),
      },
    ]);
  };

  const salir = async () => {
    setCerrandoSesion(true);

    try {
      await cerrarSesion();
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error);
      Alert.alert('No se pudo cerrar la sesión', 'Intentá de nuevo.');
    } finally {
      setCerrandoSesion(false);
    }
  };

  const asegurarCampoVisible = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  if (!autenticado) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.teclado}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text style={styles.etiquetaSuperior}>MI CUENTA</Text>
            <Text style={styles.titulo}>Perfil</Text>
            <Text style={styles.descripcion}>
              Podés explorar la tienda sin iniciar sesión. Ingresá o creá una cuenta para guardar tu perfil.
            </Text>
            <FormularioCuenta onPasswordFocus={asegurarCampoVisible} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.etiquetaSuperior}>MI CUENTA</Text>
        <Text style={styles.titulo}>Perfil</Text>

        <View style={styles.tarjetaPerfil}>
          {perfil.avatarUri ? (
            <Image source={{ uri: perfil.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarVacio]}>
              <Text style={styles.iniciales}>{iniciales}</Text>
            </View>
          )}
          <Text style={styles.nombre}>{perfil.name}</Text>
          <Text style={styles.correo}>{perfil.email}</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>Foto de perfil</Text>
          <Text style={styles.descripcion}>
            Elegí una imagen de tu galería o capturá una nueva con la cámara.
          </Text>

          {cargandoFoto ? (
            <View style={styles.indicador}>
              <ActivityIndicator size="small" color="#1B5FA8" />
              <Text style={styles.textoCarga}>Guardando foto...</Text>
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={elegirFoto}
                style={({ pressed }) => [styles.botonGaleria, pressed && styles.botonPresionado]}
              >
                <Text style={styles.textoBotonPrincipal}>Elegir de la galería</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={tomarFoto}
                style={({ pressed }) => [styles.botonCamara, pressed && styles.botonPresionado]}
              >
                <Text style={styles.textoBotonSecundario}>Tomar una fotografía</Text>
              </Pressable>
              {perfil.avatarUri ? (
                <Pressable accessibilityRole="button" onPress={quitarFoto} style={styles.botonQuitar}>
                  <Text style={styles.textoQuitar}>Quitar foto de perfil</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.tarjetaPersistencia}>
          <Text style={styles.tituloPersistencia}>Persistencia local</Text>
          <Text style={styles.textoPersistencia}>
            Tu perfil se guarda en este dispositivo y se recupera cuando volvés a abrir la tienda.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={cerrandoSesion}
          onPress={salir}
          style={({ pressed }) => [styles.botonCerrar, pressed && styles.botonPresionado]}
        >
          {cerrandoSesion ? (
            <ActivityIndicator color="#1B5FA8" />
          ) : (
            <Text style={styles.textoCerrar}>Cerrar sesión</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FA' },
  teclado: { flex: 1 },
  contenido: { padding: 20, gap: 14 },
  etiquetaSuperior: { color: '#1B5FA8', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  titulo: { fontSize: 28, fontWeight: '800', color: '#0F3D6E', marginTop: -10 },
  tarjetaPerfil: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 6,
  },
  avatar: { width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: '#1B5FA8' },
  avatarVacio: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5EEF8' },
  iniciales: { color: '#1B5FA8', fontSize: 32, fontWeight: '800' },
  nombre: { color: '#0F3D6E', fontSize: 18, fontWeight: '800', marginTop: 6 },
  correo: { color: '#5A6B84', fontSize: 13 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10 },
  tituloTarjeta: { color: '#0F3D6E', fontSize: 16, fontWeight: '800' },
  descripcion: { color: '#5A6B84', fontSize: 13, lineHeight: 18 },
  botonGaleria: {
    alignItems: 'center',
    backgroundColor: '#1B5FA8',
    borderRadius: 10,
    padding: 13,
  },
  botonCamara: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1B5FA8',
    borderRadius: 10,
    padding: 13,
  },
  botonPresionado: { opacity: 0.8 },
  textoBotonPrincipal: { color: '#fff', fontSize: 14, fontWeight: '700' },
  textoBotonSecundario: { color: '#1B5FA8', fontSize: 14, fontWeight: '700' },
  indicador: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 12 },
  textoCarga: { color: '#5A6B84', fontSize: 13 },
  botonQuitar: { alignItems: 'center', paddingVertical: 6 },
  textoQuitar: { color: '#B42318', fontSize: 13, fontWeight: '600' },
  tarjetaPersistencia: { backgroundColor: '#E5EEF8', borderRadius: 14, padding: 14, gap: 4 },
  tituloPersistencia: { color: '#0F3D6E', fontSize: 14, fontWeight: '800' },
  textoPersistencia: { color: '#5A6B84', fontSize: 12, lineHeight: 17 },
  botonCerrar: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1B5FA8',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
  },
  textoCerrar: { color: '#1B5FA8', fontSize: 14, fontWeight: '700' },
});