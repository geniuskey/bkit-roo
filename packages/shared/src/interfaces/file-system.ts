/**
 * Platform-agnostic file system abstraction.
 * Consumers must provide their own implementation
 * (e.g., Node.js fs, VS Code workspace.fs, browser FileSystem API).
 */

export interface FileStat {
  isFile: boolean
  isDirectory: boolean
  size: number
  mtime: number
}

export interface IFileSystem {
  /** Read file contents as string */
  readFile(path: string, encoding?: string): Promise<string>

  /** Write string contents to a file */
  writeFile(path: string, content: string): Promise<void>

  /** Check if a file or directory exists */
  exists(path: string): Promise<boolean>

  /** List entries in a directory */
  readDirectory(dirPath: string): Promise<string[]>

  /** List files recursively with optional glob pattern */
  listFiles(dirPath: string, options?: ListFilesOptions): Promise<string[]>

  /** Get file/directory metadata */
  stat(path: string): Promise<FileStat>

  /** Create a directory (and parents if needed) */
  mkdir(path: string): Promise<void>

  /** Delete a file */
  unlink(path: string): Promise<void>
}

export interface ListFilesOptions {
  recursive?: boolean
  pattern?: string
  maxResults?: number
}
