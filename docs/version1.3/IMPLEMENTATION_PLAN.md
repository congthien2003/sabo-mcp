# Implementation Plan - v1.3.0

## Mục tiêu

1. Thêm CLI support để users có thể chạy `npx memorize-mcp`
2. Tổ chức resources thành categories: commands, workflows, skills
3. Tạo `/save_memory` command cho AI agent

## Tasks

### ✅ Task 1: Update package.json

- [x] Thêm `bin` field trỏ đến CLI entry point
- [x] Bỏ `private: true`
- [x] Thêm script `cli`
- [x] Bump version lên 1.3.0

### ✅ Task 2: Tạo CLI Structure

- [x] Tạo `src/cli/index.ts` - CLI entry point
- [x] Tạo `src/cli/commands/pull.ts` - Pull command handler
- [x] Implement argument parsing
- [x] Implement resource listing
- [x] Implement pull logic theo categories

### ✅ Task 3: Tạo Workflow Folders

- [x] Tạo `.workflows/commands/`
- [x] Tạo `.workflows/workflows/`
- [x] Tạo `.workflows/skills/`

### ✅ Task 4: Tạo `/save_memory` Command

- [x] Tạo `.workflows/commands/save_memory.md`
- [x] Document syntax và usage
- [x] Document workflow steps

### ✅ Task 5: Tạo Sample Resources

- [x] `.workflows/workflows/auto_save_memory.md`
- [x] `.workflows/skills/code_analysis.md`
- [x] `.workflows/skills/task_planning.md`

### ✅ Task 6: Update workflows.ts

- [x] Thêm category support
- [x] Update `listLocalWorkflows()` để support category
- [x] Update `readLocalWorkflow()` để support category
- [x] Update `writeWorkflowFile()` để support category
- [x] Update `pullWorkflows()` với category logic

### ✅ Task 7: Update types.ts

- [x] Thêm `category` vào `PullWorkflowsOptions`
- [x] Thêm `allCategories` vào `PullWorkflowsOptions`

### ✅ Task 8: Update index.ts

- [x] Bump server version
- [x] Thêm parameters mới cho `pull_workflows` tool

### ✅ Task 9: Documentation

- [x] Update CHANGELOG.md
- [x] Tạo docs/version1.3/overview.md
- [x] Tạo docs/version1.3/IMPLEMENTATION_PLAN.md

## Technical Decisions

### CLI Entry Point

Sử dụng Bun shebang (`#!/usr/bin/env bun`) thay vì compile:

- Đơn giản, không cần build step
- Project đã dùng Bun
- Giữ được TypeScript type safety

### Category Structure

Default pull behavior: chỉ pull `commands` vì:

- Có chứa `/save_memory` - feature chính của version này
- Nhẹ, không pull thừa
- User có thể `--all` nếu cần tất cả

### Resource Format

Dùng Markdown cho tất cả resources:

- Dễ đọc và edit
- AI agents hiểu tốt
- Có thể include code blocks

## Testing

```bash
# Test CLI
bun run cli

# Test pull command
bun run cli pull
bun run cli pull --all
bun run cli pull --commands
bun run cli pull --workflows
bun run cli pull --skills

# Test với target
bun run cli pull --target ./test-project
```
