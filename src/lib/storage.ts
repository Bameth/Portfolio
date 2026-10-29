/** Accès à localStorage tolérant aux navigations privées et aux cookies bloqués. */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Stockage indisponible : la préférence ne sera simplement pas mémorisée.
    }
  },
};

export const STORAGE_KEYS = {
  lang: "ab-lang",
  theme: "ab-theme",
  sound: "ab-sound",
  bootSeen: "ab-boot-seen",
} as const;
