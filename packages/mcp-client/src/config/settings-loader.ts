/**
 * MCP settings file loader.
 * Loads MCP server configurations from settings files.
 */

import type { McpSettings, McpServerConfig, IFileSystem } from "@bkit-roo/shared"

/**
 * Load MCP settings from a JSON file.
 */
export async function loadMcpSettings(
  fs: IFileSystem,
  settingsPath: string,
): Promise<McpServerConfig[]> {
  const exists = await fs.exists(settingsPath)
  if (!exists) return []

  try {
    const content = await fs.readFile(settingsPath)
    const settings = JSON.parse(content) as McpSettings

    return Object.entries(settings.mcpServers ?? {}).map(([name, config]) => ({
      name,
      ...config,
    }))
  } catch {
    return []
  }
}

/**
 * Load MCP settings from both global and project-level files.
 * Project-level settings override global settings.
 */
export async function loadMergedMcpSettings(
  fs: IFileSystem,
  globalSettingsPath: string,
  projectSettingsPath?: string,
): Promise<McpServerConfig[]> {
  const globalConfigs = await loadMcpSettings(fs, globalSettingsPath)
  const globalMap = new Map(globalConfigs.map((c) => [c.name, c]))

  if (projectSettingsPath) {
    const projectConfigs = await loadMcpSettings(fs, projectSettingsPath)
    for (const config of projectConfigs) {
      globalMap.set(config.name, config)
    }
  }

  return [...globalMap.values()]
}
