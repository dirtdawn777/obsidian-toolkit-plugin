import { App, Vault, TFile, normalizePath } from 'obsidian';
import type ToolkitPlugin from "../main";

export type SourceType = 'fixed' | 'notes' | 'dataview';
export type FieldType = 'text' | 'textarea' | 'select' | 'toggle' | 'tag' |
  'slider' | 'date' | 'time' | 'datetime' | 'number' |
  'email' | 'url' | 'tel' | 'color' | 'password' | 'note' |
  'folder' | 'dataview' | 'multiselect' | 'file' |
  'document_block' | 'markdown_block' | 'image';

export type FormOptions = {
    values?: Record<string, unknown>;
};

export type FormData = {
  data?: Record<string, unknown>;
};

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

  loadForm = async (formPath: string): Promise<FormDefinition> => {
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
        throw error;
      }
    } catch (error) {
      console.error(`Error during reading file "${fileName}":`, error);
      throw error;
    }
  }

  execModal = async (formPath: string, 
    exec: (data: FormData) => Promise<void>,
    options?: FormOptions,
    prepare?: (form: FormDefinition) => FormDefinition): Promise<void> => {
    const modalForm = this.app.plugins.plugins.modalforms.api;
    const formDef = await this.loadForm(formPath)
      .then((form) => {
        return prepare ? prepare(form) : form; 
      })
      .catch((error) => {
        console.error(`Error during loading form "${formPath}":`, error);
        throw error;
      });
    try {
      const result = await modalForm.openForm(formDef, options);
      if (result.status === 'ok') {
        await exec(result.data);
      }
    } catch (error) {
      console.error(`Error during opening form "${formPath}":`, error);
      throw error;
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
