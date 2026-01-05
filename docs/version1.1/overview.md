# memorize-mcp v1.1 – Supabase Cloud Sync Overview

## 1. Mục tiêu v1.1

Phiên bản **1.1** mở rộng khả năng của memorize-mcp theo hướng:

- Vẫn giữ **offline-first**: luôn lưu file JSON local giống như v1.0.
- Thêm khả năng **đồng bộ (sync) memory lên Supabase Cloud** để dùng chung giữa nhiều máy.
- Không phá vỡ client cũ: input schema của tool `save_memorize` chỉ được **mở rộng thêm field optional**, không thay đổi các field bắt buộc.

Kết quả: bạn có thể dùng MCP server này trên nhiều máy (VD: nhiều VS Code, nhiều Claude Desktop) nhưng vẫn chia sẻ chung một nguồn memory tập trung trên Supabase, đồng thời vẫn có backup local.

---

## 2. Kiến trúc tổng thể

### 2.1 Thành phần chính

- **Local storage**

  - Cơ chế hiện tại: ghi file JSON vào thư mục `MEMORY_DIR` (mặc định `./.memories/data` hoặc cấu hình qua `MEMORIZE_MCP_PROJECT_ROOT`).
  - Giữ nguyên ở v1.1, không thay đổi.

- **Cloud storage (Supabase)**

  - Thêm một tầng lưu trữ mới trên Supabase.
  - Mỗi memory sẽ được lưu thành một **record trong bảng `memories`**, liên kết với một **project** trong bảng `projects`.

- **Handler `save_memorize`**
  - Bước 1: luôn lưu local (đảm bảo không mất dữ liệu nếu mất kết nối mạng).
  - Bước 2: nếu config Supabase đầy đủ, đồng bộ thêm bản ghi lên Supabase.
  - Nếu Supabase lỗi → chỉ log lỗi, không ném exception ra ngoài (tool vẫn trả về thành công nếu lưu local ok).

### 2.2 Luồng xử lý `save_memorize` v1.1

1. Nhận request từ MCP client với các field: `filename`, `topic`, `content`, (optional) `projectSlug`.
2. Xác định `MEMORY_DIR` từ `MEMORIZE_MCP_PROJECT_ROOT` (hoặc mặc định).
3. Ghi file JSON local:
   - Tên file: `filename`.
   - Nội dung: `{ topic, timestamp, content, createdAt }`.
4. Kiểm tra config Supabase:
   - Nếu thiếu `MEMORIZE_MCP_SUPABASE_URL` **hoặc** `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY` → dừng ở bước local.
   - Nếu đủ → tiếp tục.
5. Xác định project trên Supabase:
   - Lấy `projectSlug` từ input nếu có.
   - Nếu không có → dùng `MEMORIZE_MCP_PROJECT_SLUG` từ env.
   - Nếu vẫn không có → có thể dùng slug mặc định (ví dụ `default`) hoặc bỏ qua bước cloud (tuỳ bạn cấu hình thực tế).
   - Gọi hàm `ensureProject(projectSlug)` để tìm hoặc tạo record trong bảng `projects`.
6. Lưu memory lên Supabase:
   - Ghi record vào `memories` với `project_id`, `filename`, `topic`, `content`, `timestamp`.
7. Trả kết quả cho MCP client:
   - Thông thường: message thành công, có thể mở rộng message để báo thêm: đã lưu local + đã/không thể sync cloud.

---

## 3. Thiết kế database trên Supabase

### 3.1 Bảng `projects`

Mục đích: gom nhóm các memory theo từng project/repo/workspace.

Trường đề xuất:

- `id` (uuid, primary key, default `gen_random_uuid()`)
- `name` (text) – tên hiển thị (tuỳ ý)
- `slug` (text, unique) – định danh logic, ví dụ `memorize-mcp`, `personal-notes`.
- `created_at` (timestamptz, default `now()`)

### 3.2 Bảng `memories`

Mục đích: lưu từng bản ghi memory tương ứng mỗi lần gọi `save_memorize`.

Trường đề xuất:

- `id` (uuid, primary key, default `gen_random_uuid()`)
- `project_id` (uuid, fk → `projects.id`, on delete cascade)
- `filename` (text) – trùng với tên file local (vd: `summary_v1.json`)
- `topic` (text)
- `content` (text)
- `timestamp` (timestamptz) – thời điểm logic, ISO UTC
- `created_at` (timestamptz, default `now()`)
- `created_from` (text, nullable) – có thể lưu tên máy hoặc user

Index/constraint gợi ý:

- Index trên `project_id` để query nhanh theo project.
- Có thể thêm unique index `(project_id, filename)` nếu muốn mỗi file chỉ có một bản (ghi đè theo filename).

---

## 4. Cấu hình Supabase cho memorize-mcp

