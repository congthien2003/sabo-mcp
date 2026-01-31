# memorize-mcp (Memory MCP Server)

## Tóm tắt nhanh

- MCP server đơn giản dùng để lưu trữ bản tóm tắt nội dung công việc ra file JSON trên máy local.
- Cung cấp 3 tools:
  - `save_memorize`: Lưu memory mới (local + cloud sync)
  - `sync_memorize`: Đồng bộ memories từ cloud về local
  - `pull_workflows`: Pull workflows instructions về project (v1.2.1+)
- Thư mục lưu trữ mặc định: `./.memories/data` (có thể thay đổi qua biến môi trường `MEMORIZE_MCP_PROJECT_ROOT`).
- **V1.1+**: Hỗ trợ sync lên Supabase Cloud để chia sẻ memory giữa nhiều máy.
- **V1.2+**: Hỗ trợ sync memories từ cloud về local.
- **V1.2.1+**: Pull workflows (.workflows folder) về project để hướng dẫn AI agent.
- **V1.3+**: CLI support với `npx memorize-mcp` để pull prompts và skills.
- **V1.3.1+**: Pull skills theo nhóm (--basic, --frontend, --all).

**Phiên bản hiện tại**: `1.3.1` – xem chi tiết trong `CHANGELOG.md`.

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
        "MEMORIZE_MCP_PROJECT_ROOT": "C:/path/to/your/memories",
      },
    },
  },
}
```

Cấu hình thật có thể khác tuỳ client MCP bạn đang dùng, nhưng ý tưởng chung là:

- `command`: lệnh để chạy (ở đây là `bun`).
- `args`: tham số để chạy file `index.ts`.
- `env`: thiết lập `MEMORIZE_MCP_PROJECT_ROOT` nếu muốn thay đổi thư mục lưu.

## Available Tools

Server cung cấp 3 tools:

---

## Tool 1: `save_memorize` (v1.0+)

### Mô tả

- **Chức năng**: Lưu bản tóm tắt nội dung công việc vào file local dưới dạng JSON (và sync lên Supabase nếu được cấu hình).

### Input schema

````json
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
    },
    "projectSlug": {
      "type": "string",
      "description": "(Optional, v1.1+) Slug của project để sync lên Supabase"

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
````

4. Nếu thành công, server trả về một message dạng text, ví dụ:

```text
✅ Đã lưu tóm tắt vào: C:/path/to/your/memories/summary_v1.json
☁️ Cloud sync: Thành công
```

Nếu có lỗi ghi file, server trả về nội dung text với mô tả lỗi và `isError: true`.

---

## Tool 2: `sync_memorize` (v1.2+)

### Mô tả

- **Chức năng**: Đồng bộ memories từ Supabase Cloud về local storage. Chỉ cập nhật file nào có timestamp mới hơn trên cloud.

### Input schema

```json
{
  "type": "object",
  "properties": {
    "projectSlug": {
      "type": "string",
      "description": "(Optional) Slug của project để sync. Nếu không có sẽ dùng MEMORIZE_MCP_PROJECT_SLUG từ env."
    },
    "overwrite": {
      "type": "boolean",
      "description": "(Optional) Bắt buộc ghi đè tất cả file local, bỏ qua kiểm tra timestamp. Mặc định: false"
    },
    "filename": {
      "type": "string",
      "description": "(Optional) Chỉ sync file cụ thể thay vì tất cả memories"
    }
  },
  "required": []
}
```

### Quy trình hoạt động

1. Client gọi tool `sync_memorize`.
2. Server kiểm tra Supabase configuration.
3. Fetch tất cả memories từ cloud cho project (hoặc chỉ 1 file nếu có `filename`).
4. Với mỗi memory:
   - Nếu file local không tồn tại → **Create**
   - Nếu `overwrite=true` → **Update** (ghi đè)
   - Nếu cloud timestamp > local timestamp → **Update**
   - Ngược lại → **Skip**
5. Trả về kết quả với statistics:

```text
✅ Sync completed: 3 created, 2 updated, 5 skipped

📊 Statistics:
  ➕ Created: 3
  🔄 Updated: 2
  ⏭️  Skipped: 5
```

---

## Tool 3: `pull_workflows` (v1.2.1+)

### Mô tả

- **Chức năng**: Pull folder `.workflows` từ source về folder project của user. Workflows chứa hướng dẫn cho AI agent về cách thực hiện các task.

### Input schema

```json
{
  "type": "object",
  "properties": {
    "targetDir": {
      "type": "string",
      "description": "(Optional) Thư mục project đích. Nếu không có sẽ dùng MEMORIZE_MCP_TARGET_PROJECT_DIR từ env."
    },
    "overwrite": {
      "type": "boolean",
      "description": "(Optional) Ghi đè file nếu đã tồn tại. Mặc định: false"
    },
    "filename": {
      "type": "string",
      "description": "(Optional) Chỉ pull một workflow file cụ thể (vd: 'SAVE_MEMORY.md')"
    }
  },
  "required": []
}
```

### Environment Variables

```bash
# Required: Target project directory
export MEMORIZE_MCP_TARGET_PROJECT_DIR="/path/to/your-project"

