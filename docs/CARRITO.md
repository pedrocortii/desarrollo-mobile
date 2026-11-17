# Carrito de compras

Documentación de la funcionalidad de carrito y de la actualización de dependencias.

## 1. Resumen

- Se agregó una pestaña **Carrito** a la navegación inferior.
- El botón **Agregar al carrito** del detalle de producto agrega productos reales obtenidos desde la API.
- El carrito persiste en `AsyncStorage` y se recupera al iniciar la aplicación.
- Toda la lógica está en `context/CarritoContext.jsx` y se consume con `useCarrito()`.
- No se modificaron `UsuarioContext` ni `FavoritosContext`.
- No se reemplazaron datos de la API por productos inventados.

## 2. Archivos nuevos

- `context/CarritoContext.jsx`: estado, acciones, totales y persistencia del carrito.
- `app/(tabs)/carrito.jsx`: pantalla de carrito.
- `docs/CARRITO.md`: este documento.

## 3. Archivos modificados

- `app/_layout.jsx`: se agregó `CarritoProvider` dentro de los proveedores existentes.
- `app/(tabs)/_layout.jsx`: se agregó la pestaña Carrito, su ícono y el indicador de unidades.
- `app/producto/[id].jsx`: el botón de compra ahora agrega al carrito y muestra la cantidad real.
- `package.json` y `package-lock.json`: actualización de dependencias compatibles con Expo SDK 57.
- `app.json`: se agregó el config plugin `expo-font` requerido por `@expo/vector-icons`.

## 4. Versiones

| Paquete | Antes | Después |
| --- | --- | --- |
| expo | 57.0.31 | 57.0.33 |
| expo-router | 57.0.29 | 57.0.31 |
| expo-constants | 57.0.19 (rango) / 57.0.22 instalado | 57.0.24 instalado |
| expo-image-picker | 57.0.20 | 57.0.21 |
| expo-linking | 57.0.13 | 57.0.14 |
| expo-splash-screen | 57.0.10 | 57.0.11 |
| expo-font | No instalado | 57.0.4 |
| react | 19.2.3 | 19.2.3 |
| react-native | 0.86.3 | 0.86.3 |
| @react-native-async-storage/async-storage | 2.2.0 | 2.2.0 |
| react-native-gesture-handler | 2.32.0 | 2.32.0 |
| react-native-reanimated | 4.5.1 | 4.5.1 |
| react-native-safe-area-context | 5.7.0 | 5.7.0 |
| react-native-screens | 4.26.0 | 4.26.2 |

No se actualizó a Expo SDK 58 porque esa versión usa React Native 0.88, elimina
`InteractionManager` y usa Gesture Handler 3. La pantalla de Favoritos depende de
`react-native-draggable-flatlist@4.0.3`, que usa `InteractionManager` y la API de
callbacks de Gesture Handler 2. Actualizar a SDK 58 rompería el reordenamiento de
favoritos, que es una funcionalidad existente que debía conservarse.

## 5. CarritoContext

`CarritoContext` encapsula el estado del carrito y expone:

- `items`: productos del carrito con `id`, `nombre`, `precio`, `imagen` y `cantidad`.
- `cargando`: `true` mientras se recupera el carrito desde `AsyncStorage`.
- `error`: mensaje de error de lectura o escritura.
- `total`: suma de `precio × cantidad` de todos los productos.
- `totalUnidades`: suma de todas las cantidades.
- `agregarProducto(producto)`: valida el producto; si no existe lo agrega con
  cantidad 1 y si existe incrementa su cantidad.
- `aumentarCantidad(id)` y `disminuirCantidad(id)`: modifican una unidad.
  Al llegar a cero, el producto se elimina.
- `eliminarProducto(id)`: quita un producto.
- `vaciarCarrito()`: elimina todos los productos.
- `cantidadDeProducto(id)`: cantidad actual de un producto.
- `recargarCarrito()`: vuelve a leer el almacenamiento.

### Recuperación al iniciar

1. `CarritoProvider` se monta dentro del layout principal.
2. Un `useEffect` ejecuta `AsyncStorage.getItem('@mi-tarjeta/carrito')`.
3. El JSON se valida (`Array.isArray`, precios, cantidades, IDs e imágenes).
4. Si es válido, se guarda en el estado `items`.
5. Recién ahí `cargando` pasa a `false`, habilitando las acciones.
6. Si falla la lectura, se muestra un error, se informa con `Alert` y el carrito
   queda vacío para que el usuario pueda volver a agregar productos.

### Persistencia

Un segundo `useEffect` observa `items`. Cada vez que cambia el carrito:

