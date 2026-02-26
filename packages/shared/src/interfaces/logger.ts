/**
 * Platform-agnostic logging abstraction.
 * Replaces VS Code's OutputChannel.
 */

export type LogLevel = "debug" | "info" | "warn" | "error"

export interface ILogger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

/**
 * Console-based logger for Node.js / browser environments.
 */
export class ConsoleLogger implements ILogger {
  constructor(private readonly prefix?: string) {}

  debug(message: string, ...args: unknown[]): void {
    console.debug(this.format(message), ...args)
  }

  info(message: string, ...args: unknown[]): void {
    console.info(this.format(message), ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.format(message), ...args)
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.format(message), ...args)
  }

  private format(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message
  }
}

/**
 * Silent logger that discards all output. Useful for testing.
 */
export class NullLogger implements ILogger {
  debug(_message: string, ..._args: unknown[]): void {}
  info(_message: string, ..._args: unknown[]): void {}
  warn(_message: string, ..._args: unknown[]): void {}
  error(_message: string, ..._args: unknown[]): void {}
}
