import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CODEX_README = `Este diretorio guarda registros locais de interacoes feitas neste terminal.

Limite importante:
- Este wrapper pode criar e organizar arquivos locais de contexto do projeto.
- O historico completo de conversas ainda depende do ambiente que executa o Codex.

Estrutura:
- \`interactions/\`: um arquivo por conversa ou registro manual.
- \`project.json\`: configuracao basica do projeto para este wrapper.
`;

function buildProjectConfig(projectRoot) {
  return {
    name: path.basename(projectRoot),
    createdAt: new Date().toISOString(),
    interactionsDir: ".codex/interactions"
  };
}

export async function createCodexStructure(projectRoot) {
  const codexDir = path.join(projectRoot, ".codex");
  const interactionsDir = path.join(codexDir, "interactions");
  const projectConfigPath = path.join(codexDir, "project.json");
  const readmePath = path.join(codexDir, "README.md");

  await mkdir(interactionsDir, { recursive: true });
  await writeFile(readmePath, CODEX_README, "utf8");
  await writeFile(projectConfigPath, `${JSON.stringify(buildProjectConfig(projectRoot), null, 2)}\n`, "utf8");
}

export async function ensureCodexStructure(projectRoot) {
  const codexDir = path.join(projectRoot, ".codex");
  const interactionsDir = path.join(codexDir, "interactions");
  const projectConfigPath = path.join(codexDir, "project.json");
  const readmePath = path.join(codexDir, "README.md");

  await mkdir(interactionsDir, { recursive: true });

  try {
    await readFile(readmePath, "utf8");
  } catch {
    await writeFile(readmePath, CODEX_README, "utf8");
  }

  try {
    await readFile(projectConfigPath, "utf8");
  } catch {
    await writeFile(projectConfigPath, `${JSON.stringify(buildProjectConfig(projectRoot), null, 2)}\n`, "utf8");
  }
}

export async function listInteractions(projectRoot) {
  const interactionsDir = path.join(projectRoot, ".codex", "interactions");
  const entries = await readdir(interactionsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left, "pt-BR"));

  return files.map((fileName, index) => ({
    id: index + 1,
    fileName
  }));
}

export async function readInteractionPreview(interactionPath) {
  const content = await readFile(interactionPath, "utf8");
  const trimmed = content.trim();
  const preview = trimmed.length > 1200 ? `${trimmed.slice(0, 1200)}\n...` : trimmed;
  return preview;
}

function buildInteractionFileName(date, sequence) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const serial = String(sequence).padStart(3, "0");
  return `${year}-${month}-${day}-${serial}.md`;
}

export async function createInteractionRecord(projectRoot) {
  const interactionsDir = path.join(projectRoot, ".codex", "interactions");
  const date = new Date();
  const entries = await readdir(interactionsDir, { withFileTypes: true });
  const prefix = buildInteractionFileName(date, 0).slice(0, 10);
  const sameDayCount = entries.filter((entry) => entry.isFile() && entry.name.startsWith(prefix)).length;
  const fileName = buildInteractionFileName(date, sameDayCount + 1);
  const interactionPath = path.join(interactionsDir, fileName);
  const content = `# Interacao ${String(sameDayCount + 1).padStart(3, "0")}

Data: ${prefix}
Projeto: \`${projectRoot}\`

## Perguntas e respostas

`;

  await writeFile(interactionPath, content, "utf8");
  return interactionPath;
}
