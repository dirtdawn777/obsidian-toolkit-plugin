import type { App } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";
import type ToolkitPlugin from "../main";

export class ToolkitSettingTab extends PluginSettingTab {
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
      .setClass("ait-settings")
      .addText((text) => {
        setPasswordOnBlur(text.inputEl);
        text
          .setPlaceholder('Enter your Google Cloud API Key')
          .setValue(this.plugin.settings.googleCloudApiKey)
          .onChange(async (value): Promise<void> => {
            this.plugin.settings.googleCloudApiKey = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

// Thank you chhoumann for this code
// https://github.com/chhoumann/quickadd/blob/master/src/utils/setPasswordOnBlur.ts
function setPasswordOnBlur(el: HTMLInputElement) {
  el.addEventListener("focus", () => {
    el.type = "text";
  });

  el.addEventListener("blur", () => {
    el.type = "password";
  });

  el.type = "password";
}
