import { Plugin } from 'obsidian';
import type { ToolkitSettings } from './settings/settings'
import { DEFAULT_SETTINGS } from './settings/settings'
import { ToolkitSettingTab } from "./settings/SettingsTab";
import YoutubeApi from "./youtube/youtube-client";

export default class ToolkitPlugin extends Plugin {
  settings: ToolkitSettings = DEFAULT_SETTINGS;
  public youtubeApi!: YoutubeApi;

  async onload() {
    console.log('Loading Toolkit plugin');
    await this.loadSettings();

    this.addSettingTab(new ToolkitSettingTab(this.app, this));
    this.youtubeApi = new YoutubeApi(this);
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

