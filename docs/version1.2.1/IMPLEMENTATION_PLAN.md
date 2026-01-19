# memorize-mcp v1.2.1 – Implementation Plan

## 1. Mục tiêu v1.2.1

Phiên bản **1.2.1** bổ sung tính năng **Pull Workflows**:

- Tool mới `pull_workflows`: Kéo folder `.workflows` từ Cloud/Source về folder project của user
- Giúp đồng bộ workflows (hướng dẫn cho AI agent) về project hiện tại
- User có thể share workflows giữa các project khác nhau

**Kết quả**: Agent có thể tự động pull các workflow instructions về project, giúp maintain consistency trong cách làm việc giữa các project.

---

## 2. Environment Variables

### 2.1 Biến mới cần thêm

| Variable                          | Description                                 | Required     | Default          |
| --------------------------------- | ------------------------------------------- | ------------ | ---------------- |
| `MEMORIZE_MCP_WORKFLOWS_SOURCE`   | URL hoặc path của source workflows          | Optional     | Supabase storage |
| `MEMORIZE_MCP_TARGET_PROJECT_DIR` | Thư mục project đích để copy .workflows vào | **Required** | -                |

### 2.2 Config update

```typescript
// src/config.ts
export interface Config {
	// ... existing fields

	// v1.2.1: Workflows configuration
	workflows: {
		sourceUrl?: string; // Cloud source URL
		targetProjectDir?: string; // Target project directory
	};
}
```

---

## 3. Use Cases

### 3.1 Pull workflows về project mới

1. User setup project mới, cấu hình `MEMORIZE_MCP_TARGET_PROJECT_DIR=/path/to/my-project`
2. Gọi tool `pull_workflows`
3. Server copy toàn bộ `.workflows/*` từ cloud/source về `/path/to/my-project/.workflows/`
4. Agent có thể đọc và follow các workflows

### 3.2 Update workflows đã có

1. User đã có `.workflows` trong project
2. Gọi `pull_workflows` với `overwrite: true`
3. Server ghi đè các file cũ bằng version mới từ cloud

### 3.3 Selective pull

- Pull chỉ một workflow file cụ thể theo `filename`
- Giữ nguyên các file local khác

---

## 4. Thiết kế Tool `pull_workflows`

### 4.1 Tool Schema

```json
{
	"name": "pull_workflows",
	"description": "Pull folder .workflows từ cloud về folder project đã cấu hình trong env",
	"inputSchema": {
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
			},
			"projectSlug": {
				"type": "string",
				"description": "(Optional) Project slug để xác định source workflows. Mặc định dùng từ env."
			}
		},
		"required": []
	}
}
```

### 4.2 Response Format

```json
{
	"content": [
		{
			"type": "text",
			"text": "✅ Pull workflows hoàn tất!\n📥 Đã tải: 3 files\n🔄 Đã cập nhật: 1 file\n⏭️ Bỏ qua (đã tồn tại): 2 files\n📁 Target: /path/to/my-project/.workflows"
		}
	]
}
```

---

## 5. Kiến trúc & Flow

### 5.1 Luồng xử lý `pull_workflows`

```
┌─────────────────────────────────────────────────────────────┐
│                     pull_workflows                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Validate: targetDir phải được cấu hình                   │
│ 2. Xác định source (Supabase hoặc local source)             │
│ 3. Fetch danh sách workflow files từ source                 │
│ 4. Với mỗi workflow file:                                   │
│    a. Kiểm tra file đích tồn tại?                           │
│    b. Nếu tồn tại và overwrite=false → skip                 │
│    c. Nếu không tồn tại hoặc overwrite=true → copy/download │
│ 5. Return kết quả với statistics                            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Source Options

**Option A: Từ Supabase Storage**

- Workflows được lưu trong Supabase Storage bucket
- Fetch qua API

**Option B: Từ local memorize-mcp package**

- Workflows nằm trong package memorize-mcp/.workflows
- Copy từ node_modules hoặc global path

**Option C: Từ GitHub (recommended)**

- Fetch từ GitHub repository raw files
- Luôn có version mới nhất

---

## 6. Implementation Steps

### Phase 1: Config & Types (30 mins)

- [ ] Update `src/config.ts` - thêm workflows config
- [ ] Update `src/storage/types.ts` - thêm types cho workflows

### Phase 2: Workflows Storage Module (1 hour)

- [ ] Create `src/storage/workflows.ts`
  - `listWorkflowsFromSource()` - list files từ source
  - `fetchWorkflowContent()` - download content
  - `saveWorkflowToProject()` - save vào target project
  - `pullWorkflows()` - main function

### Phase 3: Tool Registration (30 mins)

- [ ] Update `index.ts` - đăng ký tool `pull_workflows`
- [ ] Add handler trong `CallToolRequestSchema`

### Phase 4: Testing & Documentation (30 mins)

- [ ] Test với local source
- [ ] Test với Supabase source
- [ ] Update README.md
- [ ] Update CHANGELOG.md

---

## 7. File Structure Changes

```
memorize-mcp/
├── src/
│   ├── config.ts          # ✏️ Update: thêm workflows config
│   └── storage/
│       ├── types.ts       # ✏️ Update: thêm workflow types
│       ├── workflows.ts   # 🆕 New: workflow pull logic
│       └── index.ts       # ✏️ Update: export workflows
├── index.ts               # ✏️ Update: register pull_workflows tool
├── .workflows/            # 📁 Source workflows
│   └── SAVE_MEMORY.md
└── docs/
    └── version1.2.1/
        ├── IMPLEMENTATION_PLAN.md  # 🆕 This file
        └── overview.md             # 🆕 Feature overview
