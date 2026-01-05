# memorize-mcp (Memory MCP Server)

## Tóm tắt nhanh

- MCP server đơn giản dùng để lưu trữ bản tóm tắt nội dung công việc ra file JSON trên máy local.
- Cung cấp 1 tool duy nhất: `save_memorize` – nhận `filename`, `topic`, `content` và ghi thành file JSON.
- Thư mục lưu trữ mặc định: `./.memories/data` (có thể thay đổi qua biến môi trường `MEMORIZE_MCP_PROJECT_ROOT`).

**Phiên bản hiện tại**: `1.0.0` – xem chi tiết trong `CHANGELOG.md`.

---

## Giới thiệu

memorize-mcp là một [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server nhỏ gọn, dùng để giúp AI/LLM lưu lại "memory" dưới dạng file JSON.

Mục tiêu:

- Lưu lại bản tóm tắt hoặc ghi chú của từng phiên làm việc.
- Lưu trữ ở dạng file JSON dễ đọc, dễ backup và dễ tái sử dụng.
- Dùng chuẩn MCP nên có thể cắm vào nhiều client hỗ trợ MCP (Claude Desktop, VS Code extension, v.v.).

Server này chạy qua stdin/stdout (stdio) nên phù hợp để được gọi bởi các MCP client.

## Yêu cầu môi trường

- [Bun](https://bun.sh) >= 1.2.x
- Node.js chỉ cần cho type definitions (dev), không bắt buộc để chạy.
- TypeScript được khai báo là `peerDependency` (dùng cho phát triển).

## Cài đặt & chạy local

### 1. Cài dependencies

```bash
bun install
```

### 2. Chạy server bằng Bun

```bash
bun run index.ts
```

Khi chạy trực tiếp, bạn sẽ thấy log dạng:

```text
==================================================
🚀 Memory MCP Server Started
📁 Memory Directory: ./.memories/data
⏰ Started at: 05/01/2026, 21:34:12
==================================================
```

Lưu ý: Trong thực tế, server này thường được khởi chạy bởi MCP client (ví dụ Claude Desktop hoặc MCP plugin của VS Code) thông qua stdio, không phải gọi HTTP.

### 3. Cấu hình thư mục lưu memory

Biến môi trường dùng để cấu hình thư mục lưu file:

- `MEMORIZE_MCP_PROJECT_ROOT`: nếu đặt biến này, server sẽ lưu file vào thư mục `MEMORIZE_MCP_PROJECT_ROOT`.
- Nếu không đặt, mặc định sẽ là `./.memories/data` (tính từ thư mục đang chạy `bun run index.ts`).

Ví dụ trên macOS/Linux (shell):

```bash
export MEMORIZE_MCP_PROJECT_ROOT="/path/to/your/memories"
bun run index.ts
```

Ví dụ trên Windows (PowerShell):

```powershell
$env:MEMORIZE_MCP_PROJECT_ROOT = "C:\path\to\your\memories"
bun run index.ts
```

## Tích hợp với MCP client (ví dụ Claude Desktop)

Nếu bạn dùng Claude Desktop và muốn thêm server này vào danh sách MCP servers, có thể thêm một mục tương tự (tham khảo, tuỳ phiên bản client):

```jsonc
{
	"mcpServers": {
		"memorize-mcp": {
			"command": "bun",
			"args": ["run", "index.ts"],
			"env": {
				"MEMORIZE_MCP_PROJECT_ROOT": "C:/path/to/your/memories"
			}
		}
	}
}
```

Cấu hình thật có thể khác tuỳ client MCP bạn đang dùng, nhưng ý tưởng chung là:

- `command`: lệnh để chạy (ở đây là `bun`).
- `args`: tham số để chạy file `index.ts`.
- `env`: thiết lập `MEMORIZE_MCP_PROJECT_ROOT` nếu muốn thay đổi thư mục lưu.

## Tool: `save_memorize`

Server khai báo một tool duy nhất tên là `save_memorize`.

### Mô tả

- **Tên**: `save_memorize`
- **Chức năng**: Lưu bản tóm tắt nội dung công việc vào file local dưới dạng JSON.

### Input schema

```json
{
	"type": "object",
	"properties": {
		"filename": {
			"type": "string",
			"description": "Tên file (vd: summary_v1.json)"
		},
		"topic": {
			"type": "string",
			"description": "Chủ đề chính của phiên làm việc"
		},
		"content": {
			"type": "string",
			"description": "Nội dung tóm tắt chi tiết"
		}
	},
	"required": ["filename", "topic", "content"]
}
```

### Cách hoạt động

1. MCP client gọi tool `save_memorize` với 3 tham số: `filename`, `topic`, `content`.
2. Server tạo đường dẫn file: `filePath = path.join(MEMORY_DIR, filename)`.
3. Ghi file JSON với nội dung dạng:

```json
{
	"topic": "Tên chủ đề",
	"timestamp": "2026-01-05T14:23:45.000Z",
	"content": "Nội dung tóm tắt chi tiết...",
	"createdAt": "05/01/2026, 21:23:45"
}
```

4. Nếu thành công, server trả về một message dạng text, ví dụ:

```text
✅ Đã lưu tóm tắt vào: C:/path/to/your/memories/summary_v1.json
```

Nếu có lỗi ghi file, server trả về nội dung text với mô tả lỗi và `isError: true`.

## Logging

Server in log ra console mỗi khi:

- Nhận request gọi tool (`Received tool request: save_memorize`).
- Bắt đầu xử lý `save_memorize` với thông tin `filename`, `topic`, `contentLength`.
- Ghi file thành công hoặc báo lỗi.

Log này hữu ích để debug khi tích hợp với client MCP.

## Tóm tắt (bản rút gọn)

- Đây là một MCP server nhỏ, chạy bằng Bun, dùng stdio.
- Server cung cấp tool `save_memorize` để lưu tóm tắt vào file JSON.
- Thư mục lưu được cấu hình bởi `MEMORIZE_MCP_PROJECT_ROOT`, mặc định `.memories/data`.
- Phù hợp để dùng như "bộ nhớ ngoài" cho các phiên làm việc với AI/LLM.

---

## Versioning & Changelog

- Dự án sử dụng Semantic Versioning (`MAJOR.MINOR.PATCH`).
- Mọi thay đổi quan trọng sẽ được cập nhật trong file `CHANGELOG.md`.
