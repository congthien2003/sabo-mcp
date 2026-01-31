/**
 * Pull command - Pull resources to project
 */
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

// Resource categories
type ResourceCategory = "prompts" | "skills";

// Skill groups
type SkillGroup = "all" | "basic" | "frontend";

// Skill definitions by group
const SKILL_GROUPS: Record<SkillGroup, string[]> = {
  basic: ["brainstorming", "executing-plans", "writing-plan"],
  frontend: [
    "front-end/react-best-practices",
    "front-end/web-design-guidelines",
  ],
  all: [], // Will be populated dynamically
};

interface PullOptions {
  targetDir: string;
  overwrite: boolean;
  categories: ResourceCategory[];
  skillGroup?: SkillGroup;
}

interface ResourceInfo {
  category: ResourceCategory;
  filename: string;
  description: string;
  skillPath?: string; // For nested skills like front-end/react-best-practices
}

/**
 * Get the package root directory
 */
function getPackageRoot(): string {
  // From src/cli/commands/pull.ts -> go up to memorize-mcp/
  return path.resolve(__dirname, "../../../");
}

/**
 * Get source directory for a category
 */
function getSourceDir(category: ResourceCategory): string {
  const root = getPackageRoot();
  if (category === "prompts") {
    return path.join(root, ".github/prompts");
  }
  return path.join(root, ".skills");
}

/**
 * Get target directory for a category
 */
function getTargetDir(targetDir: string, category: ResourceCategory): string {
  if (category === "prompts") {
    return path.join(targetDir, ".github/prompts");
  }
  return path.join(targetDir, ".skills");
}

/**
 * Whitelist of files to include for each category
 * Only prompts has whitelist - others include all .md files
 */
const PROMPTS_WHITELIST = ["save-memory.prompt.md"];

/**
 * Get all available skill folders recursively
 */
