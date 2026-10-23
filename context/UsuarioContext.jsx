import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

const UsuarioContext = createContext(null);
const PERFIL_STORAGE_KEY = '@mi-tienda:profile';
const CUENTAS_STORAGE_KEY = '@mi-tienda:accounts';
const SESION_STORAGE_KEY = '@mi-tienda:session';
const PERFIL_INICIAL = {
  name: '',
  email: '',
  avatarUri: null,
};
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLAVE_MINIMA = 8;

const clavePerfilDe = (email) => `${PERFIL_STORAGE_KEY}:${encodeURIComponent(email)}`;

function esPerfilValido(perfil) {
  return (
    perfil !== null &&
    typeof perfil === 'object' &&
    typeof perfil.name === 'string' &&
    typeof perfil.email === 'string' &&
    (perfil.avatarUri === null || typeof perfil.avatarUri === 'string')
  );
}

function esCuentaValida(cuenta) {
  return (
    cuenta !== null &&
    typeof cuenta === 'object' &&
    typeof cuenta.name === 'string' &&
    typeof cuenta.email === 'string' &&
    typeof cuenta.salt === 'string' &&
    typeof cuenta.passwordHash === 'string'
  );
}

function validarEmail(email) {
  const correo = email.trim().toLowerCase();
  if (!FORMATO_EMAIL.test(correo)) {
    throw new Error('Ingresá un correo electrónico válido.');
  }
  return correo;
}

