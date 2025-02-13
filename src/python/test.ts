
import { App } from 'obsidian';
import { PyBridge, RemoteController } from 'pybridge';
//import { python } from "pythonia";

interface PythonAPI {
  sum(a: number, b: number): number;
}

class PythonController {
  public script: RemoteController<PythonAPI>;
  
  constructor(protected python: PyBridge) {
    const code = 
    `def sum(a: int, b: int) -> int:
      return a + b`;
    this.script = this.python.controller<PythonAPI>(code);
  }
}

class TestApi {
  private app: App;
  private bridge: PyBridge;

  constructor(app: App) {
    this.app = app;
    this.bridge = new PyBridge({ python: 'python', cwd: __filename });
  }

  test = async (): Promise<number> => {
    
    const controller = new PythonController(this.bridge);
    const result: number = await controller.script.sum(5, 3);
    console.log(`The result of the sum is: ${result}`);
    this.bridge.close();
    /*
    python.cwd('\\Users\\abaroni\\Documents\\Obsidian Test Vault\\.obsidian\\plugins\\obsidian-toolkit-plugin\\src\\python');
    const result = await python('\\Users\\abaroni\\Documents\\Obsidian Test Vault\\.obsidian\\plugins\\obsidian-toolkit-plugin\\src\\python\\script.py');
    const x = await result.sum(5,3);
    python.exit();*/
    return result;
  }
}

export default TestApi;
