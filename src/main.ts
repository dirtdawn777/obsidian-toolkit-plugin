import { Plugin } from 'obsidian';
import type { ToolkitSettings } from './settings/settings'
import { DEFAULT_SETTINGS } from './settings/settings'
import { ToolkitSettingTab } from "./settings/SettingsTab";
import YoutubeApi from "./youtube/youtube-client";
import FileApi from "./file/file";
import TextApi from "./text/text";
import FormApi from "./form/form";
import AiApi from "./ai/ai";
import PythonApi from "./python/python";

import mlDistance from './math/ml-dist';
import aiSdk from './ai/ai-sdk';
import pyhton from './python/python-shell'; 

export default class ToolkitPlugin extends Plugin {
  settings: ToolkitSettings = DEFAULT_SETTINGS;
  public youtubeApi!: YoutubeApi;
  public fileApi!: FileApi;
  public textApi!: TextApi;
  public formApi!: FormApi;
  public aiApi!: AiApi;
  public pythonApi!: PythonApi;
  public distance = mlDistance.distance;
  public similarity = mlDistance.similarity;
  public aiSdk = aiSdk;
  public python = pyhton.PythonShell;
  
  async onload() {
    console.log('Loading Toolkit plugin');
    await this.loadSettings();

    this.addSettingTab(new ToolkitSettingTab(this.app, this));
    this.youtubeApi = new YoutubeApi(this);
    this.fileApi = new FileApi(this.app);
    this.textApi = new TextApi(this.app);
    this.formApi = new FormApi(this.app, this);
    this.aiApi = new AiApi(this.app);
    this.pythonApi = new PythonApi(this.app);
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

