import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';

export default function FormularioCuenta({ onPasswordFocus }) {
  const { iniciarSesion, registrarCuenta, usuarioListo } = useUsuario();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const cambiarModo = (nuevoModo) => {
    setModoRegistro(nuevoModo);
    setError('');
  };

  const enviar = async () => {
    setError('');

    if (modoRegistro && password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setProcesando(true);
    try {
      if (modoRegistro) {
        await registrarCuenta(nombre, email, password);
      } else {
        await iniciarSesion(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la cuenta.');
    } finally {
      setProcesando(false);
    }
  };

  const deshabilitado = !usuarioListo || procesando;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{modoRegistro ? 'Crear una cuenta' : 'Iniciar sesión'}</Text>
      <Text style={styles.descripcion}>
        {modoRegistro
          ? 'Registrate para guardar tu perfil en este dispositivo.'
          : 'Ingresá con el correo y la contraseña de tu cuenta.'}
      </Text>

      {modoRegistro ? (
        <>
          <Text style={styles.etiqueta}>Nombre</Text>
          <TextInput
            accessibilityLabel="Nombre"
            style={styles.campo}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            autoCapitalize="words"
            autoComplete="name"
            editable={!procesando}
            returnKeyType="next"
          />
        </>
      ) : null}

      <Text style={styles.etiqueta}>Correo electrónico</Text>
      <TextInput
        accessibilityLabel="Correo electrónico"
        style={styles.campo}
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!procesando}
        returnKeyType="next"
      />

      <Text style={styles.etiqueta}>Contraseña</Text>
      <View style={styles.campoConOjo}>
        <TextInput
          accessibilityLabel="Contraseña"
          style={styles.campoConAccion}
          value={password}
          onChangeText={setPassword}
          placeholder={modoRegistro ? 'Mínimo 8 caracteres, una letra y un número' : 'Tu contraseña'}
          secureTextEntry={!mostrarPassword}
          autoCapitalize="none"
          autoComplete={modoRegistro ? 'new-password' : 'password'}
          editable={!procesando}
          onFocus={modoRegistro ? onPasswordFocus : undefined}
          onSubmitEditing={enviar}
          returnKeyType={modoRegistro ? 'next' : 'go'}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          accessibilityState={{ checked: mostrarPassword }}
          onPress={() => setMostrarPassword((visible) => !visible)}
          hitSlop={8}
          style={styles.botonOjo}
        >
          <Ionicons
            name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#5A6B84"
          />
        </Pressable>
      </View>

      {modoRegistro ? (
        <>
          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <View style={styles.campoConOjo}>
            <TextInput
              accessibilityLabel="Confirmar contraseña"
              style={styles.campoConAccion}
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              placeholder="Repetí tu contraseña"
              secureTextEntry={!mostrarConfirmacion}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!procesando}
              onFocus={onPasswordFocus}
              onSubmitEditing={enviar}
              returnKeyType="go"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={mostrarConfirmacion ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
              accessibilityState={{ checked: mostrarConfirmacion }}
              onPress={() => setMostrarConfirmacion((visible) => !visible)}
              hitSlop={8}
              style={styles.botonOjo}
            >
              <Ionicons
                name={mostrarConfirmacion ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#5A6B84"
              />
            </Pressable>
          </View>
        </>
      ) : null}

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={deshabilitado}
        onPress={enviar}
        style={({ pressed }) => [
          styles.boton,
          pressed && styles.botonPresionado,
          deshabilitado && styles.botonDeshabilitado,
        ]}
      >
        {procesando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>
            {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={procesando}
        onPress={() => cambiarModo(!modoRegistro)}
        style={styles.botonAlternativo}
      >
        <Text style={styles.textoAlternativo}>
          {modoRegistro ? 'Ya tengo una cuenta' : '¿No tenés cuenta? Crear una'}
        </Text>
      </Pressable>

      <Text style={styles.aviso}>
        Las cuentas y contraseñas se guardan solo en este dispositivo; no hay un servidor de
        autenticación.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 10 },
  titulo: { color: '#0F3D6E', fontSize: 18, fontWeight: '800' },
  descripcion: { color: '#5A6B84', fontSize: 13, lineHeight: 18, marginBottom: 2 },
  etiqueta: { color: '#0F3D6E', fontSize: 14, fontWeight: '700' },
  campo: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    color: '#0F3D6E',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  campoConOjo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  campoConAccion: {
    flex: 1,
    minWidth: 0,
    color: '#0F3D6E',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  botonOjo: { paddingHorizontal: 12, paddingVertical: 8 },
  error: { color: '#B42318', fontSize: 14 },
  boton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5FA8',
    borderRadius: 10,
    marginTop: 4,
    padding: 12,
  },
  botonPresionado: { backgroundColor: '#0F3D6E' },
  botonDeshabilitado: { opacity: 0.6 },
  textoBoton: { color: '#fff', fontSize: 15, fontWeight: '700' },
  botonAlternativo: { alignItems: 'center', padding: 8 },
  textoAlternativo: { color: '#1B5FA8', fontSize: 14, fontWeight: '700' },
  aviso: { color: '#5A6B84', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
