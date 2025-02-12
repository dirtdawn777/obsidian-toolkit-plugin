import { PythonBridge } from 'pybridge';

// Crea un'istanza di PyBridge
const bridge = new PythonBridge({ python: 'python3', cwd: __dirname });

// Definisci l'interfaccia per le funzioni Python
interface PythonAPI {
  somma(a: number, b: number): number;
}

// Crea un controller per il file Python
const python = bridge.controller<PythonAPI>('script.py')!;

// Usa la funzione Python
async function main() {
  const risultato = await python.somma(5, 3);
  console.log(`Il risultato della somma è: ${risultato}`);
  bridge.close();
}

main();