async function getAllSkillFolders(
  baseDir: string,
  prefix = "",
): Promise<string[]> {
  const skills: string[] = [];

  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const fullPath = path.join(baseDir, entry.name);

        // Check if this directory contains SKILL.md
        const skillFile = path.join(fullPath, "SKILL.md");
        try {
          await fs.access(skillFile);
          skills.push(skillPath);
        } catch {
          // No SKILL.md, check subdirectories
          const subSkills = await getAllSkillFolders(fullPath, skillPath);
          skills.push(...subSkills);
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return skills;
}

/**
 * List available resources by category
 */
async function listAvailableResources(
  skillGroup?: SkillGroup,
): Promise<ResourceInfo[]> {
  const resources: ResourceInfo[] = [];

  // List prompts
  const promptsDir = getSourceDir("prompts");
  try {
    let files = await fs.readdir(promptsDir);
    files = files.filter((f) => f.endsWith(".md") || f.endsWith(".prompt.md"));
    files = files.filter((f) => PROMPTS_WHITELIST.includes(f));

    for (const file of files) {
      const content = await fs.readFile(path.join(promptsDir, file), "utf-8");
      const firstLine =
        content.split("\n").find((l) => l.startsWith("# ")) || "";
      const description = firstLine.replace(/^#\s*/, "").trim();

      resources.push({
        category: "prompts",
        filename: file,
        description,
      });
    }
  } catch {
    // Prompts folder doesn't exist
  }

  // List skills based on group
  const skillsDir = getSourceDir("skills");
  let skillsToList: string[] = [];

  if (!skillGroup || skillGroup === "all") {
    // Get all skills dynamically
    skillsToList = await getAllSkillFolders(skillsDir);
  } else {
    skillsToList = SKILL_GROUPS[skillGroup] || [];
  }

  for (const skillPath of skillsToList) {
    const skillFile = path.join(skillsDir, skillPath, "SKILL.md");
    try {
      const content = await fs.readFile(skillFile, "utf-8");
      const firstLine =
        content.split("\n").find((l) => l.startsWith("# ")) || "";
      const description = firstLine.replace(/^#\s*/, "").trim();

      resources.push({
        category: "skills",
        filename: "SKILL.md",
        description,
        skillPath,
      });
    } catch {
      // Skill doesn't exist
    }
  }

  return resources;
}

/**
 * Display available resources
 */
async function displayResources(skillGroup?: SkillGroup) {
  console.log(`\n${colors.bright}📦 Available Resources:${colors.reset}\n`);

  const resources = await listAvailableResources(skillGroup);

  // Display prompts
  const promptResources = resources.filter((r) => r.category === "prompts");
  console.log(`${colors.cyan}💬 PROMPTS${colors.reset}`);
  if (promptResources.length === 0) {
    console.log(`   ${colors.dim}(no prompts available)${colors.reset}`);
  } else {
    for (const resource of promptResources) {
      console.log(
        `   ${colors.green}•${colors.reset} ${resource.filename} - ${colors.dim}${resource.description}${colors.reset}`,
      );
    }
  }
  console.log();

  // Display skills grouped
  const skillResources = resources.filter((r) => r.category === "skills");
  console.log(`${colors.cyan}🧠 SKILLS${colors.reset}`);

  if (skillResources.length === 0) {
    console.log(`   ${colors.dim}(no skills available)${colors.reset}`);
  } else {
    // Group skills by category
    const basicSkills = skillResources.filter((r) =>
      SKILL_GROUPS.basic.some((s) => r.skillPath === s),
    );
    const frontendSkills = skillResources.filter((r) =>
      r.skillPath?.startsWith("front-end/"),
    );
    const otherSkills = skillResources.filter(
      (r) =>
        !SKILL_GROUPS.basic.some((s) => r.skillPath === s) &&
        !r.skillPath?.startsWith("front-end/"),
    );

    if (basicSkills.length > 0) {
      console.log(`   ${colors.magenta}[basic]${colors.reset}`);
      for (const resource of basicSkills) {
        console.log(
          `      ${colors.green}•${colors.reset} ${resource.skillPath} - ${colors.dim}${resource.description}${colors.reset}`,
        );
      }
    }

    if (frontendSkills.length > 0) {
      console.log(`   ${colors.magenta}[frontend]${colors.reset}`);
      for (const resource of frontendSkills) {
        console.log(
          `      ${colors.green}•${colors.reset} ${resource.skillPath} - ${colors.dim}${resource.description}${colors.reset}`,
        );
      }
    }

    if (otherSkills.length > 0) {
      console.log(`   ${colors.magenta}[other]${colors.reset}`);
      for (const resource of otherSkills) {
        console.log(
          `      ${colors.green}•${colors.reset} ${resource.skillPath} - ${colors.dim}${resource.description}${colors.reset}`,
        );
      }
    }
  }
  console.log();
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): PullOptions {
  const options: PullOptions = {
    targetDir: process.cwd(),
    overwrite: false,
    categories: ["prompts"], // Default: only prompts (includes /save-memory)
    skillGroup: undefined,
  };

  let hasSkillsFlag = false;
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case "--all":
      case "-a":
        if (hasSkillsFlag) {
          // --skills --all: all skills only
          options.skillGroup = "all";
        } else {
          // --all: prompts + all skills
          options.categories = ["prompts", "skills"];
          options.skillGroup = "all";
        }
        break;

      case "--prompts":
      case "-p":
        options.categories = ["prompts"];
        break;

      case "--skills":
      case "-s":
        hasSkillsFlag = true;
        options.categories = ["skills"];
        // Default to all skills if no group specified
        if (!options.skillGroup) {
          options.skillGroup = "all";
        }
        break;

      case "--basic":
        options.categories = ["skills"];
        options.skillGroup = "basic";
        break;

      case "--frontend":
        options.categories = ["skills"];
        options.skillGroup = "frontend";
        break;

      case "--target":
      case "-t":
        i++;
        options.targetDir = args[i] || process.cwd();
        break;

      case "--overwrite":
      case "-o":
        options.overwrite = true;
        break;
    }

    i++;
  }

  return options;
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Copy directory recursively
 */
async function copyDirRecursive(
  src: string,
  dest: string,
  overwrite: boolean,
): Promise<void> {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath, overwrite);
    } else {
      const exists = await fileExists(destPath);
      if (!exists || overwrite) {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

/**
 * Pull resources to target directory
 */
async function pullResources(options: PullOptions): Promise<void> {
  console.log(`\n${colors.bright}🚀 Pulling resources...${colors.reset}\n`);
  console.log(`${colors.dim}Target: ${options.targetDir}${colors.reset}`);
  if (options.skillGroup) {
    console.log(
      `${colors.dim}Skill group: ${options.skillGroup}${colors.reset}`,
    );
  }
  console.log();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const category of options.categories) {
    if (category === "prompts") {
      // Pull prompts (same as before)
      const sourceCategoryDir = getSourceDir("prompts");
      const targetCategoryDir = getTargetDir(options.targetDir, "prompts");

      try {
        let files = await fs.readdir(sourceCategoryDir);
        let mdFiles = files.filter(
          (f) => f.endsWith(".md") || f.endsWith(".prompt.md"),
        );
        mdFiles = mdFiles.filter((f) => PROMPTS_WHITELIST.includes(f));

        if (mdFiles.length === 0) {
          console.log(
            `${colors.yellow}⚠️  No prompts available${colors.reset}`,
          );
          continue;
        }

        await ensureDir(targetCategoryDir);

        for (const file of mdFiles) {
          const sourceFile = path.join(sourceCategoryDir, file);
          const targetFile = path.join(targetCategoryDir, file);
          const displayPath = `.github/prompts/${file}`;

          try {
            const targetExists = await fileExists(targetFile);

            if (targetExists && !options.overwrite) {
              console.log(
                `   ${colors.dim}⏭️  ${displayPath} (skipped - already exists)${colors.reset}`,
              );
              skipped++;
              continue;
            }

            const content = await fs.readFile(sourceFile, "utf-8");
            await fs.writeFile(targetFile, content, "utf-8");

            if (targetExists) {
              console.log(
                `   ${colors.blue}🔄 ${displayPath} (updated)${colors.reset}`,
              );
              updated++;
            } else {
              console.log(
                `   ${colors.green}✅ ${displayPath} (created)${colors.reset}`,
              );
              created++;
            }
          } catch (err: any) {
            console.log(
              `   ${colors.red}❌ ${displayPath} (failed: ${err.message})${colors.reset}`,
            );
            failed++;
          }
        }
      } catch {
        console.log(`${colors.yellow}⚠️  Prompts not available${colors.reset}`);
      }
    } else if (category === "skills") {
      // Pull skills based on group
      const skillsSourceDir = getSourceDir("skills");
      const skillsTargetDir = getTargetDir(options.targetDir, "skills");

      let skillsToProcess: string[] = [];

      if (options.skillGroup === "all" || !options.skillGroup) {
        skillsToProcess = await getAllSkillFolders(skillsSourceDir);
      } else {
        skillsToProcess = SKILL_GROUPS[options.skillGroup] || [];
      }

      if (skillsToProcess.length === 0) {
        console.log(
          `${colors.yellow}⚠️  No skills to pull for group: ${options.skillGroup || "all"}${colors.reset}`,
        );
        continue;
      }

      for (const skillPath of skillsToProcess) {
        const sourceSkillDir = path.join(skillsSourceDir, skillPath);
        const targetSkillDir = path.join(skillsTargetDir, skillPath);
        const displayPath = `.skills/${skillPath}/SKILL.md`;

        try {
          // Check if skill exists
          const sourceFile = path.join(sourceSkillDir, "SKILL.md");
          await fs.access(sourceFile);

          const targetFile = path.join(targetSkillDir, "SKILL.md");
          const targetExists = await fileExists(targetFile);

          if (targetExists && !options.overwrite) {
            console.log(
              `   ${colors.dim}⏭️  ${displayPath} (skipped - already exists)${colors.reset}`,
            );
            skipped++;
            continue;
          }

          // Ensure target directory exists
          await ensureDir(targetSkillDir);

          // Copy SKILL.md
          const content = await fs.readFile(sourceFile, "utf-8");
          await fs.writeFile(targetFile, content, "utf-8");

          if (targetExists) {
            console.log(
              `   ${colors.blue}🔄 ${displayPath} (updated)${colors.reset}`,
            );
            updated++;
          } else {
            console.log(
              `   ${colors.green}✅ ${displayPath} (created)${colors.reset}`,
            );
            created++;
          }

          // Also copy other files in the skill directory (examples, resources, etc.)
          try {
            const skillFiles = await fs.readdir(sourceSkillDir);
            for (const file of skillFiles) {
              if (file === "SKILL.md") continue;

              const srcPath = path.join(sourceSkillDir, file);
              const dstPath = path.join(targetSkillDir, file);
              const stat = await fs.stat(srcPath);

              if (stat.isFile()) {
                const exists = await fileExists(dstPath);
                if (!exists || options.overwrite) {
                  await fs.copyFile(srcPath, dstPath);
                }
              } else if (stat.isDirectory()) {
                // Copy subdirectory recursively
                await copyDirRecursive(srcPath, dstPath, options.overwrite);
              }
            }
          } catch {
            // No additional files
          }
        } catch (err: any) {
          console.log(
            `   ${colors.red}❌ ${displayPath} (failed: ${err.message})${colors.reset}`,
          );
          failed++;
        }
      }
    }
  }

  // Summary
  console.log(`\n${colors.bright}📊 Summary:${colors.reset}`);
  console.log(`   ${colors.green}Created: ${created}${colors.reset}`);
  if (updated > 0)
    console.log(`   ${colors.blue}Updated: ${updated}${colors.reset}`);
  if (skipped > 0)
    console.log(`   ${colors.dim}Skipped: ${skipped}${colors.reset}`);
  if (failed > 0)
    console.log(`   ${colors.red}Failed: ${failed}${colors.reset}`);

  // Usage hint
  if (created > 0 || updated > 0) {
    const hasPrompts = options.categories.includes("prompts");
    const hasSkills = options.categories.includes("skills");

    console.log(`\n${colors.bright}💡 Next steps:${colors.reset}`);
    if (hasPrompts) {
      console.log(
        `   ${colors.dim}1. Check .github/prompts/ for AI agent prompts${colors.reset}`,
      );
      console.log(
        `   ${colors.dim}2. Use /save-memory <task> in AI chat to auto-save memories${colors.reset}`,
      );
    }
    if (hasSkills) {
      console.log(
        `   ${colors.dim}• Check .skills/ for AI agent skills${colors.reset}`,
      );
      console.log(
        `   ${colors.dim}• Skills provide best practices and guidelines for AI agents${colors.reset}`,
      );
    }
    console.log(
      `   ${colors.dim}• Run 'npx memorize-mcp pull --all' for all resources${colors.reset}`,
    );
    console.log();
  }
}

/**
 * Main pull command handler
 */
export async function pullCommand(args: string[]): Promise<void> {
  // If no specific category, show available resources first
  if (args.length === 0) {
    await displayResources("all");
    console.log(
      `${colors.bright}💡 Tip:${colors.reset} Run ${colors.cyan}'npx memorize-mcp pull'${colors.reset} to pull default resources (prompts)\n`,
    );
    console.log(
      `${colors.dim}Skills options: --skills --all | --skills --basic | --skills --frontend${colors.reset}\n`,
    );

    // Pull default (prompts) anyway
    const options = parseArgs([]);
    await pullResources(options);
    return;
  }

  const options = parseArgs(args);
  await pullResources(options);
}
