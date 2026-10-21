import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

const FavoritosContext = createContext();
const FAVORITOS_STORAGE_KEY = '@mi-tarjeta/favoritos';

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosCargados, setFavoritosCargados] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarFavoritos = async () => {
      try {
        const guardados = await AsyncStorage.getItem(FAVORITOS_STORAGE_KEY);

        if (guardados !== null) {
          const favoritosGuardados = JSON.parse(guardados);
          if (!Array.isArray(favoritosGuardados) || !favoritosGuardados.every(Number.isInteger)) {
            throw new Error('El formato de favoritos guardados no es válido');
          }

          if (activo) {
            setFavoritos([...new Set(favoritosGuardados)]);
          }
        }
      } catch (error) {
        console.error('No se pudieron cargar los favoritos guardados:', error);
        Alert.alert(
          'No se pudieron cargar los favoritos',
          'La app no pudo recuperar tus favoritos guardados.',
        );
      } finally {
        if (activo) {
          setFavoritosCargados(true);
        }
      }
    };

    cargarFavoritos();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!favoritosCargados) {
      return;
    }

    AsyncStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(favoritos)).catch((error) => {
      console.error('No se pudieron guardar los favoritos:', error);
      Alert.alert(
        'No se pudieron guardar los favoritos',
        'Los cambios podrían perderse al cerrar la app.',
      );
    });
  }, [favoritos, favoritosCargados]);

  const toggleFavorito = (id) => {
    if (!favoritosCargados) {
      return;
    }

    setFavoritos((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id],
    );
  };

  const quitarFavorito = (id) => {
    if (!favoritosCargados) {
      return;
    }

    setFavoritos((actual) => actual.filter((favoritoId) => favoritoId !== id));
  };

  const reordenarFavoritos = (idsOrdenados) => {
    if (!favoritosCargados) {
      return;
    }

    setFavoritos((actual) => {
      const idsUnicos = [...new Set(idsOrdenados.filter((id) => actual.includes(id)))];
      return [...idsUnicos, ...actual.filter((id) => !idsUnicos.includes(id))];
    });
  };

  const esFavorito = (id) => favoritos.includes(id);

  const value = useMemo(
    () => ({
      favoritos,
      favoritosCargados,
      toggleFavorito,
      quitarFavorito,
      reordenarFavoritos,
      esFavorito,
    }),
    [favoritos, favoritosCargados],
  );

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);

  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de FavoritosProvider');
  }

  return context;
}
