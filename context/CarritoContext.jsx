import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

const CarritoContext = createContext(null);
const CARRITO_STORAGE_KEY = '@mi-tarjeta/carrito';

// Un producto solo puede entrar al carrito si tiene los datos mínimos
// que la pantalla necesita para mostrarlo y calcular su subtotal.
function esProductoValido(producto) {
  const id = Number(producto?.id);
  const precio = Number(producto?.precio);

  return (
    producto !== null &&
    typeof producto === 'object' &&
    Number.isInteger(id) &&
    id > 0 &&
    typeof producto.nombre === 'string' &&
    producto.nombre.trim().length > 0 &&
    producto.precio !== null &&
    producto.precio !== '' &&
    Number.isFinite(precio) &&
    precio >= 0 &&
    typeof producto.imagen === 'string' &&
    producto.imagen.trim().length > 0
  );
}

function normalizarProducto(producto) {
  if (!esProductoValido(producto)) {
    return null;
  }

  return {
    id: Number(producto.id),
    nombre: producto.nombre.trim(),
    precio: Number(producto.precio),
    imagen: producto.imagen,
  };
}

function esItemCarritoValido(item) {
  return (
    esProductoValido(item) &&
    Number.isInteger(item.cantidad) &&
    item.cantidad > 0
  );
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [carritoCargado, setCarritoCargado] = useState(false);
  const [errorAlmacenamiento, setErrorAlmacenamiento] = useState(null);
  const avisoGuardadoMostrado = useRef(false);
  const errorEsDeGuardado = useRef(false);

  // Lee el carrito guardado cuando se inicia la aplicación.
  const cargarCarrito = useCallback(async () => {
    setCarritoCargado(false);
    setErrorAlmacenamiento(null);

    try {
      const guardado = await AsyncStorage.getItem(CARRITO_STORAGE_KEY);

      if (guardado !== null) {
        const carritoGuardado = JSON.parse(guardado);

        if (!Array.isArray(carritoGuardado) || !carritoGuardado.every(esItemCarritoValido)) {
          throw new Error('El formato del carrito guardado no es válido.');
        }

        setItems(carritoGuardado);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('No se pudo recuperar el carrito guardado:', error);
      setItems([]);
      errorEsDeGuardado.current = false;
      setErrorAlmacenamiento(
        'No se pudo recuperar el carrito guardado. Podés volver a agregar tus productos.',
      );
      Alert.alert(
        'No se pudo cargar el carrito',
        'La app no pudo recuperar los productos guardados en este dispositivo.',
      );
    } finally {
      setCarritoCargado(true);
    }
  }, []);

  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  // Cada cambio en los productos se guarda en AsyncStorage.
  // Se espera a que termine la carga inicial para no sobrescribir datos.
  useEffect(() => {
    if (!carritoCargado) {
      return undefined;
    }

    let activo = true;

    AsyncStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(items))
      .then(() => {
        if (activo) {
          avisoGuardadoMostrado.current = false;

          // Si el error anterior era de escritura, ya se resolvió.
          if (errorEsDeGuardado.current) {
            errorEsDeGuardado.current = false;
            setErrorAlmacenamiento(null);
          }
        }
      })
      .catch((error) => {
        console.error('No se pudieron guardar los cambios del carrito:', error);

        if (!activo) {
          return;
        }

        errorEsDeGuardado.current = true;
        setErrorAlmacenamiento(
          'No se pudieron guardar los cambios. El carrito podría no conservarse al cerrar la app.',
        );

        // Evitamos mostrar una alerta por cada intento de guardado fallido.
        if (!avisoGuardadoMostrado.current) {
          avisoGuardadoMostrado.current = true;
          Alert.alert(
            'No se pudo guardar el carrito',
            'Los cambios de esta sesión podrían perderse al cerrar la aplicación.',
          );
        }
      });

    return () => {
      activo = false;
    };
  }, [items, carritoCargado]);

  // Agrega una unidad del producto. Si ya existe, incrementa su cantidad.
  const agregarProducto = useCallback(
    (producto) => {
      if (!carritoCargado) {
        return false;
      }

      const productoNormalizado = normalizarProducto(producto);
      if (!productoNormalizado) {
        return false;
      }

      setItems((actuales) => {
        const existe = actuales.some((item) => item.id === productoNormalizado.id);

        if (existe) {
          return actuales.map((item) =>
            item.id === productoNormalizado.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          );
        }

        return [...actuales, { ...productoNormalizado, cantidad: 1 }];
      });

      return true;
    },
    [carritoCargado],
  );

  const aumentarCantidad = useCallback(
    (id) => {
      if (!carritoCargado) {
        return;
      }

      setItems((actuales) =>
        actuales.map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item,
        ),
      );
    },
    [carritoCargado],
  );

  // Si la cantidad llega a cero, el producto se quita de la lista.
  const disminuirCantidad = useCallback(
    (id) => {
      if (!carritoCargado) {
        return;
      }

      setItems((actuales) =>
        actuales
          .map((item) =>
            item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item,
          )
          .filter((item) => item.cantidad > 0),
      );
    },
    [carritoCargado],
  );

  const eliminarProducto = useCallback(
    (id) => {
      if (!carritoCargado) {
        return;
      }

      setItems((actuales) => actuales.filter((item) => item.id !== id));
    },
    [carritoCargado],
  );

  const vaciarCarrito = useCallback(() => {
    if (!carritoCargado) {
      return;
    }

    setItems([]);
  }, [carritoCargado]);

  const cantidadDeProducto = useCallback(
    (id) => items.find((item) => item.id === id)?.cantidad ?? 0,
    [items],
  );

  // El total y las unidades se recalculan automáticamente con cada cambio.
  const totalUnidades = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((totalActual, item) => totalActual + item.precio * item.cantidad, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      carritoCargado,
      cargando: !carritoCargado,
      error: errorAlmacenamiento,
      total,
      totalUnidades,
      agregarProducto,
      aumentarCantidad,
      disminuirCantidad,
      eliminarProducto,
      vaciarCarrito,
      cantidadDeProducto,
      recargarCarrito: cargarCarrito,
    }),
    [
      items,
      carritoCargado,
      errorAlmacenamiento,
      total,
      totalUnidades,
      agregarProducto,
      aumentarCantidad,
      disminuirCantidad,
      eliminarProducto,
      vaciarCarrito,
      cantidadDeProducto,
      cargarCarrito,
    ],
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }

  return context;
}
