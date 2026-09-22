import { createContext, useContext, useMemo, useState } from 'react';

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);

  const toggleFavorito = (id) => {
    setFavoritos((actual) =>
      actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id],
    );
  };

  const esFavorito = (id) => favoritos.includes(id);

  const value = useMemo(
    () => ({
      favoritos,
      toggleFavorito,
      esFavorito,
    }),
    [favoritos],
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
