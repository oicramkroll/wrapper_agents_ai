import readline from "node:readline";
import process from "node:process";
import { Writable } from "node:stream";

let rl = createReadline();

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(`${question}\n> `, resolve);
  });
}

export async function promptForConfirmation(question) {
  const answer = (await ask(question)).trim().toLowerCase();
  return answer === "" || answer === "s" || answer === "sim" || answer === "y" || answer === "yes";
}

export async function promptForAction(interactions) {
  console.log("");
  if (interactions.length === 0) {
    console.log("Nenhuma interacao encontrada em .codex/interactions.");
    console.log("1. Iniciar nova conversa");
    console.log("0. Cancelar");

    const answer = (await ask("Escolha uma opcao")).trim();
    return answer === "1" ? { type: "new" } : { type: "cancel" };
  }

  console.log("Interacoes encontradas:");
  for (const interaction of interactions) {
    console.log(`${interaction.id}. ${interaction.fileName}`);
  }

  console.log("");
  console.log("Acoes:");
  console.log("1. Continuar uma interacao");
  console.log("2. Iniciar nova conversa");
  console.log("0. Cancelar");

  const answer = (await ask("Escolha uma opcao")).trim();

  if (answer === "1") {
    return { type: "continue" };
  }

  if (answer === "2") {
    return { type: "new" };
  }

  return { type: "cancel" };
}

export async function promptForInteraction(interactions) {
  const answer = (await ask("Digite o numero da interacao que deseja continuar")).trim();
  const selectedId = Number.parseInt(answer, 10);

  if (Number.isNaN(selectedId)) {
    return null;
  }

  return interactions.find((interaction) => interaction.id === selectedId) ?? null;
}

export async function promptForSecret(question) {
  rl.close();

  return new Promise((resolve) => {
    const mutableStdout = new WritableMutedStream(process.stdout);
    const secretRl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true
    });

    mutableStdout.muted = false;
    secretRl.question(`${question}\n> `, (answer) => {
      secretRl.close();
      process.stdout.write("\n");
      rl = createReadline();
      resolve(answer);
    });
    mutableStdout.muted = true;
  });
}

export function closePrompt() {
  if (rl) {
    rl.close();
  }
}

class WritableMutedStream extends Writable {
  constructor(output) {
    super();
    this.output = output;
    this.muted = false;
    this.isTTY = output.isTTY;
    this.columns = output.columns;
  }

  _write(chunk, encoding, callback) {
    if (!this.muted) {
      this.output.write(chunk, encoding, callback);
      return;
    }

    callback();
  }
}
