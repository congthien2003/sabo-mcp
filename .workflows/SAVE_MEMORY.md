# Auto Save Memory Workflow

## Mục đích (Purpose)

Workflow này hướng dẫn AI agent tự động lưu trữ summary của task đã hoàn thành vào memory system sử dụng MCP tool.

## Khi nào cần lưu memory (When to Save)

Agent cần tự động lưu memory trong các trường hợp sau:

- ✅ Hoàn thành một task phức tạp (multi-step task)
- ✅ Hoàn thành implementation của feature mới
- ✅ Fix bug quan trọng
- ✅ Refactor code có nhiều thay đổi
- ✅ Tạo hoặc cập nhật documentation
- ⚠️ User yêu cầu rõ ràng: "lưu lại", "save memory", "ghi nhớ"

**KHÔNG cần lưu** cho các task đơn giản như:

- Trả lời câu hỏi
- Đọc file
- Tìm kiếm thông tin
- Sửa lỗi chính tả nhỏ

## Workflow Steps

### 1. Xác định task đã hoàn thành

Trước khi lưu, agent cần xác nhận:

- [ ] Task đã hoàn thành đầy đủ
- [ ] Code đã được test/verify (nếu có)
- [ ] Không còn lỗi hoặc vấn đề chưa giải quyết

### 2. Tạo summary nội dung

Tạo một summary chi tiết bao gồm:

```json
{
	"task_completed": "Mô tả ngắn gọn task đã làm",
	"files_changed": ["file1.ts", "file2.tsx"],
	"key_changes": ["Thay đổi quan trọng 1", "Thay đổi quan trọng 2"],
	"technical_details": {
		"approach": "Cách tiếp cận được sử dụng",
		"technologies": ["React", "TypeScript", "..."],
		"key_decisions": "Các quyết định kỹ thuật quan trọng"
	},
	"results": {
		"success": true,
		"notes": "Ghi chú bổ sung"
	},
	"next_steps": ["Bước tiếp theo nếu có"],
	"timestamp": "2026-01-19T10:30:00Z"
}
```

### 3. Gọi MCP Tool

Sử dụng tool `mcp_project-memor_save_memorize` với parameters:

```javascript
{
  filename: "task_summary_YYYYMMDD_HHMM.json",
  topic: "Tên chủ đề/feature chính",
  content: "JSON string của summary đã tạo ở bước 2",
  projectSlug: "optional - nếu cần sync lên cloud"
}
```

### 4. Xác nhận và thông báo

Sau khi lưu thành công:

- Xác nhận với user: "✅ Đã lưu summary vào memory system"
- Không cần giải thích chi tiết trừ khi user hỏi

## Example Workflow

### Scenario: User yêu cầu "Tạo component Header mới"

**After completing the task:**

1. ✅ Component đã được tạo và test
2. ✅ Tạo summary:

```json
{
	"task_completed": "Tạo Header component mới với responsive design",
	"files_changed": [
		"components/Header.tsx",
		"components/Header.module.css",
		"app/layout.tsx"
	],
	"key_changes": [
		"Tạo Header component với logo, navigation, và mobile menu",
		"Implement responsive design cho mobile và desktop",
		"Thêm dark mode toggle",
		"Integrate vào layout chính"
	],
	"technical_details": {
		"approach": "Sử dụng React functional component với hooks",
		"technologies": ["React", "TypeScript", "CSS Modules", "Next.js"],
		"key_decisions": "Sử dụng CSS Modules thay vì Tailwind để dễ customize"
	},
	"results": {
		"success": true,
		"notes": "Header hoạt động tốt trên tất cả breakpoints"
	},
	"timestamp": "2026-01-19T10:30:00Z"
}
```

3. ✅ Call MCP tool:

```json
{
	"filename": "header_component_20260119_1030.json",
	"topic": "Header Component Implementation",
	"content": "{\"task_completed\":\"Tạo Header component...\"}",
	"projectSlug": "my-landing-page"
}
```

4. ✅ Confirm: "Đã lưu summary vào memory system"

## Naming Convention

### Filename Format

`{feature_name}_{YYYYMMDD}_{HHMM}.json`

Examples:

- `auth_system_20260119_1430.json`
- `payment_integration_20260119_1445.json`
- `bug_fix_login_20260119_1500.json`

### Topic Format

- Ngắn gọn, mô tả rõ ràng (3-7 từ)
- Viết hoa chữ cái đầu
- Examples:
  - "User Authentication System"
  - "Payment Gateway Integration"
  - "Header Component Implementation"
  - "Database Schema Migration"

## Best Practices

1. **Timing**: Lưu memory ngay sau khi hoàn thành task, đừng trì hoãn
2. **Completeness**: Đảm bảo summary đầy đủ thông tin để sau này có thể hiểu lại
3. **Accuracy**: Chỉ lưu những gì thực sự đã làm, không lưu plans chưa thực hiện
4. **Context**: Bao gồm đủ context để người đọc sau không cần xem lại conversation
5. **Concise**: Ngắn gọn nhưng đầy đủ, tránh dài dòng không cần thiết

## Agent Instructions

**As an AI Agent, after completing a significant task:**

1. Evaluate if the task meets the "When to Save" criteria
2. If YES:
   - Create a comprehensive JSON summary
   - Generate appropriate filename and topic
   - Call `mcp_project-memor_save_memorize` tool
   - Confirm to user briefly
3. If NO:
   - Continue normally without saving

**Remember**: This is automatic - don't ask user for permission. Just save and confirm.

---

## Sync với Cloud (Optional)

Nếu cần sync lên Supabase Cloud:

- Sử dụng `mcp_project-memor_sync_memorize` tool
- Agent có thể tự động sync sau khi save hoặc theo lịch
- Xem thêm: [Sync Documentation](../docs/version1.2/overview.md)