### 4.1 Biến môi trường mới

- `MEMORIZE_MCP_SUPABASE_URL`
  - URL project Supabase (ví dụ `https://xxx.supabase.co`).
- `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY`
  - Service role key từ Supabase, chỉ dùng server-side.
  - Không bao giờ đưa key này vào client hoặc để lộ cho LLM.
- `MEMORIZE_MCP_PROJECT_SLUG`
  - Định danh project logic cho workspace hiện tại.
  - Ví dụ mỗi repo dùng một slug: `my-app`, `blog`, `research-notes`.

### 4.2 Cấu hình mẫu (Claude Desktop / MCP client)

Ví dụ (mang tính minh hoạ) cấu hình MCP server với env Supabase:

```jsonc
{
	"mcpServers": {
		"memorize-mcp": {
			"command": "bun",
			"args": ["run", "index.ts"],
			"env": {
				"MEMORIZE_MCP_PROJECT_ROOT": "C:/memories/my-app",
				"MEMORIZE_MCP_SUPABASE_URL": "https://YOUR-PROJECT.supabase.co",
				"MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY",
				"MEMORIZE_MCP_PROJECT_SLUG": "my-app"
			}
		}
	}
}
```

---

## 5. Thay đổi tool `save_memorize` ở v1.1

### 5.1 Schema v1.0

- `filename` (string, required)
- `topic` (string, required)
- `content` (string, required)

### 5.2 Mở rộng v1.1 (không breaking)

Bổ sung field **optional**:

- `projectSlug?: string`
  - Cho phép client truyền trực tiếp slug cho từng call.
  - Nếu không gửi, server dùng `MEMORIZE_MCP_PROJECT_SLUG` từ env.

Có thể chuẩn bị thêm:

- `tags?: string[]` (option cho tương lai, chưa bắt buộc).

### 5.3 Logic lựa chọn project

1. Nếu request có `projectSlug` → dùng slug đó.
2. Nếu không có, lấy từ env `MEMORIZE_MCP_PROJECT_SLUG`.
3. Nếu vẫn không có:
   - Tuỳ cấu hình: dùng slug mặc định (vd: `default`) hoặc bỏ qua bước sync Supabase.

---

## 6. Cấu trúc code đề xuất

Để code rõ ràng và dễ bảo trì, v1.1 nên tách riêng layer storage:

- `src/storage/local.ts`

  - `saveLocalMemory({ filename, topic, content, timestamp })`
  - Chứa toàn bộ logic ghi file JSON local.

- `src/storage/supabase.ts`

  - Khởi tạo Supabase client bằng `@supabase/supabase-js` dựa trên env.
  - `ensureProject({ projectSlug })` → tìm hoặc tạo record trong `projects`.
  - `saveSupabaseMemory({ projectId, filename, topic, content, timestamp, createdFrom })`.

- `src/storage/index.ts`

  - `saveMemory(args)`:
    - Luôn gọi `saveLocalMemory`.
    - Nếu env Supabase hợp lệ → gọi `saveSupabaseMemory`.
    - Log lỗi nếu Supabase fail, nhưng không throw.

- `index.ts`
  - Handler `save_memorize`:
    - Parse input từ MCP.
    - Tính `timestamp` (ISO string).
    - Chuyển các tham số cần thiết sang `saveMemory`.

---

## 7. Hành vi trên nhiều máy

- Mỗi máy có thể trỏ tới thư mục LOCAL khác nhau (`MEMORIZE_MCP_PROJECT_ROOT` khác nhau).
- Chỉ cần cấu hình chung:
  - `MEMORIZE_MCP_SUPABASE_URL`
  - `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY`
  - `MEMORIZE_MCP_PROJECT_SLUG`
- Khi đó:
  - Mọi lần gọi `save_memorize` trên các máy đều ghi vào cùng một `project` trên Supabase.
  - Dữ liệu được tập trung ở bảng `memories`, giúp dễ query/visualize/backup.

---

## 8. Versioning & tiếp theo

- V1.1 dự kiến bump version từ `1.0.0` lên `1.1.0` trong `package.json` và `CHANGELOG.md`.
- CHANGELOG entry cho 1.1 nên gồm:
  - **Added**: Supabase Cloud backend, env mới, optional `projectSlug` trong tool.
  - **Changed**: Hành vi `save_memorize` giờ gồm 2 bước local + (optional) cloud.

Các bước tiếp theo (v1.2+ có thể làm):

- Thêm tool đọc/search memory từ Supabase (ví dụ `list_memorize`, `search_memorize`).
- Thêm filter theo `topic`, `tags`, `date range`.
- Thử nghiệm giao diện dashboard (vd: trên Supabase hoặc một UI nhỏ) để xem/duyệt memory.
