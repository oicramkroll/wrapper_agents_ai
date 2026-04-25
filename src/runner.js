import { spawn } from "node:child_process";
import process from "node:process";

export async function launchCodex(projectRoot, prompt) {
  await new Promise((resolve, reject) => {
    const child = spawn("codex", [prompt], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", (error) => {
      reject(
        new Error(
          `Nao foi possivel iniciar o comando "codex". Verifique se ele esta instalado e disponivel no PATH. Detalhe: ${error.message}`
        )
      );
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`O comando "codex" foi encerrado com codigo ${code ?? "desconhecido"}.`));
    });
  });
}
