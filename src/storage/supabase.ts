/**
 * Supabase storage implementation for memorize-mcp
 * Handles cloud sync of memory data
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "../config.js";
import type { SaveMemoryOptions, Project, MemoryRecord } from "./types.js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client (singleton pattern)
 */
function getSupabaseClient(config: Config): SupabaseClient | null {
	if (!config.supabase.url || !config.supabase.serviceRoleKey) {
		return null;
	}

	if (!supabaseClient) {
		supabaseClient = createClient(
			config.supabase.url,
			config.supabase.serviceRoleKey,
			{
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
			}
		);
	}

	return supabaseClient;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(config: Config): boolean {
	return !!(config.supabase.url && config.supabase.serviceRoleKey);
}

/**
 * Ensure project exists in Supabase, create if not
 * @param projectSlug - Unique slug for the project
 * @param config - Configuration object
 * @returns Project ID or null if failed
 */
export async function ensureProject(
	projectSlug: string,
	config: Config
): Promise<string | null> {
	const client = getSupabaseClient(config);
	if (!client) {
		console.warn("[Supabase] Client not configured");
		return null;
	}

	try {
		// Try to find existing project
		const { data: existingProject, error: findError } = await client
			.from("projects")
			.select("id")
			.eq("slug", projectSlug)
			.single();

		if (existingProject) {
			console.log(
				`[${new Date().toISOString()}] Found existing project: ${projectSlug}`
			);
			return existingProject.id;
		}

		// Create new project if not found
		if (findError?.code === "PGRST116") {
			// No rows returned
			const { data: newProject, error: createError } = await client
				.from("projects")
				.insert({
					slug: projectSlug,
					name: projectSlug, // Can be customized later
				})
				.select("id")
				.single();

			if (createError) {
				console.error(
					`[${new Date().toISOString()}] Error creating project:`,
					createError
				);
				return null;
			}

			console.log(
				`[${new Date().toISOString()}] Created new project: ${projectSlug}`
			);
			return newProject.id;
		}

		console.error(
			`[${new Date().toISOString()}] Error finding project:`,
			findError
		);
		return null;
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in ensureProject:`,
			error
		);
		return null;
	}
}

/**
 * Save memory to Supabase
 * @param options - Memory data to save
 * @param config - Configuration object
 * @returns Success status
 */
export async function saveSupabaseMemory(
	options: SaveMemoryOptions,
	config: Config
): Promise<boolean> {
	const client = getSupabaseClient(config);
	if (!client) {
		console.warn("[Supabase] Client not configured, skipping cloud sync");
		return false;
	}

	try {
		// Determine project slug
		const projectSlug =
			options.projectSlug || config.supabase.projectSlug || "default";

		// Ensure project exists
		const projectId = await ensureProject(projectSlug, config);
		if (!projectId) {
			console.error(
				`[${new Date().toISOString()}] Could not get project ID for slug: ${projectSlug}`
			);
			return false;
		}

		// Insert memory record
		const { error } = await client.from("memories").insert({
			project_id: projectId,
			filename: options.filename,
			topic: options.topic,
			content: options.content,
			timestamp: options.timestamp || new Date().toISOString(),
			created_from: options.createdFrom || config.createdFrom,
		});

		if (error) {
			console.error(
				`[${new Date().toISOString()}] Error saving to Supabase:`,
				error
			);
			return false;
		}

		console.log(
			`[${new Date().toISOString()}] ✅ Successfully synced to Supabase: ${
				options.filename
			}`
		);
		return true;
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in saveSupabaseMemory:`,
			error
		);
		return false;
	}
}

/**
 * Get project by slug
 * @param projectSlug - Unique slug for the project
 * @param config - Configuration object
 * @returns Project object or null if not found
 */
export async function getProjectBySlug(
	projectSlug: string,
	config: Config
): Promise<Project | null> {
	const client = getSupabaseClient(config);
	if (!client) {
		console.warn("[Supabase] Client not configured");
		return null;
	}

	try {
		const { data, error } = await client
			.from("projects")
			.select("*")
			.eq("slug", projectSlug)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				console.log(
					`[${new Date().toISOString()}] Project not found: ${projectSlug}`
				);
				return null;
			}
			console.error(
				`[${new Date().toISOString()}] Error fetching project:`,
				error
			);
			return null;
		}

		return data as Project;
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in getProjectBySlug:`,
			error
		);
		return null;
	}
}

/**
 * Get all memories for a project
 * @param projectSlug - Unique slug for the project
 * @param config - Configuration object
 * @returns Array of memory records
 */
export async function getProjectMemories(
	projectSlug: string,
	config: Config
): Promise<MemoryRecord[]> {
	const client = getSupabaseClient(config);
	if (!client) {
		console.warn("[Supabase] Client not configured");
		return [];
	}

	try {
		// First get project ID
		const project = await getProjectBySlug(projectSlug, config);
		if (!project) {
			console.log(
				`[${new Date().toISOString()}] Project not found, no memories to fetch`
			);
			return [];
		}

		// Fetch all memories for this project
		const { data, error } = await client
			.from("memories")
			.select("*")
			.eq("project_id", project.id)
			.order("timestamp", { ascending: false });

		if (error) {
			console.error(
				`[${new Date().toISOString()}] Error fetching memories:`,
				error
			);
			return [];
		}

		console.log(
			`[${new Date().toISOString()}] Fetched ${
				data.length
			} memories for project: ${projectSlug}`
		);
		return data as MemoryRecord[];
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in getProjectMemories:`,
			error
		);
		return [];
	}
}

/**
 * Get a single memory by filename
 * @param projectSlug - Unique slug for the project
 * @param filename - Filename to search for
 * @param config - Configuration object
 * @returns Memory record or null if not found
 */
export async function getMemoryByFilename(
	projectSlug: string,
	filename: string,
	config: Config
): Promise<MemoryRecord | null> {
	const client = getSupabaseClient(config);
	if (!client) {
		console.warn("[Supabase] Client not configured");
		return null;
	}

	try {
		// First get project ID
		const project = await getProjectBySlug(projectSlug, config);
		if (!project) {
			return null;
		}

		// Fetch memory by filename
		const { data, error } = await client
			.from("memories")
			.select("*")
			.eq("project_id", project.id)
			.eq("filename", filename)
			.order("timestamp", { ascending: false })
			.limit(1)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			console.error(
				`[${new Date().toISOString()}] Error fetching memory:`,
				error
			);
			return null;
		}

		return data as MemoryRecord;
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Exception in getMemoryByFilename:`,
			error
		);
		return null;
	}
}