# Optional: Source type (default: local)
export MEMORIZE_MCP_WORKFLOWS_SOURCE_TYPE="local"  # or "supabase", "github"

# Optional: Custom source URL
export MEMORIZE_MCP_WORKFLOWS_SOURCE="https://..."
```

### Quy trình hoạt động

1. Client gọi tool `pull_workflows`.
2. Server xác định source (local/supabase/github) và target directory.
3. List tất cả workflow files từ source (hoặc chỉ 1 file nếu có `filename`).
4. Với mỗi workflow file:
   - Nếu file local không tồn tại → **Create**
   - Nếu `overwrite=true` → **Update** (ghi đè)
   - Ngược lại → **Skip**
5. Trả về kết quả:

```text
✅ Pull workflows hoàn tất!
📥 Đã tải: 3 files
🔄 Đã cập nhật: 1 file
⏭️ Bỏ qua (đã tồn tại): 2 files
📁 Target: /path/to/project/.workflows
```

### Use Cases

- **New project setup**: Pull workflows về project mới để agent có hướng dẫn
- **Update workflows**: Update workflows khi có version mới từ source
- **Share workflows**: Maintain consistency giữa các projects

Xem thêm: `.workflows/SAVE_MEMORY.md` - Workflow hướng dẫn agent tự động save memory sau task.

---

## CLI Usage (v1.3+)

### Cài đặt và sử dụng

```bash
# Chạy CLI trực tiếp (không cần cài đặt global)
npx memorize-mcp

# Hoặc cài đặt global
npm install -g memorize-mcp
memorize-mcp
```

### Commands

```bash
# Hiển thị help
npx memorize-mcp help

# Pull prompts (default)
npx memorize-mcp pull

# Pull tất cả resources (prompts + all skills)
npx memorize-mcp pull --all
```

### Skills Options (v1.3.1+)

```bash
# Pull tất cả skills
npx memorize-mcp pull --skills --all

# Pull basic skills (brainstorming, executing-plans, writing-plan)
npx memorize-mcp pull --skills --basic

# Pull frontend skills (react-best-practices, web-design-guidelines)
npx memorize-mcp pull --skills --frontend

# Pull với overwrite (ghi đè files hiện có)
npx memorize-mcp pull --skills --basic --overwrite

# Chỉ định target directory
npx memorize-mcp pull --skills --all --target ./my-project
```

### Resources được pull

| Category          | Directory            | Description                                  |
| ----------------- | -------------------- | -------------------------------------------- |
| Prompts           | `.github/prompts/`   | AI agent prompts (e.g., `/save-memory`)      |
| Skills - Basic    | `.skills/`           | brainstorming, executing-plans, writing-plan |
| Skills - Frontend | `.skills/front-end/` | react-best-practices, web-design-guidelines  |

### Skill Groups

| Group        | Skills                                                          |
| ------------ | --------------------------------------------------------------- |
| `--basic`    | brainstorming, executing-plans, writing-plan                    |
| `--frontend` | front-end/react-best-practices, front-end/web-design-guidelines |
| `--all`      | Tất cả skills có sẵn                                            |

---

## Skills System

### Giới thiệu

Từ phiên bản 1.3, memorize-mcp tổ chức các best practices, guidelines và workflows thành "skills" - các module tái sử dụng được mà AI agents có thể tham khảo khi thực hiện tasks.

### Cấu trúc Skills

Mỗi skill được lưu trong thư mục riêng theo pattern:

```
.skills/
  brainstorming/
    SKILL.md
  executing-plans/
    SKILL.md
  writing-plan/
    SKILL.md
  front-end/
    react-best-practices/
      SKILL.md
    web-design-guidelines/
      SKILL.md
```

### Skills có sẵn

#### Basic Skills (`--basic`)

- **brainstorming** - Kỹ năng brainstorm ý tưởng
- **executing-plans** - Kỹ năng thực thi kế hoạch
- **writing-plan** - Kỹ năng viết kế hoạch

#### Frontend Skills (`--frontend`)

- **react-best-practices** - React/Next.js performance best practices
- **web-design-guidelines** - Web design guidelines

### Pull Skills

```bash
# Pull basic skills
npx memorize-mcp pull --skills --basic

# Pull frontend skills
npx memorize-mcp pull --skills --frontend

