import { App } from 'obsidian';
import {PythonShell, Options} from 'python-shell';

class PythonApi {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  runString = async (code: string, options?: Options): Promise<unknown[]> => {
    const messages = await PythonShell.runString(code, options);
    return messages;
  }

  run = async (script: string, options?: Options): Promise<unknown[]> => {
    const messages = await PythonShell.run(script, options);
    return messages;
  }
}

export default PythonApi;
