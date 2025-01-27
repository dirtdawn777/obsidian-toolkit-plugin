import { App } from 'obsidian';
import { franc } from 'franc'
import {iso6393} from 'iso-639-3'

export interface Language {
  name: string;
  iso6391: string | undefined;
  iso6393: string;
}

class TextApi {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  detectLanguage = (text: string): string => {
    return franc(text);
  }

  listLanguages = (): Language[] => {
    const languages: Language[] = [];

    iso6393.filter((lang) => lang.type === 'living' && lang.iso6391).map((lang) => {
      const language: Language = {
        name: lang.name,
        iso6391: lang.iso6391,
        iso6393: lang.iso6393,
        };
      languages.push(language);        
    });
    return languages;
  }
}

export default TextApi;