```

---

## 8. Code Snippets

### 8.1 Config Update

```typescript
// src/config.ts
export interface Config {
	memoryDir: string;

	supabase: {
		url?: string;
		serviceRoleKey?: string;
		projectSlug?: string;
	};

	// NEW in v1.2.1
	workflows: {
		sourceType: "local" | "supabase" | "github";
		sourceUrl?: string;
		targetProjectDir?: string;
	};

	createdFrom: string;
}

export function getConfig(): Config {
	return {
		// ... existing

		workflows: {
			sourceType: (env.MEMORIZE_MCP_WORKFLOWS_SOURCE_TYPE as any) || "local",
			sourceUrl: env.MEMORIZE_MCP_WORKFLOWS_SOURCE,
			targetProjectDir: env.MEMORIZE_MCP_TARGET_PROJECT_DIR,
		},
	};
}
```

### 8.2 Workflows Module

```typescript
// src/storage/workflows.ts
import { Config } from "../config.js";
import * as fs from "fs/promises";
import * as path from "path";

export interface PullWorkflowsOptions {
	targetDir?: string;
	overwrite?: boolean;
	filename?: string;
	projectSlug?: string;
}

export interface PullWorkflowsResult {
	success: boolean;
	targetDir: string;
	stats: {
		created: number;
		updated: number;
		skipped: number;
		failed: number;
	};
	files: string[];
	message: string;
}

export async function pullWorkflows(
	options: PullWorkflowsOptions,
	config: Config
): Promise<PullWorkflowsResult> {
	// Implementation here
}
```

### 8.3 Tool Handler

```typescript
// index.ts - Add to tools array
{
  name: "pull_workflows",
  description: "Pull folder .workflows từ cloud về folder project đã cấu hình trong env",
  inputSchema: {
    type: "object",
    properties: {
      targetDir: {
        type: "string",
        description: "(Optional) Thư mục project đích"
      },
      overwrite: {
        type: "boolean",
        description: "(Optional) Ghi đè file nếu đã tồn tại. Mặc định: false"
      },
      filename: {
        type: "string",
        description: "(Optional) Chỉ pull một workflow file cụ thể"
      }
    },
    required: []
  }
}
```

---

## 9. Supabase Schema Update (Optional)

Nếu lưu workflows trên Supabase, cần thêm table:

```sql
-- Table: workflows
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, filename)
);

-- Index for faster queries
CREATE INDEX idx_workflows_project ON workflows(project_id);
```

---

## 10. Timeline

| Phase     | Task              | Estimated Time |
| --------- | ----------------- | -------------- |
| 1         | Config & Types    | 30 mins        |
| 2         | Workflows Module  | 1 hour         |
| 3         | Tool Registration | 30 mins        |
| 4         | Testing & Docs    | 30 mins        |
| **Total** |                   | **2.5 hours**  |

---

## 11. Risks & Mitigations

| Risk                         | Impact | Mitigation                                     |
| ---------------------------- | ------ | ---------------------------------------------- |
| Target dir permission denied | High   | Validate permissions trước khi write           |
| Source không available       | Medium | Fallback to local bundled workflows            |
| File conflicts               | Low    | Default không overwrite, yêu cầu flag explicit |

---

## 12. Success Criteria

- [ ] Tool `pull_workflows` hoạt động với local source
- [ ] Tool `pull_workflows` hoạt động với Supabase source (optional)
- [ ] Overwrite flag hoạt động đúng
- [ ] Selective pull by filename hoạt động
- [ ] Error handling đầy đủ
- [ ] Documentation updated

---

## 13. Future Enhancements (v1.2.2+)

- [ ] Auto-pull workflows khi khởi tạo project mới
- [ ] Version control cho workflows
- [ ] Merge strategies thay vì chỉ overwrite
- [ ] Pull từ custom Git repository
- [ ] Workflow templates marketplace
