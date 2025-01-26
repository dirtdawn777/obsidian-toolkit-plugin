import { Plugin } from 'obsidian';
import type { ToolkitSettings } from './settings/settings'
import { DEFAULT_SETTINGS } from './settings/settings'
import { ToolkitSettingTab } from "./settings/SettingsTab";
import YoutubeApi from "./youtube/youtube-client";
import FileApi from "./file/file";

export default class ToolkitPlugin extends Plugin {
  settings: ToolkitSettings = DEFAULT_SETTINGS;
  public youtubeApi!: YoutubeApi;
  public fileApi!: FileApi;

  async onload() {
    console.log('Loading Toolkit plugin');
    await this.loadSettings();

    this.addSettingTab(new ToolkitSettingTab(this.app, this));
    this.youtubeApi = new YoutubeApi(this);
    this.fileApi = new FileApi(this.app);
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

