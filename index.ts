import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { saveMemory } from "./src/storage/index.js";
import { getConfig } from "./src/config.js";

const config = getConfig();

const server = new Server(
	{ name: "memorize-mcp-server", version: "1.1.0" },
	{ capabilities: { tools: {} } }
);

// 1. Khai báo Tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "save_memorize",
				description:
					"Lưu bản tóm tắt nội dung công việc vào file local dưới dạng JSON (có thể sync lên Supabase Cloud)",
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
						projectSlug: {
							type: "string",
							description:
								"(Optional) Slug của project để sync lên Supabase. Nếu không có sẽ dùng MEMORIZE_MCP_PROJECT_SLUG từ env.",
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
		const { filename, topic, content, projectSlug } = request.params
			.arguments as any;

		console.log(`[${new Date().toISOString()}] Processing save_memorize:`, {
			filename,
			topic,
			projectSlug: projectSlug || "(from env)",
			contentLength: content?.length || 0,
		});

		try {
			const result = await saveMemory({
				filename,
				topic,
				content,
				projectSlug,
			});

			// Build response message
			let message = `✅ Đã lưu tóm tắt vào: ${result.localPath}`;

			if (result.cloudSynced) {
				message += `\n☁️ Cloud sync: Thành công`;
			} else if (result.cloudError) {
				message += `\n⚠️ Cloud sync: Thất bại (${result.cloudError})`;
			} else {
				message += `\n📍 Cloud sync: Không được cấu hình`;
			}

			return {
				content: [{ type: "text", text: message }],
			};
		} catch (error: any) {
			console.error(
				`[${new Date().toISOString()}] ❌ Error in save_memorize:`,
				error
			);
			return {
				content: [
					{
						type: "text",
						text: `❌ Lỗi: ${error.message || String(error)}`,
					},
				],
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
console.log("🚀 Memorize MCP Server v1.1 Started");
console.log(`📁 Memory Directory: ${config.memoryDir}`);
console.log(
	`☁️  Supabase: ${
		config.supabase.url ? "Configured ✓" : "Not configured (local-only)"
	}`
);
console.log(`⏰ Started at: ${new Date().toLocaleString("vi-VN")}`);
console.log("=".repeat(50));
