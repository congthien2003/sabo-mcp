# Changelog

Tất cả thay đổi quan trọng của dự án này sẽ được ghi lại trong file này.

Định dạng dựa theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
và version tuân theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-01-31

### Added

- **Skills Pull via CLI**: Mở rộng CLI với khả năng pull skills theo nhóm:
  - `npx memorize-mcp pull --skills --all` - Pull tất cả skills
  - `npx memorize-mcp pull --skills --basic` - Pull basic skills (brainstorming, executing-plans, writing-plan)
  - `npx memorize-mcp pull --skills --frontend` - Pull frontend skills (react-best-practices, web-design-guidelines)
- **Skills Structure**: Tổ chức skills theo cấu trúc mới `{skillName}/SKILL.md`:
  - `.skills/brainstorming/SKILL.md`
  - `.skills/executing-plans/SKILL.md`
  - `.skills/writing-plan/SKILL.md`
  - `.skills/front-end/react-best-practices/SKILL.md`
  - `.skills/front-end/web-design-guidelines/SKILL.md`
- **Skill Template**: Hướng dẫn tạo skill mới tại `docs/resources/create-skill.md`

### Changed

- **CLI Help**: Cập nhật help text với skills options mới
- **Target Directory**: Skills được pull vào `.skills/` thay vì `.workflows/skills/`
- Version bump: 1.3.1 → 1.3.2

### Migration Guide

Nếu bạn đang dùng v1.3.0 hoặc v1.3.1:

1. Skills giờ được pull vào `.skills/` (không còn `.workflows/skills/`)
2. Chạy `npx memorize-mcp pull --skills --basic` để pull basic skills
3. Hoặc `npx memorize-mcp pull --all` để pull tất cả (prompts + skills)

---

## [1.3.1] - 2026-01-31

### Changed

- **Homepage**: Cập nhật landing page URL trong package.json (`https://memorize-mcp.vercel.app`)
- Version bump: 1.3.0 → 1.3.1

---

## [1.3.0] - 2026-01-31

### Added

- **CLI Support**: Chạy `npx memorize-mcp` hoặc `bun run cli` để sử dụng CLI.
  - `npx memorize-mcp` - Hiển thị banner và available resources
  - `npx memorize-mcp pull` - Pull resources (default: prompts)
  - `npx memorize-mcp pull --all` - Pull tất cả categories (prompts + skills)
  - `npx memorize-mcp pull --prompts` - Pull prompts only (includes /save-memory)
  - `npx memorize-mcp pull --skills` - Pull skills only
  - `npx memorize-mcp pull --target ./path` - Chỉ định target directory
  - `npx memorize-mcp pull --overwrite` - Ghi đè files hiện có

- **Resource Categories**: Tổ chức resources thành 2 categories:
  - `.github/prompts/` - AI agent prompts (e.g., `/save-memory`)
  - `.workflows/skills/` - Reusable AI agent skills

- **`/save-memory` Prompt**: Prompt file cho AI agent
  - Syntax: `/save-memory <Task description>`
  - AI agent thực thi task rồi tự động save memory
  - File: `.github/prompts/save-memory.prompt.md`

- CLI entry point: `src/cli/index.ts`
- Pull command: `src/cli/commands/pull.ts`
- Resources được pull:
  - `.github/prompts/save-memory.prompt.md`
  - `.workflows/skills/code_analysis.md`
  - `.workflows/skills/task_planning.md`

### Changed

- **package.json**:
  - Thêm `bin` field cho CLI support
  - Bỏ `private: true` để có thể publish
  - Thêm script `cli` để chạy CLI
  - Version bump: 1.2.1 → 1.3.0

- Server version bump: 1.2.1 → 1.3.0

### Migration Guide

1. Chạy `npx memorize-mcp pull` để pull `/save-memory` prompt
2. Hoặc chạy `npx memorize-mcp pull --all` để pull tất cả resources (prompts + skills)
3. Check `.github/prompts/save-memory.prompt.md` để xem cách sử dụng

## [1.2.1] - 2026-01-19

### Added

- **Pull Workflows**: Tool mới `pull_workflows` để pull folder `.workflows` về project của user.
- Module `src/storage/workflows.ts` với functions:
  - `pullWorkflows()`: Main function để pull workflows từ source.
  - `listLocalWorkflows()`: List workflow files từ local source.
  - `readLocalWorkflow()`: Đọc workflow content từ source.
  - `writeWorkflowFile()`: Ghi workflow vào target project.
