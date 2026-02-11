import { DefaultChatTransport } from "ai";
import type { HttpChatTransportInitOptions, UIMessage } from "ai";
import { logoutAndRedirect } from "@/services/api/base";

/**
 * Crée un fetch personnalisé qui intercepte les erreurs 401 (session invalide)
 * et déconnecte automatiquement l'utilisateur.
 */
function createAuthAwareFetch(originalFetch: typeof fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);
    
    // Intercepter les erreurs 401 avant qu'elles ne soient traitées par le transport
    if (!response.ok && response.status === 401) {
      logoutAndRedirect();
    }
    
    return response;
  };
}

/**
 * Transport personnalisé qui intercepte les erreurs 401 (session invalide)
 * et déconnecte automatiquement l'utilisateur.
 */
export class AuthAwareChatTransport<
  UI_MESSAGE extends UIMessage = UIMessage,
> extends DefaultChatTransport<UI_MESSAGE> {
  constructor(options: HttpChatTransportInitOptions<UI_MESSAGE> = {}) {
    // Créer un fetch personnalisé qui intercepte les 401
    const customFetch = options.fetch 
      ? createAuthAwareFetch(options.fetch)
      : createAuthAwareFetch(globalThis.fetch);
    
    super({
      ...options,
      fetch: customFetch,
    });
  }
}
