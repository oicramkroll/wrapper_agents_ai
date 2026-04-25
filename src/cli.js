#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ensureApiKey } from "./auth.js";
import {
  createCodexStructure,
  createInteractionRecord,
  ensureCodexStructure,
  listInteractions,
  readInteractionPreview
} from "./codex-store.js";
import { closePrompt, promptForAction, promptForConfirmation, promptForInteraction } from "./prompt.js";
import { launchCodex } from "./runner.js";

async function main() {
  const projectRoot = process.cwd();
  const codexDir = path.join(projectRoot, ".codex");

  const hasCodexDirectory = existsSync(codexDir);
  if (!hasCodexDirectory) {
    const shouldCreate = await promptForConfirmation(
      "Nao encontrei uma pasta .codex neste diretorio. Deseja criar a estrutura inicial agora? (s/N)"
    );

    if (!shouldCreate) {
      console.log("Fluxo cancelado. Nada foi alterado.");
      return;
    }

    await createCodexStructure(projectRoot);
    console.log("Estrutura .codex criada com sucesso.");
  } else {
    await ensureCodexStructure(projectRoot);
  }

  await ensureApiKey();

  const interactions = await listInteractions(projectRoot);
  const action = await promptForAction(interactions);

  if (action.type === "cancel") {
    console.log("Fluxo encerrado sem iniciar o Codex.");
    return;
  }

  if (action.type === "new") {
    const interactionPath = await createInteractionRecord(projectRoot);
    await launchCodex(
      projectRoot,
      `Vamos iniciar uma nova conversa neste projeto. Registre esta sessao em "${interactionPath}".`
    );
    return;
  }

  const selected = await promptForInteraction(interactions);
  if (!selected) {
    console.log("Nenhuma interacao foi selecionada.");
    return;
  }

  const interactionPath = path.join(projectRoot, ".codex", "interactions", selected.fileName);
  const preview = await readInteractionPreview(interactionPath);

  await launchCodex(
    projectRoot,
    `Vamos continuar a conversa que tivemos em "${interactionPath}".\n\nResumo local:\n${preview}`
  );
}

main()
  .catch((error) => {
    console.error(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => {
    closePrompt();
  });
