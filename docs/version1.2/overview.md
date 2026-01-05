# memorize-mcp v1.2.0 – Cloud-to-Local Sync Overview

## 1. Mục tiêu v1.2.0

Phiên bản **1.2.0** bổ sung khả năng **sync ngược** từ Supabase Cloud về local:

- Tool mới `sync_memorize`: Kéo toàn bộ memories từ cloud về thư mục local theo project slug.
- Hỗ trợ làm việc trên **nhiều máy khác nhau**: máy A lưu lên cloud → máy B sync về và có đầy đủ data.
- Kiểm tra thư mục local, nếu file đã tồn tại thì **cập nhật** (overwrite hoặc merge theo timestamp).
- Giữ nguyên tính năng v1.1: `save_memorize` vẫn hoạt động như cũ.

**Kết quả**: Bạn có thể clone repo mới trên máy khác, chạy `sync_memorize` và có ngay toàn bộ memories từ cloud.

---

## 2. Use Cases

### 2.1 Máy mới, chưa có data local

1. User setup MCP server trên máy mới với cùng Supabase credentials và `project_slug`.
2. Gọi tool `sync_memorize`.
3. Server query tất cả memories từ Supabase theo `project_slug`.
4. Tạo các file JSON local tương ứng trong `MEMORIZE_MCP_PROJECT_ROOT`.

### 2.2 Máy đã có data local, cần cập nhật từ cloud

1. User đã có một số file local.
2. Gọi `sync_memorize`.
3. Server so sánh `timestamp` của file local vs cloud.
4. Nếu cloud mới hơn → overwrite file local.
5. Nếu local mới hơn hoặc bằng → giữ nguyên (hoặc tuỳ option).

### 2.3 Selective sync (optional, có thể làm sau)

- Sync chỉ một file cụ thể theo `filename`.
- Sync theo date range.
- Sync theo topic filter.

---

## 3. Thiết kế Tool `sync_memorize`

### 3.1 Tool Schema

```json
{
	"name": "sync_memorize",
	"description": "Đồng bộ memories từ Supabase Cloud về thư mục local theo project",
	"inputSchema": {
		"type": "object",
		"properties": {
			"projectSlug": {
				"type": "string",
				"description": "(Optional) Slug của project để sync. Nếu không có sẽ dùng MEMORIZE_MCP_PROJECT_SLUG từ env."
			},
			"overwrite": {
				"type": "boolean",
				"description": "(Optional) Ghi đè file local nếu cloud mới hơn. Mặc định: true"
			},
			"filename": {
				"type": "string",
				"description": "(Optional) Chỉ sync một file cụ thể theo filename"
			}
		},
		"required": []
	}
}
```

### 3.2 Response Format

```json
{
	"content": [
		{
			"type": "text",
			"text": "✅ Sync hoàn tất!\n📥 Đã tải: 5 files\n🔄 Đã cập nhật: 3 files\n⏭️ Bỏ qua (local mới hơn): 2 files\n📁 Thư mục: C:/memories/my-project"
		}
	]
}
```

---

## 4. Kiến trúc & Flow

### 4.1 Luồng xử lý `sync_memorize`

```
┌─────────────────────────────────────────────────────────────┐
│                     sync_memorize                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Validate: Supabase phải được cấu hình                    │
│ 2. Xác định projectSlug (input hoặc env)                    │
│ 3. Query project ID từ Supabase                             │
│ 4. Fetch tất cả memories của project                        │
│ 5. Với mỗi memory:                                          │
│    a. Kiểm tra file local tồn tại?                          │
│    b. So sánh timestamp (local vs cloud)                    │
│    c. Quyết định: tạo mới / cập nhật / bỏ qua               │
│ 6. Trả về summary                                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Logic so sánh timestamp

```typescript
interface SyncDecision {
	action: "create" | "update" | "skip";
	reason: string;
}

function decideSyncAction(
	localFile: MemoryData | null,
	cloudMemory: MemoryRecord,
	overwrite: boolean
): SyncDecision {
	// File không tồn tại local → tạo mới
	if (!localFile) {
		return { action: "create", reason: "File không tồn tại local" };
	}

	const localTimestamp = new Date(localFile.timestamp).getTime();
	const cloudTimestamp = new Date(cloudMemory.timestamp).getTime();

	// Cloud mới hơn → cập nhật (nếu overwrite=true)
	if (cloudTimestamp > localTimestamp && overwrite) {
		return { action: "update", reason: "Cloud mới hơn" };
	}

	// Local mới hơn hoặc bằng → bỏ qua
	return { action: "skip", reason: "Local mới hơn hoặc bằng" };
}
```

---

## 5. Thay đổi code cần thiết

### 5.1 Module mới: `src/storage/sync.ts`

```typescript
// Functions cần implement:
export async function fetchCloudMemories(
	projectSlug: string,
	config: Config
): Promise<MemoryRecord[]>;
export function readLocalMemory(
	filename: string,
	memoryDir: string
): MemoryData | null;
export function writeLocalMemory(
	memory: MemoryRecord,
	memoryDir: string
): string;
export async function syncFromCloud(options: SyncOptions): Promise<SyncResult>;
```

### 5.2 Cập nhật `src/storage/supabase.ts`

Thêm function:

```typescript
export async function getProjectMemories(
	projectSlug: string,
	config: Config
): Promise<MemoryRecord[]>;
export async function getProjectBySlug(
	projectSlug: string,
	config: Config
): Promise<Project | null>;
```

### 5.3 Cập nhật `src/storage/local.ts`

Thêm function:

```typescript
export function readLocalMemory(
	filename: string,
	memoryDir: string
): MemoryData | null;
export function listLocalMemories(memoryDir: string): string[];
```

### 5.4 Cập nhật `index.ts`

- Thêm tool `sync_memorize` vào `ListToolsRequestSchema`.
- Thêm handler cho `sync_memorize` trong `CallToolRequestSchema`.

---

## 6. Biến môi trường

Không cần thêm biến môi trường mới. Sử dụng lại:

- `MEMORIZE_MCP_PROJECT_ROOT`
- `MEMORIZE_MCP_SUPABASE_URL`
- `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY`
- `MEMORIZE_MCP_PROJECT_SLUG`

---

## 7. Error Handling

### 7.1 Supabase không được cấu hình

```typescript
if (!isSupabaseConfigured(config)) {
	return {
		content: [
			{
				type: "text",
				text: "❌ Supabase chưa được cấu hình. Không thể sync từ cloud.",
			},
		],
		isError: true,
	};
}
```

### 7.2 Project không tồn tại

```typescript
const project = await getProjectBySlug(projectSlug, config);
if (!project) {
	return {
		content: [
			{
				type: "text",
				text: `❌ Project '${projectSlug}' không tồn tại trên Supabase.`,
			},
		],
		isError: true,
	};
}
```

### 7.3 Không có memories

```typescript
if (memories.length === 0) {
	return {
		content: [
			{
				type: "text",
				text: `📭 Project '${projectSlug}' chưa có memories nào trên cloud.`,
			},
		],
	};
}
```

---

## 8. Versioning & Migration

- Bump version: `1.1.0` → `1.2.0`
- Không cần migration database (schema v1.1 đủ dùng)
- Backward compatible: `save_memorize` không thay đổi

---

## 9. Roadmap tiếp theo (v1.3+)

- **v1.3**: Tool `list_memorize` - liệt kê memories (local và/hoặc cloud)
- **v1.3**: Tool `search_memorize` - tìm kiếm theo keyword trong content
- **v1.4**: Conflict resolution UI - cho phép user chọn khi có conflict
- **v1.5**: Two-way sync tự động (watch mode)
