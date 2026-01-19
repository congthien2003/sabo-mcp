# memorize-mcp v1.2.1 – Pull Workflows Overview

## Tổng quan

Version **1.2.1** giới thiệu tính năng **Pull Workflows** - cho phép đồng bộ folder `.workflows` từ cloud/source về project của user.

## Vấn đề cần giải quyết

1. **Consistency**: Các project khác nhau cần dùng chung workflows (hướng dẫn cho AI agent)
2. **Maintenance**: Khi update workflow, cần apply cho tất cả projects
3. **Onboarding**: Project mới cần được setup workflows nhanh chóng

## Giải pháp

Tool `pull_workflows` cho phép:

- Pull toàn bộ `.workflows` folder về project đích
- Selective pull một file cụ thể
- Overwrite hoặc giữ nguyên file existing

## Cách sử dụng

### 1. Cấu hình environment

```bash
# Required: Thư mục project đích
MEMORIZE_MCP_TARGET_PROJECT_DIR=/path/to/your-project

# Optional: Source type (local, supabase, github)
MEMORIZE_MCP_WORKFLOWS_SOURCE_TYPE=local

# Optional: Source URL (for supabase/github)
MEMORIZE_MCP_WORKFLOWS_SOURCE=https://...
```

### 2. Gọi tool

```javascript
// Pull tất cả workflows
mcp_project.memor_pull_workflows({});

// Pull và overwrite
mcp_project.memor_pull_workflows({
	overwrite: true,
});

// Pull một file cụ thể
mcp_project.memor_pull_workflows({
	filename: "SAVE_MEMORY.md",
});

// Pull về folder cụ thể (override env)
mcp_project.memor_pull_workflows({
	targetDir: "/custom/path/to/project",
});
```

### 3. Kết quả

```
✅ Pull workflows hoàn tất!
📥 Đã tải: 3 files
🔄 Đã cập nhật: 1 file
⏭️ Bỏ qua (đã tồn tại): 2 files
📁 Target: /path/to/your-project/.workflows
```

## Workflow Files

Các workflow files được pull:

| File             | Description                                 |
| ---------------- | ------------------------------------------- |
| `SAVE_MEMORY.md` | Hướng dẫn agent tự động lưu memory sau task |
| `CODE_REVIEW.md` | (Future) Workflow cho code review           |
| `BUG_FIX.md`     | (Future) Workflow cho bug fixing            |

## Use Cases

### Case 1: Setup project mới

```bash
# 1. Clone repo
git clone https://github.com/user/new-project

# 2. Config MCP
export MEMORIZE_MCP_TARGET_PROJECT_DIR=/path/to/new-project

# 3. Pull workflows
# Agent gọi: pull_workflows
```

### Case 2: Update workflows cho nhiều projects

1. Update workflow source (Supabase/GitHub)
2. Mỗi project chạy `pull_workflows` với `overwrite: true`
3. Tất cả projects có workflows mới nhất

### Case 3: Share workflows trong team

1. Team maintain workflows trong central repository
2. Mỗi member pull về local project
3. Consistency across team

## Kiến trúc

```
┌──────────────────┐         ┌──────────────────┐
│  Workflows       │         │  Your Project    │
│  Source          │ ──────> │  .workflows/     │
│  (Cloud/Local)   │  pull   │                  │
└──────────────────┘         └──────────────────┘
```

## So sánh với v1.2.0

| Feature        | v1.2.0 | v1.2.1 |
| -------------- | ------ | ------ |
| save_memorize  | ✅     | ✅     |
| sync_memorize  | ✅     | ✅     |
| pull_workflows | ❌     | ✅     |

## Changelog

### v1.2.1 (Coming Soon)

- **NEW**: Tool `pull_workflows` - pull .workflows folder về project
- **NEW**: Config `MEMORIZE_MCP_TARGET_PROJECT_DIR`
- **NEW**: Config `MEMORIZE_MCP_WORKFLOWS_SOURCE_TYPE`
