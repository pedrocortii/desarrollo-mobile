import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://fakestoreapi.com';
export const PRODUCTS_STORAGE_KEY = '@mi-tarjeta/productos';

export function normalizeProduct(product) {
  return {
    id: Number(product?.id ?? 0),
    nombre: product?.title || product?.nombre || 'Producto sin nombre',
    precio: Number(product?.price ?? product?.precio ?? 0),
    categoria: product?.category || product?.categoria || 'General',
    descripcion: product?.description || product?.descripcion || 'Sin descripción disponible.',
    imagen: product?.image || product?.imagen || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  };
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error('No se pudieron cargar los productos.');
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeProduct);
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error('No se pudo cargar el producto seleccionado.');
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      return null;
    }

    return normalizeProduct(data);
  } catch (error) {
    try {
      const cachedProducts = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (cachedProducts !== null) {
        const products = JSON.parse(cachedProducts);
        if (Array.isArray(products)) {
          const cachedProduct = products.find((product) => String(product.id) === String(id));
          if (cachedProduct) {
            return cachedProduct;
          }
        }
      }
    } catch (cacheError) {
      console.error('No se pudo recuperar el producto guardado:', cacheError);
    }

    throw error;
  }
}
