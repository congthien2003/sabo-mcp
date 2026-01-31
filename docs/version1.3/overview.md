# Memorize-MCP v1.3.0 - CLI & Commands

## Overview

Version 1.3.0 giới thiệu CLI support và hệ thống resource categories, cho phép users dễ dàng pull resources qua terminal và sử dụng slash commands trong AI chat.

## Tính năng mới

### 1. CLI Support

Chạy trực tiếp từ terminal:

```bash
# Hiển thị help và available resources
npx memorize-mcp

# Pull default resources (commands)
npx memorize-mcp pull

# Pull tất cả categories
npx memorize-mcp pull --all

# Pull category cụ thể
npx memorize-mcp pull --commands
npx memorize-mcp pull --workflows
npx memorize-mcp pull --skills

# Các options
npx memorize-mcp pull --target ./my-project
npx memorize-mcp pull --overwrite
```

### 2. Resource Categories

Tổ chức resources thành 3 categories:

```
.workflows/
├── commands/       # AI slash commands
│   └── save_memory.md
├── workflows/      # Automated workflows
│   └── auto_save_memory.md
└── skills/         # Reusable AI skills
    ├── code_analysis.md
    └── task_planning.md
```

### 3. `/save_memory` Command

Slash command cho AI agent tự động save memory sau khi hoàn thành task:

```
/save_memory Tạo authentication middleware với JWT
```

AI agent sẽ:

1. Thực thi task như bình thường
2. Tự động gọi `save_memorize` tool khi hoàn thành
3. Lưu structured summary vào memory system

## Quick Start

```bash
# 1. Pull commands vào project của bạn
npx memorize-mcp pull

# 2. Sử dụng trong AI chat
/save_memory <mô tả task của bạn>
```

## File Structure

```
memorize-mcp/
├── src/
│   ├── cli/
│   │   ├── index.ts           # CLI entry point
│   │   └── commands/
│   │       └── pull.ts        # Pull command handler
│   └── storage/
│       └── workflows.ts       # Updated with category support
├── .workflows/
│   ├── commands/
│   │   └── save_memory.md     # /save_memory command definition
│   ├── workflows/
│   │   └── auto_save_memory.md
│   └── skills/
│       ├── code_analysis.md
│       └── task_planning.md
└── package.json               # Updated with bin field
```

## Environment Variables

Không có env variables mới. Các variables hiện tại vẫn hoạt động:

- `MEMORIZE_MCP_TARGET_PROJECT_DIR` - Target directory cho pull
- `MEMORIZE_MCP_PROJECT_SLUG` - Project slug cho cloud sync
- `MEMORIZE_MCP_SUPABASE_URL` - Supabase URL
- `MEMORIZE_MCP_SUPABASE_SERVICE_ROLE_KEY` - Supabase key

## Backward Compatibility

- MCP server vẫn hoạt động như cũ
- Tool `pull_workflows` được mở rộng với parameters mới
- Default behavior: pull commands (có `/save_memory`)
