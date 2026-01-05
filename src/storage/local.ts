/**
 * Local storage implementation for memorize-mcp
 * Handles saving memory data to local JSON files
 */
import fs from "fs";
import path from "path";
import type { MemoryData, SaveMemoryOptions } from "./types.js";

/**
 * Ensure directory exists, create if not
 */
export function ensureDirectoryExists(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Check if a local memory file exists
 */
export function localMemoryExists(
	filename: string,
	memoryDir: string
): boolean {
	const filePath = path.join(memoryDir, filename);
	return fs.existsSync(filePath);
}

/**
 * Read local memory file
 * @param filename - Filename to read
 * @param memoryDir - Base directory for memory files
 * @returns MemoryData or null if file doesn't exist or invalid
 */
export function readLocalMemory(
	filename: string,
	memoryDir: string
): MemoryData | null {
	try {
		const filePath = path.join(memoryDir, filename);

		if (!fs.existsSync(filePath)) {
			return null;
		}

		const content = fs.readFileSync(filePath, "utf8");
		const data = JSON.parse(content) as MemoryData;

		// Validate required fields
		if (!data.filename || !data.topic || !data.content || !data.timestamp) {
			console.warn(
				`[${new Date().toISOString()}] Invalid memory file: ${filePath}`
			);
			return null;
		}

		return data;
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Error reading local memory ${filename}:`,
			error
		);
		return null;
	}
}

/**
 * List all memory files in directory
 * @param memoryDir - Base directory for memory files
 * @returns Array of filenames
 */
export function listLocalMemories(memoryDir: string): string[] {
	try {
		if (!fs.existsSync(memoryDir)) {
			return [];
		}

		const files = fs.readdirSync(memoryDir);
		// Filter only JSON files
		return files.filter((file) => file.endsWith(".json"));
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] Error listing local memories:`,
			error
		);
		return [];
	}
}

/**
 * Save memory data to local JSON file
 * @param options - Memory data to save
 * @param memoryDir - Base directory for memory files
 * @returns Path to saved file
 */
export function saveLocalMemory(
	options: SaveMemoryOptions,
	memoryDir: string
): string {
	const { filename, topic, content, timestamp, createdFrom } = options;

	// Ensure directory exists
	ensureDirectoryExists(memoryDir);

	// Prepare data structure
	const dataToSave: MemoryData = {
		filename,
		topic,
		timestamp: timestamp || new Date().toISOString(),
		content,
		createdAt: new Date().toLocaleString("vi-VN"),
		createdFrom,
	};

	// Generate file path
	const filePath = path.join(memoryDir, filename);

	// Write to file
	fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

	return filePath;
}
