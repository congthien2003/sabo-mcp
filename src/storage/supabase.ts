/**
 * Supabase storage implementation for memorize-mcp
 * Handles cloud sync of memory data
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "../config.js";
import type { SaveMemoryOptions, Project } from "./types.js";

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
