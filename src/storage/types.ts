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
