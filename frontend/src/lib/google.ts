const GOOGLE_SCRIPT_ID = 'google-identity-services';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

const configuredClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
export const GOOGLE_CLIENT_ID = configuredClientId && !configuredClientId.startsWith('your_')
  ? configuredClientId
  : undefined;

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google sign-in failed to load')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google sign-in failed to load'));
    document.head.appendChild(script);
  });
}

export async function requestGoogleCalendarAccessToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google client ID is not configured');
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
          return;
        }

        reject(new Error(response.error || 'Google Calendar permission was not granted'));
      },
    });

    if (!tokenClient) {
      reject(new Error('Google Calendar authorization is unavailable'));
      return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}
