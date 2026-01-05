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
