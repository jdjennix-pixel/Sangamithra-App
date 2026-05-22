import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const repos = [
  "davila7/claude-code-templates",
  "wshobson/agents",
  "CloudAI-X/threejs-skills",
  "coreyhaines31/marketingskills",
  "vercel-labs/web-interface-guidelines",
  "MengTo/Skills",
  "anthropics/skills",
  "BowTiedSwan/animejs-skills",
  "github/awesome-copilot",
  "kostja94/marketing-skills",
  "jorgejaramillo/seoskills",
  "CommandCodeAI/agent-skills",
  "ComposioHQ/awesome-claude-skills",
  "MoizIbnYousaf/Ai-Agent-Skills",
  "greensock/gsap-skills",
  "Leonxlnx/taste-skill",
  "jakubkrehel/make-interfaces-feel-better",
  "sleekdotdesign/agent-skills",
  "BigY0shi/super-skills",
  "pbakaus/impeccable",
  "arvindrk/extract-design-system",
  "vercel-labs/skills"
];

const targetDir = path.join(__dirname, 'md_skills');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

repos.forEach(repo => {
  const repoName = repo.split('/')[1];
  const repoPath = path.join(targetDir, repoName);
  
  if (!fs.existsSync(repoPath)) {
    console.log(`Cloning ${repo}...`);
    try {
      execSync(`git clone https://github.com/${repo}.git "${repoPath}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to clone ${repo}`);
    }
  } else {
    console.log(`Repo ${repoName} already exists, skipping.`);
  }
});

console.log('All repositories cloned successfully.');

// Now let's gather all .md files into the root of md_skills
function gatherMdFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== '.git') {
        gatherMdFiles(fullPath);
      }
    } else if (file.endsWith('.md') && file.toLowerCase() !== 'readme.md') {
      // Copy to md_skills root with a prefix
      const destName = path.basename(dir) + '_' + file;
      const destPath = path.join(targetDir, destName);
      fs.copyFileSync(fullPath, destPath);
    }
  }
}

// Gather from each repo
repos.forEach(repo => {
  const repoName = repo.split('/')[1];
  const repoPath = path.join(targetDir, repoName);
  if (fs.existsSync(repoPath)) {
    gatherMdFiles(repoPath);
  }
});

console.log('Extraction complete.');