- Workflow configurations trong `src/config.ts`:
  - `workflows.sourceType`: Loại source (local/supabase/github).
  - `workflows.sourceUrl`: URL của custom source (optional).
  - `workflows.targetProjectDir`: Thư mục project đích.
- Environment variables mới:
  - `MEMORIZE_MCP_WORKFLOWS_SOURCE_TYPE`: Loại source (mặc định: "local").
  - `MEMORIZE_MCP_WORKFLOWS_SOURCE`: Custom source URL (optional).
  - `MEMORIZE_MCP_TARGET_PROJECT_DIR`: Thư mục project đích (required cho pull_workflows).
- TypeScript types mới: `PullWorkflowsOptions`, `PullWorkflowsResult`, `PullWorkflowsStats`.
- Documentation:
  - `docs/version1.2.1/IMPLEMENTATION_PLAN.md`: Chi tiết implementation plan.
  - `docs/version1.2.1/overview.md`: Tổng quan tính năng v1.2.1.

### Changed

- Server version bump: 1.2.0 → 1.2.1.
- Startup log hiển thị thêm workflows configuration status.
- README.md updated với tool `pull_workflows` documentation.

### Fixed

- N/A

## [1.2.0] - 2026-01-05

### Added

- **Sync from Cloud to Local**: Tool `sync_memorize` để đồng bộ memories từ Supabase về máy local.
- Các Supabase query functions:
  - `getProjectBySlug()`: Lấy thông tin project theo slug.
  - `getProjectMemories()`: Lấy tất cả memories của project.
  - `getMemoryByFilename()`: Lấy memory cụ thể theo filename.
- Local storage read functions:
  - `readLocalMemory()`: Đọc file JSON local.
  - `listLocalMemories()`: List tất cả file JSON trong thư mục.
  - `localMemoryExists()`: Kiểm tra file có tồn tại không.
- Module `src/storage/sync.ts` với logic:
  - `decideSyncAction()`: Quyết định create/update/skip dựa trên timestamp.
  - `syncFromCloud()`: Orchestrator cho quá trình sync từ cloud.
- Các TypeScript types mới: `SyncOptions`, `SyncResult`, `SyncDecision`, `SyncStats`.

### Changed

- Tool `sync_memorize` hỗ trợ các options:
  - `projectSlug` (optional): Chỉ định project, mặc định lấy từ env.
  - `overwrite` (optional): Force overwrite tất cả file local.
  - `filename` (optional): Chỉ sync 1 file cụ thể.
- Server version bump từ 1.1 → 1.2.

### Fixed

- N/A

## [1.1.0] - 2026-01-05

### Added

- **Supabase Cloud backend** cho khả năng sync memory qua nhiều máy.
- Optional field `projectSlug` trong tool `save_memorize` để chỉ định project khi sync.
- Module `src/storage/` với cấu trúc rõ ràng:
  - `local.ts`: xử lý lưu file JSON local.
  - `supabase.ts`: kết nối và sync lên Supabase.
  - `index.ts`: orchestrator điều phối giữa local và cloud.
- Module `src/config.ts` để quản lý environment variables.
- Các biến môi trường mới:
  - `MEMORIZE_MCP_SUPABASE_URL`
  - `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY`
  - `MEMORIZE_MCP_PROJECT_SLUG`
- Database schema cho Supabase (bảng `projects` và `memories`).
- SQL migration file tại `docs/version1.1/migrations/001_initial_schema.sql`.
- Documentation chi tiết trong `docs/version1.1/overview.md` và `IMPLEMENTATION_PLAN.md`.

### Changed

- Tool `save_memorize` giờ vừa lưu local **vừa** sync cloud (nếu cấu hình Supabase).
- Response message của tool bao gồm cả thông tin cloud sync status.
- Server name đổi từ `memory-server` thành `memorize-mcp-server`.
- Cấu trúc code được refactor để dễ maintain và mở rộng.

### Fixed

- Graceful degradation: nếu Supabase lỗi, local storage vẫn thành công.
- Logging chi tiết hơn cho từng bước xử lý.

## [1.0.0] - 2026-01-05

### Added

- MVP `memorize-mcp` MCP server.
- Tool `save_memorize` để lưu tóm tắt phiên làm việc ra file JSON local.
- Cấu hình thư mục lưu bằng biến môi trường `MEMORIZE_MCP_PROJECT_ROOT` (mặc định `./.memories/data`).
- README mô tả cách chạy bằng Bun và cách tích hợp với MCP client.
