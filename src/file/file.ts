import { App, TFile, TFolder, Notice } from 'obsidian';

export interface FileContent {
  file: TFile;
  content: string;
}

class FileApi {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  appendExtension = (path: string, extension: string): string => {
    const ext = extension.startsWith('.') ? extension : '.' + extension;
    return path.indexOf(ext) === -1 ? path + ext : path;
  }

  sanitizeFilename = (filename: string): string => {
    const invalidChars = /[\\/:*?"<>#^[\]|]/g;
    return filename.replace(invalidChars, '_');
  }

  vaultToAbsolutePath = (vaultPath: string): string => {
    const folder = this.app.vault.getAbstractFileByPath(vaultPath) as TFile;
    const path = this.app.vault.getResourcePath(folder);
    return decodeURIComponent(path.replace(/^app:\/\/[^/]+\//, '/').split('?')[0]);
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

  listFolder = async (folder: TFolder | string): Promise<TFile[]> => {
    const f = (folder instanceof TFolder) ? folder : this.app.vault.getFolderByPath(folder);
    return f?.children.filter((file) => file instanceof TFile) as TFile[];
  }

  readFolder = async (folder: TFolder | string): Promise<FileContent[]> => {
    const f = (folder instanceof TFolder) ? folder : this.app.vault.getFolderByPath(folder);
    const files = f?.children || [];
  
    const fileContents = await Promise.all(files.flatMap(async (file) => {
      if (file instanceof TFile) {
        const content = await this.app.vault.cachedRead(file);
        return { file, content };
      }
    }));
  
    return fileContents.filter((content): content is FileContent => content !== undefined);
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

  readJson = async<T> (path: string): Promise<T | null> => {
    const file = this.app.metadataCache.getFirstLinkpathDest(this.appendExtension(path, "md"), "");
    if (file)
      return await JSON.parse(await this.app.vault.read(file)) as T;
    return null;
  }

  writeJson = async<T> (path: string, data: T): Promise<void> => {
    const file = this.app.metadataCache.getFirstLinkpathDest(this.appendExtension(path, "md"), "");
    if (file)
      await this.app.vault.modify(file, JSON.stringify(data, null, 2));
    else
      await this.app.vault.create(this.appendExtension(path, "md"), JSON.stringify(data, null, 2));
  }
}

export default FileApi;