function validarPassword(password) {
  if (
    typeof password !== 'string' ||
    password.length < CLAVE_MINIMA ||
    !/[a-zA-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new Error('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
  }
}

function generarSalt() {
  return Array.from(Crypto.getRandomBytes(16), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hashPassword(password, salt) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function eliminarFotoAnterior(uri) {
  if (Platform.OS !== 'web' && uri && uri.startsWith(Paths.document.uri)) {
    const archivo = new File(uri);
    if (archivo.exists) {
      archivo.delete();
    }
  }
}

async function guardarFotoWeb(uri) {
  const respuesta = await fetch(uri);
  if (!respuesta.ok) {
    throw new Error('No se pudo leer la imagen seleccionada.');
  }

  const imagenOriginal = await respuesta.blob();
  const urlTemporal = URL.createObjectURL(imagenOriginal);

  try {
    const imagen = await new Promise((resolve, reject) => {
      const elemento = new Image();
      elemento.onload = () => resolve(elemento);
      elemento.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      elemento.src = urlTemporal;
    });
    const escala = Math.min(1, 800 / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.round(imagen.width * escala));
    lienzo.height = Math.max(1, Math.round(imagen.height * escala));

    const contexto = lienzo.getContext('2d');
    if (!contexto) {
      throw new Error('No se pudo preparar la imagen para guardarla.');
    }

    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    return lienzo.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(urlTemporal);
  }
}

export function UsuarioProvider({ children }) {
  const [perfil, setPerfil] = useState(PERFIL_INICIAL);
  const [cuentas, setCuentas] = useState([]);
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioListo, setUsuarioListo] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarUsuario = async () => {
      try {
        const datos = await AsyncStorage.multiGet([CUENTAS_STORAGE_KEY, SESION_STORAGE_KEY]);
        const cuentasGuardadas = datos[0][1] ? JSON.parse(datos[0][1]) : [];

        if (!Array.isArray(cuentasGuardadas) || !cuentasGuardadas.every(esCuentaValida)) {
          throw new Error('El formato de las cuentas guardadas no es válido.');
        }

        const correoSesion = datos[1][1];
        const cuentaActiva = cuentasGuardadas.find((cuenta) => cuenta.email === correoSesion);
        let perfilActivo = PERFIL_INICIAL;

        if (cuentaActiva) {
          const perfilGuardado = await AsyncStorage.getItem(clavePerfilDe(cuentaActiva.email));
          const perfilAnterior = perfilGuardado
            ? JSON.parse(perfilGuardado)
            : { ...cuentaActiva, avatarUri: null };

          if (!esPerfilValido(perfilAnterior) || perfilAnterior.email !== cuentaActiva.email) {
            throw new Error('El formato del perfil guardado no es válido.');
          }
          perfilActivo = perfilAnterior;
        } else if (correoSesion) {
          await AsyncStorage.removeItem(SESION_STORAGE_KEY);
        }

        if (activo) {
          setCuentas(cuentasGuardadas);
          setPerfil(perfilActivo);
          setAutenticado(Boolean(cuentaActiva));
        }
      } catch (error) {
        console.error('No se pudieron recuperar las cuentas guardadas:', error);
        Alert.alert('No se pudo cargar la cuenta', 'Podés crear una cuenta o iniciar sesión de nuevo.');
        if (activo) {
          setCuentas([]);
          setPerfil(PERFIL_INICIAL);
          setAutenticado(false);
        }
      } finally {
        if (activo) {
          setUsuarioListo(true);
        }
      }
    };

    cargarUsuario();

    return () => {
      activo = false;
    };
  }, []);

  const registrarCuenta = async (nombre, email, password) => {
    const nombreCompleto = nombre.trim();
    const correo = validarEmail(email);

    if (nombreCompleto.length < 2) {
      throw new Error('Ingresá tu nombre (al menos 2 caracteres).');
    }
    validarPassword(password);

    if (cuentas.some((cuenta) => cuenta.email === correo)) {
      throw new Error('Ya existe una cuenta con ese correo. Iniciá sesión.');
    }

    const salt = generarSalt();
    const nuevaCuenta = {
      name: nombreCompleto,
      email: correo,
      salt,
      passwordHash: await hashPassword(password, salt),
    };
    const perfilNuevo = { name: nombreCompleto, email: correo, avatarUri: null };
    const cuentasActualizadas = [...cuentas, nuevaCuenta];

    await AsyncStorage.multiSet([
      [CUENTAS_STORAGE_KEY, JSON.stringify(cuentasActualizadas)],
      [clavePerfilDe(correo), JSON.stringify(perfilNuevo)],
      [PERFIL_STORAGE_KEY, JSON.stringify(perfilNuevo)],
      [SESION_STORAGE_KEY, correo],
    ]);
    setCuentas(cuentasActualizadas);
    setPerfil(perfilNuevo);
    setAutenticado(true);
  };

  const iniciarSesion = async (email, password) => {
    const correo = validarEmail(email);

    if (!password) {
      throw new Error('Ingresá tu contraseña para continuar.');
    }

    const cuenta = cuentas.find((item) => item.email === correo);
    if (!cuenta) {
      throw new Error('El correo o la contraseña no son correctos.');
    }

    const passwordHash = await hashPassword(password, cuenta.salt);
    if (passwordHash !== cuenta.passwordHash) {
      throw new Error('El correo o la contraseña no son correctos.');
    }

    const perfilGuardado = await AsyncStorage.getItem(clavePerfilDe(correo));
    const perfilActual = perfilGuardado
      ? JSON.parse(perfilGuardado)
      : { name: cuenta.name, email: cuenta.email, avatarUri: null };

    if (!esPerfilValido(perfilActual) || perfilActual.email !== correo) {
      throw new Error('No se pudo recuperar el perfil de esta cuenta.');
    }

    await AsyncStorage.multiSet([
      [clavePerfilDe(correo), JSON.stringify(perfilActual)],
      [SESION_STORAGE_KEY, correo],
    ]);
    setPerfil(perfilActual);
    setAutenticado(true);
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem(SESION_STORAGE_KEY);
    setPerfil(PERFIL_INICIAL);
    setAutenticado(false);
  };

  const actualizarPerfil = async (cambios) => {
    if (!autenticado) {
      throw new Error('Iniciá sesión para actualizar tu perfil.');
    }

    const perfilActualizado = { ...perfil, ...cambios };
    await AsyncStorage.multiSet([
      [clavePerfilDe(perfil.email), JSON.stringify(perfilActualizado)],
      [PERFIL_STORAGE_KEY, JSON.stringify(perfilActualizado)],
    ]);
    setPerfil(perfilActualizado);
  };

  const cambiarFoto = async (uri) => {
    const fotoAnterior = perfil.avatarUri;
    let uriGuardada = uri;
    let archivoNuevo = null;

    if (uri) {
      if (Platform.OS === 'web') {
        uriGuardada = await guardarFotoWeb(uri);
      } else {
        const extensionOriginal = new File(uri).extension.toLowerCase();
        const extension = ['.jpg', '.jpeg', '.png', '.webp', '.heic'].includes(extensionOriginal)
          ? extensionOriginal
          : '.jpg';
        archivoNuevo = new File(Paths.document, `avatar-${Date.now()}${extension}`);
        await new File(uri).copy(archivoNuevo);
        uriGuardada = archivoNuevo.uri;
      }
    }

    try {
      await actualizarPerfil({ avatarUri: uriGuardada });
    } catch (error) {
      try {
        if (archivoNuevo?.exists) {
          archivoNuevo.delete();
        }
      } catch (errorAlEliminar) {
        console.error('No se pudo limpiar la foto temporal del perfil:', errorAlEliminar);
      }
      throw error;
    }

    if (fotoAnterior && fotoAnterior !== uriGuardada) {
      try {
        eliminarFotoAnterior(fotoAnterior);
      } catch (error) {
        console.error('No se pudo eliminar la foto anterior del perfil:', error);
      }
    }
  };

  const value = useMemo(
    () => ({
      perfil,
      autenticado,
      usuarioListo,
      iniciarSesion,
      registrarCuenta,
      cerrarSesion,
      actualizarPerfil,
      cambiarFoto,
    }),
    [perfil, cuentas, autenticado, usuarioListo],
  );

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const context = useContext(UsuarioContext);

  if (!context) {
    throw new Error('useUsuario debe usarse dentro de UsuarioProvider');
  }

  return context;
}
