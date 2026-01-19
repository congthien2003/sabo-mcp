/**
 * Shared types for storage layer
 */

/**
 * Memory data structure
 */
export interface MemoryData {
	filename: string;
	topic: string;
	content: string;
	timestamp: string; // ISO string
	createdAt: string; // Localized string
	createdFrom?: string; // Machine name or user info
}

/**
 * Options for saving memory
 */
export interface SaveMemoryOptions {
	filename: string;
	topic: string;
	content: string;
	projectSlug?: string;
	timestamp?: string;
	createdFrom?: string;
}

/**
 * Result of save operation
 */
export interface SaveResult {
	localPath: string;
	cloudSynced: boolean;
	cloudError?: string;
}

/**
 * Project information from Supabase
 */
export interface Project {
	id: string;
	name: string;
	slug: string;
	created_at: string;
}

/**
 * Memory record in Supabase
 */
export interface MemoryRecord {
	id: string;
	project_id: string;
	filename: string;
	topic: string;
	content: string;
	timestamp: string;
	created_at: string;
	created_from?: string;
}

/**
 * Options for syncing memories from cloud to local
 */
export interface SyncOptions {
	projectSlug?: string;
	overwrite?: boolean; // Default: true
	filename?: string; // Optional: sync single file only
}

/**
 * Sync action decision
 */
export type SyncDecision = {
	action: "create" | "update" | "skip";
	reason: string;
};

/**
 * Stats for sync operation
 */
export interface SyncStats {
	created: number;
	updated: number;
	skipped: number;
	failed: number;
	total: number;
}

/**
 * Result of sync operation
 */
export interface SyncResult {
	success: boolean;
	stats: SyncStats;
	memoryDir: string;
	projectSlug: string;
	errors?: string[];
	message: string;
}

/**
 * v1.2.1: Workflow types
 */

/**
 * Options for pulling workflows
 */
export interface PullWorkflowsOptions {
	targetDir?: string;
	overwrite?: boolean;
	filename?: string;
	projectSlug?: string;
}

/**
 * Stats for pull workflows operation
 */
export interface PullWorkflowsStats {
	created: number;
	updated: number;
	skipped: number;
	failed: number;
	total: number;
}

/**
 * Result of pull workflows operation
 */
export interface PullWorkflowsResult {
	success: boolean;
	targetDir: string;
	stats: PullWorkflowsStats;
	files: string[];
	message: string;
	errors?: string[];
}
