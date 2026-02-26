/**
 * Platform-agnostic configuration and secret storage abstraction.
 * Replaces VS Code's ExtensionContext.globalState and SecretStorage.
 */

export interface IConfigStorage {
  /** Get a configuration value */
  get<T>(key: string): Promise<T | undefined>

  /** Set a configuration value */
  set<T>(key: string, value: T): Promise<void>

  /** Delete a configuration value */
  delete(key: string): Promise<void>

  /** Get all keys */
  keys(): Promise<string[]>
}

export interface ISecretStorage {
  /** Get a secret value (e.g., API key) */
  getSecret(key: string): Promise<string | undefined>

  /** Store a secret value securely */
  setSecret(key: string, value: string): Promise<void>

  /** Delete a secret */
  deleteSecret(key: string): Promise<void>
}

/**
 * Simple in-memory config storage for testing or ephemeral usage.
 */
export class InMemoryConfigStorage implements IConfigStorage {
  private store = new Map<string, unknown>()

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async keys(): Promise<string[]> {
    return [...this.store.keys()]
  }
}

/**
 * Simple in-memory secret storage. NOT secure - for testing only.
 */
export class InMemorySecretStorage implements ISecretStorage {
  private secrets = new Map<string, string>()

  async getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key)
  }

  async setSecret(key: string, value: string): Promise<void> {
    this.secrets.set(key, value)
  }

  async deleteSecret(key: string): Promise<void> {
    this.secrets.delete(key)
  }
}
