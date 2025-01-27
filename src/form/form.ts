import { App, Vault, TFile, normalizePath } from 'obsidian';
import type ToolkitPlugin from "../main";

export type SourceType = 'fixed' | 'notes' | 'dataview';
export type FieldType = 'text' | 'textarea' | 'select' | 'toggle' | 'tag' |
  'slider' | 'date' | 'time' | 'datetime' | 'number' |
  'email' | 'url' | 'tel' | 'color' | 'password' | 'note' |
  'folder' | 'dataview' | 'multiselect' | 'file' |
  'document_block' | 'markdown_block' | 'image';

export interface OptionDefinition {
  value: string;
  label: string;
}
export interface InputDefinition {
  type: FieldType;
  source?: SourceType;
  folder?: string;
  exclude?: string;
  min?: number;
  max?: number;
  parentFolder?: string;
  query?: string;
  hidden?: boolean;
  options?: OptionDefinition[];
  multi_select_options?: string[];
  allowUnknownValues?: boolean;
  body?: string;
  filenameTemplate?: string;
  saveLocation?: string;
  allowedExtensions?: string[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  description: string;
  required?: boolean;
  input: InputDefinition;
}

export interface FormDefinition {
  title: string;
  name: string;
  version: string;
  customClassname?: string;
  fields: FieldDefinition[];
};

class FormApi {
  private app: App;
  private plugin: ToolkitPlugin;

  constructor(app: App, plugin: ToolkitPlugin) {
    this.app = app;
    this.plugin = plugin;
  }

  loadForm = async (formPath: string): Promise<FormDefinition | null> => {
    const fileName = `${formPath}.json`;
    const filePath = normalizePath(fileName);
    const vault: Vault = this.app.vault;

    try {
      const file = vault.getAbstractFileByPath(filePath);
      if (!file) {
        throw new Error(`File "${fileName}" does not exists.`);
      }
      if (!(file instanceof TFile)) {
        throw new Error(`File "${fileName}" is not a valid file.`);
      }

      const fileContent = await vault.read(file as TFile);
      try {
        const formDef = JSON.parse(fileContent) as FormDefinition;
        return formDef;
      } catch (error) {
        console.error(`Error during reading file "${fileName}":`, error);
        throw new Error(`File "${fileName}" is not a valid JSON file.`);
      }
    } catch (error) {
      console.error(`Error during reading file "${fileName}":`, error);
      throw new Error(`Error during reading file "${fileName}".`);
    }
  }

  addIso6391LanguageOptions = (form: FormDefinition, fieldName: string): FormDefinition => {
    const field = form.fields.find((field) => 
      (field.name === fieldName && field.input.type === 'select'));
    if (field) {
      field.input.options = [];
      this.plugin.textApi.listLanguages().forEach((lang) => {
        field.input.options?.push({ value: lang.iso6391 ?? '', label: lang.name });
      });
    }
    return form;
  }
}

export default FormApi;
