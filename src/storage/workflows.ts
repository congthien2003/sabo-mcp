/**
 * Workflows module: Handle pulling workflow files from source to project
 * v1.3.0: Added category support (commands, workflows, skills)
 */
import type { Config } from "../config.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import type {
  PullWorkflowsOptions,
  PullWorkflowsResult,
  PullWorkflowsStats,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// v1.3.0: Resource categories
type ResourceCategory = "commands" | "workflows" | "skills";
const ALL_CATEGORIES: ResourceCategory[] = ["commands", "workflows", "skills"];
const DEFAULT_CATEGORIES: ResourceCategory[] = ["commands"]; // Default: only commands

/**
 * Get the local workflows directory (bundled with package)
 */
function getLocalWorkflowsDir(): string {
  // From src/storage/workflows.ts -> go up to memorize-mcp/.workflows
  return path.resolve(__dirname, "../../.workflows");
}

/**
 * List workflow files from local source
 * v1.3.0: Support categories
 */
async function listLocalWorkflows(
  category?: ResourceCategory,
): Promise<string[]> {
  const workflowsDir = getLocalWorkflowsDir();
  const targetDir = category ? path.join(workflowsDir, category) : workflowsDir;

  try {
    const files = await fs.readdir(targetDir);
    // Filter only .md files
    return files.filter((f) => f.endsWith(".md"));
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}] Error listing local workflows:`,
      error,
    );
    return [];
  }
}

/**
 * Read workflow content from local source
 * v1.3.0: Support categories
 */
async function readLocalWorkflow(
  filename: string,
  category?: ResourceCategory,
): Promise<string> {
  const workflowsDir = getLocalWorkflowsDir();
  const targetDir = category ? path.join(workflowsDir, category) : workflowsDir;
  // Sanitize the filename to prevent path traversal
  const safeFilename = path.basename(filename);
  if (safeFilename !== filename) {
    throw new Error(`Invalid workflow filename: ${filename}`);
  }
  const resolvedTargetDir = path.resolve(targetDir);
  const filePath = path.resolve(resolvedTargetDir, safeFilename);
  // Ensure the resolved path is still within the target directory
  const targetDirWithSep = resolvedTargetDir.endsWith(path.sep)
    ? resolvedTargetDir
    : resolvedTargetDir + path.sep;
  if (!filePath.startsWith(targetDirWithSep)) {
    throw new Error(`Invalid workflow path: ${filename}`);
  }

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error: any) {
    throw new Error(`Failed to read workflow ${filename}: ${error.message}`);
  }
}

/**
 * Check if a file exists
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
 * Ensure directory exists, create if not
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Write workflow file to target project
 * v1.3.0: Support categories
 */
async function writeWorkflowFile(
  targetDir: string,
  filename: string,
  content: string,
  category?: ResourceCategory,
): Promise<void> {
  const workflowsDir = category
    ? path.join(targetDir, ".workflows", category)
    : path.join(targetDir, ".workflows");
  await ensureDir(workflowsDir);

  const filePath = path.join(workflowsDir, filename);
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Pull workflows from source to target project
 * v1.3.0: Added category support
 * @param options - Pull options
 * @param config - Config object
 * @returns Pull result with statistics
 */
export async function pullWorkflows(
  options: PullWorkflowsOptions,
  config: Config,
): Promise<PullWorkflowsResult> {
  // Initialize stats
  const stats: PullWorkflowsStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    total: 0,
  };

  const errors: string[] = [];
  const processedFiles: string[] = [];

  // Determine target directory
  const targetDir =
    options.targetDir || config.workflows.targetProjectDir || "";

  if (!targetDir) {
    return {
      success: false,
      targetDir: "",
      stats,
      files: [],
      message:
        "Target directory not configured. Set MEMORIZE_MCP_TARGET_PROJECT_DIR or provide targetDir parameter.",
      errors: ["Target directory not configured"],
    };
  }

  // Validate target directory exists
  const targetExists = await fileExists(targetDir);
  if (!targetExists) {
    return {
      success: false,
      targetDir,
      stats,
      files: [],
      message: `Target directory does not exist: ${targetDir}`,
      errors: [`Target directory not found: ${targetDir}`],
    };
  }

  // v1.3.0: Determine categories to pull
  const categoriesToPull: (ResourceCategory | undefined)[] = options.category
    ? [options.category as ResourceCategory]
    : options.allCategories
      ? ALL_CATEGORIES
      : DEFAULT_CATEGORIES;

  try {
    // Process each category
    for (const category of categoriesToPull) {
      // Get list of workflow files based on source type
      let workflowFiles: string[] = [];

      switch (config.workflows.sourceType) {
        case "local":
          workflowFiles = await listLocalWorkflows(category);
          break;

        case "supabase":
          // TODO: Implement Supabase workflows fetch in future
          errors.push(
            `Supabase source not implemented for category: ${category || "root"}`,
          );
          continue;

        case "github":
          // TODO: Implement GitHub workflows fetch in future
          errors.push(
            `GitHub source not implemented for category: ${category || "root"}`,
          );
          continue;

        default:
          workflowFiles = await listLocalWorkflows(category);
      }

      // Filter by filename if specified
      if (options.filename) {
        const requestedFilename = options.filename;
        const safeFilename = path.basename(requestedFilename);

        // Reject filenames that attempt directory traversal or contain path separators
        if (
          !safeFilename ||
          safeFilename !== requestedFilename ||
          safeFilename.includes(path.sep)
        ) {
          errors.push(`Invalid workflow filename: ${requestedFilename}`);
          continue;
        }

        workflowFiles = workflowFiles.filter((f) => f === safeFilename);
      }

      stats.total += workflowFiles.length;

      // Process each workflow file
      for (const filename of workflowFiles) {
        try {
          // Check if file exists in target
          const targetFilePath = category
            ? path.join(targetDir, ".workflows", category, filename)
            : path.join(targetDir, ".workflows", filename);
          const targetFileExists = await fileExists(targetFilePath);

          // Decide action
          if (targetFileExists && !options.overwrite) {
            stats.skipped++;
            console.log(
              `[${new Date().toISOString()}] Skipping ${category ? `${category}/` : ""}${filename} (already exists)`,
            );
            continue;
          }

          // Read content from source
          const content = await readLocalWorkflow(filename, category);

          // Write to target
          await writeWorkflowFile(targetDir, filename, content, category);

          if (targetFileExists) {
            stats.updated++;
            console.log(
              `[${new Date().toISOString()}] Updated ${category ? `${category}/` : ""}${filename}`,
            );
          } else {
            stats.created++;
            console.log(
              `[${new Date().toISOString()}] Created ${category ? `${category}/` : ""}${filename}`,
            );
          }

          processedFiles.push(category ? `${category}/${filename}` : filename);
        } catch (error: any) {
          stats.failed++;
          const errorMsg = `Failed to process ${category ? `${category}/` : ""}${filename}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`[${new Date().toISOString()}] ${errorMsg}`);
        }
      }
    }

    // Build result message
    let message = `✅ Pull workflows completed!\n`;
    message += `📁 Categories: ${categoriesToPull.filter(Boolean).join(", ") || "root"}\n`;
    message += `📥 Created: ${stats.created} files\n`;
    if (stats.updated > 0) {
      message += `🔄 Updated: ${stats.updated} files\n`;
    }
    if (stats.skipped > 0) {
      message += `⏭️ Skipped (already exists): ${stats.skipped} files\n`;
    }
    if (stats.failed > 0) {
      message += `❌ Failed: ${stats.failed} files\n`;
    }
    message += `📁 Target: ${path.join(targetDir, ".workflows")}`;

    return {
      success: stats.failed === 0 && errors.length === 0,
      targetDir,
      stats,
      files: processedFiles,
      message,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      targetDir,
      stats,
      files: [],
      message: `Error pulling workflows: ${error.message}`,
      errors: [error.message],
    };
  }
}
