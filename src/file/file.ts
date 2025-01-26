import { App, TFile, TFolder, Notice, Vault, normalizePath } from 'obsidian';


class FileApi {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  loadForm = async (formName: string): Promise<string | null> => {
    const fileName = `${formName}.json`;
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
        const formDef = JSON.parse(fileContent);
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

  appendExtension = (path: string, extension: string): string => {
    const ext = extension.startsWith('.') ? extension : '.' + extension;
    return path.indexOf(ext) === -1 ? path + ext : path;
  }

  sanitizeFilename = (filename: string): string => {
    const invalidChars = /[\\/:*?"<>#^[\]|]/g;
    return filename.replace(invalidChars, '_');
  }

  obtainFolder = async (path: string): Promise<TFolder | null> => {
    let folder = this.app.vault.getFolderByPath(path);
    if (!folder) {
      try {
        folder = await this.app.vault.createFolder(path);
      } catch (e) {
        new Notice(`Error creating folder ${path}`);
        console.log(e);
        return null;
      }
    }
    return folder;
  }

  processFolder = async<T>(folder: TFolder | string, process: (file: TFile) => Promise<T | null>): Promise<T[]> => {
    const data: T[] = [];
    const f = (folder instanceof TFolder) ? folder : this.app.vault.getFolderByPath(folder);

    for (const file of f?.children || []) {
      if (file instanceof TFile) {
        const value = await process(file);
        if (value) {
          data.push(value);
        }
      }
    }

    return data;
  }

  readJson = async (path: string): Promise<unknown | null> => {
    const file = this.app.metadataCache.getFirstLinkpathDest(this.appendExtension(path, "md"), "");
    if (file)
      return await JSON.parse(await this.app.vault.read(file));
    return null;
  }

  writeJson = async (path: string, data: unknown): Promise<void> => {
    const file = this.app.metadataCache.getFirstLinkpathDest(this.appendExtension(path, "md"), "");
    if (file)
      await this.app.vault.modify(file, JSON.stringify(data, null, 2));
    else
      await this.app.vault.create(this.appendExtension(path, "md"), JSON.stringify(data, null, 2));
  }
}

export default FileApi;

