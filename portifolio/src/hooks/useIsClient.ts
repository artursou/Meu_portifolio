import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Retorna false no servidor e true no navegador.
// Substitui o padrão useState + useEffect(() => setIsMounted(true)), sem render extra.
export const useIsClient = () =>
  useSyncExternalStore(subscribe, () => true, () => false);
