import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { errorMessage } from '../utils/format';

/**
 * GET con estado de carga y error.
 * - data: último resultado recibido (se conserva mientras se recarga)
 * - loading: true mientras la petición actual está en curso
 * - reload(): vuelve a pedir los datos (por ejemplo, tras crear o borrar algo)
 * Si `url` es null no se hace ninguna petición.
 */
export function useApi(url, params) {
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([url, params, version]);
  const [state, setState] = useState({ key: null, data: null, error: '' });

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;

    API.get(url, { params })
      .then((res) => {
        if (!cancelled) setState({ key, data: res.data, error: '' });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ key, data: null, error: errorMessage(err, 'No se pudo cargar la información.') });
        }
      });

    return () => {
      cancelled = true;
    };
    // `key` resume url + params + version
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : '',
    loading: Boolean(url) && state.key !== key,
    reload: () => setVersion((v) => v + 1),
  };
}
