import { execFile } from "node:child_process";
import process from "node:process";

import { promptForConfirmation, promptForSecret } from "./prompt.js";

function execFileAsync(file, args) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr?.trim() || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}

function looksLikeApiKey(value) {
  return typeof value === "string" && value.startsWith("sk-") && value.trim().length >= 20;
}

async function readPersistedApiKey() {
  if (process.platform === "win32") {
    const stdout = await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      "[Environment]::GetEnvironmentVariable('OPENAI_API_KEY','User')"
    ]);
    const value = stdout.trim();
    return value || null;
  }

  return process.env.OPENAI_API_KEY?.trim() || null;
}

async function persistApiKey(apiKey) {
  if (process.platform === "win32") {
    await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      `[Environment]::SetEnvironmentVariable('OPENAI_API_KEY', '${apiKey.replace(/'/g, "''")}', 'User')`
    ]);
    return;
  }

  throw new Error("Persistencia automatica da OPENAI_API_KEY ainda nao foi implementada para este sistema operacional.");
}

export async function ensureApiKey() {
  const currentSessionKey = process.env.OPENAI_API_KEY?.trim() || null;
  if (looksLikeApiKey(currentSessionKey)) {
    return currentSessionKey;
  }

  const persistedKey = await readPersistedApiKey();
  if (looksLikeApiKey(persistedKey)) {
    process.env.OPENAI_API_KEY = persistedKey;
    return persistedKey;
  }

  console.log("");
  console.log("Configuracao da OpenAI");
  console.log("A chave sera salva na variavel de ambiente do usuario e nao sera gravada no repositorio.");

  const shouldConfigure = await promptForConfirmation("Deseja informar agora a OPENAI_API_KEY para este usuario? (S/n)");
  if (!shouldConfigure) {
    throw new Error("A OPENAI_API_KEY e necessaria para iniciar o Codex CLI neste fluxo.");
  }

  const apiKey = (await promptForSecret("Informe a OPENAI_API_KEY")).trim();
  if (!looksLikeApiKey(apiKey)) {
    throw new Error("A chave informada nao parece uma OPENAI_API_KEY valida.");
  }

  await persistApiKey(apiKey);
  process.env.OPENAI_API_KEY = apiKey;
  console.log("OPENAI_API_KEY configurada para este usuario.");
  return apiKey;
}
