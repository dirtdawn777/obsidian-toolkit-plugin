import ToolkitPlugin, { ToolkitSettings } from './main';

export function getPluginSettings(plugin: ToolkitPlugin): ToolkitSettings {
  return plugin.settings;
}