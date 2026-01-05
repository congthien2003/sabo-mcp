import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { env } from "process";

// Đường dẫn lưu file - có thể tùy chỉnh qua biến môi trường
const MEMORY_DIR = env.MEMORIZE_MCP_PROJECT_ROOT || "./.memories/data";

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(MEMORY_DIR)) {
	fs.mkdirSync(MEMORY_DIR);
}

const server = new Server(
	{ name: "memory-server", version: "1.0.0" },
	{ capabilities: { tools: {} } }
);

// 1. Khai báo Tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "save_memorize",
				description:
					"Lưu bản tóm tắt nội dung công việc vào file local dưới dạng JSON",
				inputSchema: {
					type: "object",
					properties: {
						filename: {
							type: "string",
							description: "Tên file (vd: summary_v1.json)",
						},
						topic: {
							type: "string",
							description: "Chủ đề chính của phiên làm việc",
						},
						content: {
							type: "string",
							description: "Nội dung tóm tắt chi tiết",
						},
					},
					required: ["filename", "topic", "content"],
				},
			},
		],
	};
});

// 2. Xử lý lưu file
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	console.log(
		`[${new Date().toISOString()}] Received tool request: ${
			request.params.name
		}`
	);

	if (request.params.name === "save_memorize") {
		const { filename, topic, content } = request.params.arguments as any;
		console.log(`[${new Date().toISOString()}] Processing save_memorize:`, {
			filename,
			topic,
			contentLength: content?.length || 0,
		});

		const filePath = path.join(MEMORY_DIR, filename);

		const dataToSave = {
			topic: topic,
			timestamp: new Date().toISOString(),
			content: content,
			createdAt: new Date().toLocaleString("vi-VN"),
		};

		try {
			// Ghi file dưới dạng JSON
			fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");
			console.log(
				`[${new Date().toISOString()}] ✅ Successfully saved file: ${filePath}`
			);

			return {
				content: [{ type: "text", text: `✅ Đã lưu tóm tắt vào: ${filePath}` }],
			};
		} catch (error: any) {
			console.error(
				`[${new Date().toISOString()}] ❌ Error saving file:`,
				error
			);
			return {
				content: [{ type: "text", text: `❌ Lỗi ghi file: ${error.message}` }],
				isError: true,
			};
		}
	}

	console.warn(
		`[${new Date().toISOString()}] ⚠️ Unknown tool requested: ${
			request.params.name
		}`
	);
	throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.log("=".repeat(50));
console.log("🚀 Memory MCP Server Started");
console.log(`📁 Memory Directory: ${MEMORY_DIR}`);
console.log(`⏰ Started at: ${new Date().toLocaleString("vi-VN")}`);
console.log("=".repeat(50));