1. Convierte el arreglo a JSON.
2. Llama a `AsyncStorage.setItem('@mi-tarjeta/carrito', json)`.
3. Si falla, muestra un mensaje y evita repetir la alerta en cada intento.

El efecto no escribe hasta que terminó la carga inicial, para no sobrescribir el
carrito guardado con un arreglo vacío.

## 6. Recorrido desde el botón hasta el carrito

1. El usuario abre un producto en `app/producto/[id].jsx`.
2. `fetchProductById` obtiene y normaliza el producto desde la API.
3. El botón llama a `agregarProducto(producto)`.
4. El contexto valida el producto con `esProductoValido`.
5. Si el `id` ya existe, incrementa `cantidad`; si no, agrega el producto con
   `cantidad: 1`.
6. `setItems` actualiza el estado compartido.
7. `totalUnidades`, `total` y el subtotal se recalculan automáticamente.
8. El `useEffect` guarda el nuevo arreglo en `AsyncStorage`.
9. El indicador de la pestaña Carrito muestra la cantidad total de unidades.
10. La pantalla `app/(tabs)/carrito.jsx` renderiza la imagen, nombre, precio
    unitario, cantidad, subtotal y total.

## 7. Cálculos

```text
subtotal = precio unitario × cantidad
total = suma de todos los subtotales
unidades totales = suma de todas las cantidades
```

Los precios salen de los productos normalizados de la API y quedan guardados en
el carrito. La interfaz no usa precios escritos a mano.

## 8. Manejo de estados

- Carga inicial: `ActivityIndicator` y acciones deshabilitadas.
- Carrito vacío: mensaje "No tenés productos en tu carrito" y botón para volver
  al catálogo.
- Producto agregado: confirmación y contador actualizado en el detalle.
- Eliminación: confirmación antes de quitar un producto.
- Vaciado: confirmación antes de eliminar todo.
- Error de almacenamiento: banner en la pantalla del carrito y alerta.

## 9. Verificación

Comandos ejecutados:

```bash
npx expo install --fix
npx expo install expo-font
npx expo install --check
npx expo-doctor
npx expo export --platform android
```

Resultados:

- `npx expo install --check`: dependencias actualizadas.
- `npx expo-doctor`: 21/21 verificaciones aprobadas.
- `npx expo export --platform android`: bundle generado correctamente.
- Prueba E2E con Chrome sobre la versión web: agregar producto, agregar dos
  veces el mismo producto, agregar productos distintos, incrementar, disminuir,
  eliminar al llegar a cero, eliminar con papelera, vaciar carrito, verificar
  totales, recargar la aplicación y comprobar persistencia, navegar por Perfil,
  Favoritos, Catálogo y Carrito.

## 10. Preguntas para la defensa

### ¿Qué es Context API y por qué se usa?

Es una API de React que permite compartir estado entre componentes sin pasar
props manualmente por cada nivel. El carrito lo necesita en la pestaña, en el
detalle de producto y en el layout de pestañas, por eso se usa un contexto.

### ¿Diferencia entre useState y useEffect?

`useState` guarda datos que cambian y provoca un nuevo render. `useEffect` ejecuta
efectos secundarios después del render, como leer o escribir en `AsyncStorage`.

### ¿Para qué sirve AsyncStorage?

Es un almacenamiento local de clave-valor. Permite conservar el carrito cuando la
aplicación se cierra y recuperarlo al volver a abrirla.

### ¿Cómo se recupera el carrito al iniciar?

El proveedor ejecuta un `useEffect` al montarse, lee la clave
`@mi-tarjeta/carrito`, valida el JSON y actualiza `items`. Hasta que termina,
`cargando` es `true`.

### ¿Qué pasa al agregar dos veces el mismo producto?

La segunda vez se busca el `id` dentro de `items`. Como ya existe, no se agrega
un duplicado: se reemplaza el producto por una copia con `cantidad + 1`.

### ¿Cómo se calcula el total?

Se recorre `items` y se suma `precio * cantidad` de cada producto. El resultado se
recalcula con `useMemo` cada vez que cambia `items`.

### ¿Qué pasa si falla la lectura de AsyncStorage?

Se captura el error, se informa al usuario, se deja el carrito vacío y se permite
seguir usando la aplicación. Si el usuario agrega productos, se intentará guardar
de nuevo.

### ¿Por qué CarritoContext está en el layout principal?

Porque el layout principal envuelve a todas las pantallas. Así el mismo estado
del carrito está disponible en el detalle del producto, en las pestañas y en la
pantalla del carrito.

## 11. Cómo ejecutar

```bash
npm install
npx expo start
```

Luego escanear el QR con Expo Go o presionar `a` para abrir Android.

Para verificar la instalación:

```bash
npx expo install --check
npx expo-doctor
```