# Pull all skills
npx memorize-mcp pull --skills --all
```

### Tạo Skill mới

Xem hướng dẫn chi tiết: [How to Create a Skill](./docs/resources/create-skill.md)

Quick steps:

1. Tạo thư mục mới: `.skills/{your-skill-name}/`
2. Tạo file `SKILL.md` với frontmatter:

```markdown
---
name: your-skill-name
description: Clear description with trigger keywords
license: MIT
metadata:
  author: your-name
  version: "1.0.0"
  category: general
---

# Skill Title

[Content...]
```

3. Follow template structure trong [create-skill.md](./docs/resources/create-skill.md)
4. Test skill với workflows

---

## Logging

Server in log ra console mỗi khi:

- Nhận request gọi tool (`Received tool request: save_memorize` hoặc `sync_memorize`).
- Bắt đầu xử lý tool với thông tin parameters.
- Sync process: log từng file được created/updated/skipped.
- Ghi file thành công hoặc báo lỗi.

Log này hữu ích để debug khi tích hợp với client MCP.

## Tóm tắt (bản rút gọn)

- Đây là một MCP server nhỏ, chạy bằng Bun, dùng stdio.
- Server cung cấp 3 tools:
  - `save_memorize`: Lưu memory mới (local + cloud)
  - `sync_memorize`: Đồng bộ memories từ cloud về local
  - `pull_workflows`: Pull workflows về project để hướng dẫn agent (v1.2.1+)
- Thư mục lưu được cấu hình bởi `MEMORIZE_MCP_PROJECT_ROOT`, mặc định `.memories/data`.
- Phù hợp để dùng như "bộ nhớ ngoài" cho các phiên làm việc với AI/LLM.
- **V1.1+**: Hỗ trợ sync lên Supabase Cloud để chia sẻ memory giữa nhiều máy.
- **V1.2+**: Hỗ trợ sync memories từ Supabase Cloud về local storage.
- **V1.2.1+**: Pull workflows instructions về project.
- **V1.3+**: CLI support với `npx memorize-mcp`.
- **V1.3.1+**: Pull skills theo nhóm (--basic, --frontend, --all).

---

## Cloud Sync với Supabase (v1.1+)

### Giới thiệu

Từ phiên bản 1.1, memorize-mcp hỗ trợ đồng bộ memory lên Supabase Cloud. Điều này cho phép:

- Chia sẻ memory giữa nhiều máy tính.
- Backup tự động lên cloud.
- Query và visualize memory từ Supabase dashboard.

### Setup Supabase

1. **Tạo Supabase project** tại [supabase.com](https://supabase.com)

2. **Chạy migration SQL** từ file `docs/version1.1/migrations/001_initial_schema.sql`:
   - Vào Supabase Dashboard → SQL Editor
   - Copy nội dung file SQL và chạy
   - Kiểm tra 2 bảng `projects` và `memories` đã được tạo

3. **Lấy credentials**:
   - URL: Settings → API → Project URL
   - Service Role Key: Settings → API → `service_role` key (secret)

4. **Cấu hình environment variables**:

```bash
# Local testing
export MEMORIZE_MCP_SUPABASE_URL="https://xxx.supabase.co"
export MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export MEMORIZE_MCP_PROJECT_SLUG="my-project"
```

Hoặc trong MCP client config (ví dụ Claude Desktop):

```jsonc
{
  "mcpServers": {
    "memorize-mcp": {
      "command": "bun",
      "args": ["run", "index.ts"],
      "env": {
        "MEMORIZE_MCP_PROJECT_ROOT": "C:/memories",
        "MEMORIZE_MCP_SUPABASE_URL": "https://xxx.supabase.co",
        "MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY": "your-key",
        "MEMORIZE_MCP_PROJECT_SLUG": "my-project",
      },
    },
  },
}
```

### Cách hoạt động

- Mỗi lần gọi `save_memorize`:
  1. Luôn lưu file JSON local trước (offline-first).
  2. Nếu Supabase được cấu hình → sync thêm lên cloud.
  3. Nếu cloud sync thất bại → local vẫn thành công (graceful degradation).

- Response message sẽ báo status của cả local và cloud:
  ```
  ✅ Đã lưu tóm tắt vào: /path/to/file.json
  ☁️ Cloud sync: Thành công
  ```

### Sync giữa nhiều máy

- Tất cả máy cần cùng:
  - `MEMORIZE_MCP_SUPABASE_URL`
  - `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY`
  - `MEMORIZE_MCP_PROJECT_SLUG` (để ghi vào cùng project)

- Mỗi memory được lưu với `created_from` (hostname@username) để biết nguồn gốc.

Xem thêm chi tiết tại: `docs/version1.1/overview.md`

---

## Versioning & Changelog

- Dự án sử dụng Semantic Versioning (`MAJOR.MINOR.PATCH`).
- Mọi thay đổi quan trọng sẽ được cập nhật trong file `CHANGELOG.md`.

--- Plan tiếp theo

- Hỗ trợ cursor IDE sử dụng command
