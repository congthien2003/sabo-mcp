/**
 * Workflows module: Handle pulling workflow files from source to project
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

/**
 * Get the local workflows directory (bundled with package)
 */
function getLocalWorkflowsDir(): string {
	// From src/storage/workflows.ts -> go up to memorize-mcp/.workflows
	return path.resolve(__dirname, "../../.workflows");
}

/**
 * List workflow files from local source
 */
async function listLocalWorkflows(): Promise<string[]> {
	const workflowsDir = getLocalWorkflowsDir();

	try {
		const files = await fs.readdir(workflowsDir);
		// Filter only .md files
		return files.filter((f) => f.endsWith(".md"));
	} catch (error: any) {
		console.error(
			`[${new Date().toISOString()}] Error listing local workflows:`,
			error
		);
		return [];
	}
}

/**
 * Read workflow content from local source
 */
async function readLocalWorkflow(filename: string): Promise<string> {
	const workflowsDir = getLocalWorkflowsDir();
	const filePath = path.join(workflowsDir, filename);

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
 */
async function writeWorkflowFile(
	targetDir: string,
	filename: string,
	content: string
): Promise<void> {
	const workflowsDir = path.join(targetDir, ".workflows");
	await ensureDir(workflowsDir);

	const filePath = path.join(workflowsDir, filename);
	await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Pull workflows from source to target project
 * @param options - Pull options
 * @param config - Config object
 * @returns Pull result with statistics
 */
export async function pullWorkflows(
	options: PullWorkflowsOptions,
	config: Config
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

	try {
		// Get list of workflow files based on source type
		let workflowFiles: string[] = [];

		switch (config.workflows.sourceType) {
			case "local":
				workflowFiles = await listLocalWorkflows();
				break;

			case "supabase":
				// TODO: Implement Supabase workflows fetch in future
				return {
					success: false,
					targetDir,
					stats,
					files: [],
					message: "Supabase source not yet implemented. Use 'local' for now.",
					errors: ["Supabase source not implemented"],
				};

			case "github":
				// TODO: Implement GitHub workflows fetch in future
				return {
					success: false,
					targetDir,
					stats,
					files: [],
					message: "GitHub source not yet implemented. Use 'local' for now.",
					errors: ["GitHub source not implemented"],
				};

			default:
				workflowFiles = await listLocalWorkflows();
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
				return {
					success: false,
					targetDir,
					stats,
					files: [],
					message: `Invalid workflow filename: ${requestedFilename}`,
					errors: [`Invalid workflow filename: ${requestedFilename}`],
				};
			}

			workflowFiles = workflowFiles.filter((f) => f === safeFilename);
			if (workflowFiles.length === 0) {
				return {
					success: false,
					targetDir,
					stats,
					files: [],
					message: `Workflow file not found: ${requestedFilename}`,
					errors: [`File not found: ${requestedFilename}`],
				};
			}
		}

		stats.total = workflowFiles.length;

		// Process each workflow file
		for (const filename of workflowFiles) {
			try {
				// Check if file exists in target
				const targetFilePath = path.join(
					targetDir,
					".workflows",
					filename
				);
				const targetFileExists = await fileExists(targetFilePath);

				// Decide action
				if (targetFileExists && !options.overwrite) {
					stats.skipped++;
					console.log(
						`[${new Date().toISOString()}] Skipping ${filename} (already exists)`
					);
					continue;
				}

				// Read content from source
				const content = await readLocalWorkflow(filename);

				// Write to target
				await writeWorkflowFile(targetDir, filename, content);

				if (targetFileExists) {
					stats.updated++;
					console.log(
						`[${new Date().toISOString()}] Updated ${filename}`
					);
				} else {
					stats.created++;
					console.log(
						`[${new Date().toISOString()}] Created ${filename}`
					);
				}

				processedFiles.push(filename);
			} catch (error: any) {
				stats.failed++;
				const errorMsg = `Failed to process ${filename}: ${error.message}`;
				errors.push(errorMsg);
				console.error(`[${new Date().toISOString()}] ${errorMsg}`);
			}
		}

		// Build result message
		let message = `✅ Pull workflows hoàn tất!\n`;
		message += `📥 Đã tải: ${stats.created} files\n`;
		if (stats.updated > 0) {
			message += `🔄 Đã cập nhật: ${stats.updated} files\n`;
		}
		if (stats.skipped > 0) {
			message += `⏭️ Bỏ qua (đã tồn tại): ${stats.skipped} files\n`;
		}
		if (stats.failed > 0) {
			message += `❌ Thất bại: ${stats.failed} files\n`;
		}
		message += `📁 Target: ${path.join(targetDir, ".workflows")}`;

		return {
			success: stats.failed === 0,
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
