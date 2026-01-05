/**
 * Sync module: Handle synchronization between Supabase Cloud and local storage
 */
import { getConfig } from "../config.js";
import {
	getProjectMemories,
	getProjectBySlug,
	isSupabaseConfigured,
} from "./supabase.js";
import {
	readLocalMemory,
	saveLocalMemory,
	listLocalMemories,
} from "./local.js";
import type {
	SyncOptions,
	SyncResult,
	SyncDecision,
	SyncStats,
	MemoryRecord,
	MemoryData,
} from "./types.js";

/**
 * Decide what action to take for a memory record during sync
 * @param cloudMemory - Memory from Supabase
 * @param localMemory - Memory from local file (or null if doesn't exist)
 * @param overwrite - Force overwrite even if local is newer
 * @returns Decision: 'create', 'update', or 'skip'
 */
export function decideSyncAction(
	cloudMemory: MemoryRecord,
	localMemory: MemoryData | null,
	overwrite: boolean
): SyncDecision {
	// If local doesn't exist, create it
	if (!localMemory) {
		return { action: "create", reason: "File does not exist locally" };
	}

	// If overwrite flag is true, always update
	if (overwrite) {
		return { action: "update", reason: "Overwrite flag is set" };
	}

	// Compare timestamps
	const cloudTime = new Date(cloudMemory.timestamp).getTime();
	const localTime = new Date(localMemory.timestamp).getTime();

	// If cloud is newer, update
	if (cloudTime > localTime) {
		return { action: "update", reason: "Cloud version is newer" };
	}

	// Otherwise skip (local is same or newer)
	return { action: "skip", reason: "Local is up-to-date or newer" };
}

/**
 * Synchronize memories from Supabase Cloud to local storage
 * @param options - Sync options (projectSlug, overwrite, filename filter)
 * @returns Sync result with statistics
 */
export async function syncFromCloud(options: SyncOptions): Promise<SyncResult> {
	const config = getConfig();

	// Initialize stats
	const stats: SyncStats = {
		created: 0,
		updated: 0,
		skipped: 0,
		failed: 0,
		total: 0,
	};

	// Validate Supabase configuration
	if (!isSupabaseConfigured(config)) {
		return {
			memoryDir: config.memoryDir,
			projectSlug:
				options.projectSlug || config.supabase.projectSlug || "default",
			success: false,
			message: "Supabase not configured. Please set environment variables.",
			stats,
		};
	}

	// Determine project slug
	const projectSlug =
		options.projectSlug || config.supabase.projectSlug || "default";

	try {
		// Check if project exists
		const project = await getProjectBySlug(projectSlug, config);
		if (!project) {
			return {
				success: false,
				message: `Project not found in cloud: ${projectSlug}`,
				stats,
				memoryDir: config.memoryDir,
				projectSlug,
			};
		}

		// Fetch all memories from cloud
		const cloudMemories = await getProjectMemories(projectSlug, config);

		if (cloudMemories.length === 0) {
			return {
				success: true,
				memoryDir: config.memoryDir,
				projectSlug,
				message: "No memories found in cloud for this project.",
				stats,
			};
		}

		// Filter by filename if specified
		const memoriesToSync = options.filename
			? cloudMemories.filter((m) => m.filename === options.filename)
			: cloudMemories;

		stats.total = memoriesToSync.length;

		if (memoriesToSync.length === 0) {
			return {
				success: true,
				memoryDir: config.memoryDir,
				projectSlug,
				message: `No memories matching filter: ${options.filename}`,
				stats,
			};
		}

		console.log(
			`[${new Date().toISOString()}] Starting sync: ${
				memoriesToSync.length
			} memories from cloud`
		);

		// Process each memory
		for (const cloudMemory of memoriesToSync) {
			try {
				// Read local version if exists
				const localMemory = readLocalMemory(
					cloudMemory.filename,
					config.memoryDir
				);

				// Decide action
				const decision = decideSyncAction(
					cloudMemory,
					localMemory,
					options.overwrite || false
				);

				if (decision.action === "skip") {
					console.log(
						`[${new Date().toISOString()}] ⏭️  Skipped: ${
							cloudMemory.filename
						} (${decision.reason})`
					);
					stats.skipped++;
					continue;
				}

				// Save to local
				const localPath = saveLocalMemory(
					{
						filename: cloudMemory.filename,
						topic: cloudMemory.topic,
						content: cloudMemory.content,
						timestamp: cloudMemory.timestamp,
						createdFrom: cloudMemory.created_from || "cloud-sync",
					},
					config.memoryDir
				);

				if (decision.action === "create") {
					console.log(
						`[${new Date().toISOString()}] ➕ Created: ${cloudMemory.filename}`
					);
					stats.created++;
				} else {
					console.log(
						`[${new Date().toISOString()}] 🔄 Updated: ${cloudMemory.filename}`
					);
					stats.updated++;
				}
			} catch (error) {
				console.error(
					`[${new Date().toISOString()}] Error syncing ${
						cloudMemory.filename
					}:`,
					error
				);
				stats.failed++;
			}
		}

		// Build result message
		const summary = [
			stats.created > 0 ? `${stats.created} created` : null,
			stats.updated > 0 ? `${stats.updated} updated` : null,
			stats.skipped > 0 ? `${stats.skipped} skipped` : null,
			stats.failed > 0 ? `${stats.failed} failed` : null,
		]
			.filter(Boolean)
			.join(", ");

		return {
			success: stats.failed === 0,
			message: `Sync completed: ${summary}`,
			stats,
			memoryDir: config.memoryDir,
			projectSlug,
		};
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in syncFromCloud:`,
			error
		);
		return {
			success: false,
			message: `Sync failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
			stats,
			memoryDir: config.memoryDir,
			projectSlug:
				options.projectSlug || config.supabase.projectSlug || "default",
		};
	}
}
