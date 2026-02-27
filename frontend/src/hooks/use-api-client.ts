import { useContext, useMemo, useRef } from "react";

import { AuthContext } from "../auth";
import { createApiClient, type ApiClient } from "../services";

export const useApiClient = (): ApiClient => {
  const { getAccessToken } = useContext(AuthContext);

  const getTokenRef = useRef(getAccessToken);

  getTokenRef.current = getAccessToken;

  return useMemo(() => createApiClient(() => getTokenRef.current()), []);
};
