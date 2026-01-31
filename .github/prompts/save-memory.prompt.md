---
name: save-memory
description: "Execute task then automatically save memory using MCP tool"
agent: "agent"
---

# /save-memory

Execute the requested task, then automatically save a structured memory summary using the `save_memorize` MCP tool.

## Syntax

```
/save-memory <Task description>
```

## Examples

```
/save-memory Tạo authentication middleware với JWT
/save-memory Fix bug login không hoạt động trên mobile
/save-memory Refactor code authentication module
/save-memory Implement feature export PDF
```

---

## Workflow

When user invokes `/save-memory <task>`, follow these steps:

### Step 1: Parse and Execute Task

1. Extract the task description from the command
2. Execute the task as normal (code, fix, implement, etc.)
3. Verify task completion:
   - [ ] Task completed fully
   - [ ] Code tested/verified (if applicable)
   - [ ] No remaining errors or issues

### Step 2: Prepare Memory Summary

After task completion, create a structured JSON summary:

```json
{
  "task_completed": "<Brief description of completed task>",
  "files_changed": ["file1.ts", "file2.tsx"],
  "key_changes": ["Change 1", "Change 2"],
  "technical_details": {
    "approach": "<Approach used>",
    "technologies": ["Tech1", "Tech2"],
    "key_decisions": "<Important technical decisions>"
  },
  "results": {
    "success": true,
    "notes": "<Additional notes if any>"
  },
  "timestamp": "<ISO timestamp>"
}
```

### Step 3: Save Memory via MCP Tool

Call the `save_memorize` MCP tool with:

```javascript
{
  filename: "task_YYYYMMDD_HHMM.json",  // e.g., task_20260131_1430.json
  topic: "<Task description from command>",
  content: "<JSON string of the summary>"
}
```

### Step 4: Confirm to User

After successful save, respond with:

```
✅ Task completed and memory saved!
📁 Saved to: task_YYYYMMDD_HHMM.json
```

---

## Important Rules

1. **Always save after task completion** - Don't ask user for confirmation
2. **Filename format**: `task_YYYYMMDD_HHMM.json` based on current timestamp
3. **Topic**: Take directly from the command (text after `/save-memory`)
4. **Content**: Structured JSON with all task details

---

## When NOT to Use

This command is for tasks that involve actual work. Don't use for:

- Simple questions
- File reading only
- Information lookup
- Minor typo fixes

---

## Example Conversation

**User:**

```
/save-memory Create Header component with responsive design
```

**Agent actions:**

1. Create `components/Header.tsx`
2. Implement responsive navigation
3. Add mobile menu
4. Test component

**Agent response:**

```
✅ Task completed and memory saved!

## Results:
- Created `components/Header.tsx` with responsive navigation
- Added mobile hamburger menu
- Integrated into main layout

📁 Memory saved: task_20260131_1530.json
```
