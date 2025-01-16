import { App, Plugin, Setting, PluginSettingTab } from 'obsidian';

// Remember to rename these classes and interfaces!

export interface ToolkitSettings {
  googleCloudApiKey: string;
}

const DEFAULT_SETTINGS: ToolkitSettings = {
  googleCloudApiKey: "",
};

export default class ToolkitPlugin extends Plugin {
  settings: ToolkitSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log('Loading Toolkit plugin');
    await this.loadSettings();

    this.addSettingTab(new ToolkitSettingTab(this.app, this));
  }

  onunload() {
    console.log('Unloading Toolkit plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ToolkitSettingTab extends PluginSettingTab {
  plugin: ToolkitPlugin;

  constructor(app: App, plugin: ToolkitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Google Cloud API Key')
      .setDesc("It gives your app permission to access and use YouTube's features in a controlled way.")
      .addText(text => text
        .setPlaceholder('Enter your Google Cloud API Key')
        .setValue(this.plugin.settings.googleCloudApiKey)
        .onChange(async (value): Promise<void> => {
          this.plugin.settings.googleCloudApiKey = value;
          await this.plugin.saveSettings();
        }));
  }
}

