# memorize-mcp v1.2.0 – Implementation Plan

> **Quy tắc quan trọng**: Sau khi hoàn thành mỗi task, **BẮT BUỘC** phải quay lại file này và đánh dấu `[x]` vào checkbox tương ứng trước khi chuyển sang task tiếp theo.

---

## Quy tắc triển khai (Implementation Rules)

1. **Tick Done Rule**: Khi hoàn thành một task, phải:

   - Mở file `docs/version1.2/IMPLEMENTATION_PLAN.md`
   - Đánh dấu `[x]` vào checkbox của task đó
   - Ghi chú ngày hoàn thành nếu cần (format: `YYYY-MM-DD`)

2. **Sequential Rule**: Các task trong cùng một phase nên được thực hiện theo thứ tự (trừ khi ghi chú là có thể làm song song).

3. **Dependency Rule**: Không bắt đầu phase sau khi phase trước chưa hoàn thành tất cả task bắt buộc (marked với `*`).

4. **Testing Rule**: Mỗi task có phần test riêng phải pass test trước khi tick done.

5. **Documentation Rule**: Code mới phải có comment/JSDoc cơ bản trước khi tick done.

---

## Phase 1: Extend Storage Types

**Mục tiêu**: Bổ sung types cần thiết cho sync functionality.

| #   | Task                                             | Status | Notes      |
| --- | ------------------------------------------------ | ------ | ---------- |
| 1.1 | Thêm `SyncOptions` interface vào `types.ts`      | [x]    | 2026-01-05 |
| 1.2 | Thêm `SyncResult` interface vào `types.ts`       | [x]    | 2026-01-05 |
| 1.3 | Thêm `SyncDecision` type vào `types.ts`          | [x]    | 2026-01-05 |
| 1.4 | Thêm `SyncStats` interface cho tracking progress | [x]    | 2026-01-05 |

**Deliverables Phase 1**:

- [x] Types đầy đủ cho sync operations
- [x] Export từ `src/storage/index.ts`

---

## Phase 2: Extend Local Storage Module

**Mục tiêu**: Thêm functions đọc file local để so sánh với cloud.

| #     | Task                                                              | Status | Notes      |
| ----- | ----------------------------------------------------------------- | ------ | ---------- |
| 2.1\* | Implement `readLocalMemory(filename, memoryDir)` trong `local.ts` | [x]    | 2026-01-05 |
| 2.2\* | Implement `listLocalMemories(memoryDir)` trong `local.ts`         | [x]    | 2026-01-05 |
| 2.3   | Implement `localMemoryExists(filename, memoryDir)` helper         | [x]    | 2026-01-05 |
| 2.4\* | Export functions mới từ `src/storage/index.ts`                    | [x]    | 2026-01-05 |
| 2.5   | Test đọc file local                                               | [x]    | 2026-01-05 |

**Deliverables Phase 2**:

- [x] Có thể đọc và list các file memory local
- [x] Functions được export đúng

---

## Phase 3: Extend Supabase Module

**Mục tiêu**: Thêm functions query memories từ Supabase.

| #     | Task                                                                    | Status | Notes    |
| ----- | ----------------------------------------------------------------------- | ------ | -------- |
| 3.1\* | Implement `getProjectBySlug(projectSlug, config)` trong `supabase.ts`   | [ ]    |          |
| 3.2\* | Implement `getProjectMemories(projectSlug, config)` trong `supabase.ts` | [ ]    |          |
| 3.3   | Implement `getMemoryByFilename(projectSlug, filename, config)`          | [ ]    | Optional |
| 3.4\* | Export functions mới từ `src/storage/index.ts`                          | [ ]    |          |
| 3.5   | Test query từ Supabase                                                  | [ ]    |          |

**Deliverables Phase 3**:

- [ ] Có thể query memories từ Supabase theo project
- [ ] Có thể query single memory theo filename

---

## Phase 4: Create Sync Module

**Mục tiêu**: Tạo module xử lý logic sync từ cloud về local.

| #     | Task                                                            | Status | Notes |
| ----- | --------------------------------------------------------------- | ------ | ----- |
| 4.1\* | Tạo file `src/storage/sync.ts`                                  | [ ]    |       |
| 4.2\* | Implement `decideSyncAction(localFile, cloudMemory, overwrite)` | [ ]    |       |
| 4.3\* | Implement `syncSingleMemory(memory, memoryDir, overwrite)`      | [ ]    |       |
| 4.4\* | Implement `syncFromCloud(options, config)` - main function      | [ ]    |       |
| 4.5\* | Implement logging cho sync progress                             | [ ]    |       |
| 4.6\* | Export từ `src/storage/index.ts`                                | [ ]    |       |

**Deliverables Phase 4**:

- [ ] `syncFromCloud()` hoạt động end-to-end
- [ ] Trả về SyncResult với stats chi tiết

---

## Phase 5: Add Tool `sync_memorize`

**Mục tiêu**: Đăng ký tool mới trong MCP server.

| #     | Task                                                        | Status | Notes |
| ----- | ----------------------------------------------------------- | ------ | ----- |
| 5.1\* | Thêm tool schema `sync_memorize` vào ListToolsRequestSchema | [x]    |       |
| 5.2\* | Implement handler cho `sync_memorize`                       | [x]    |       |
| 5.3\* | Validate: Supabase phải được cấu hình                       | [x]    |       |
| 5.4\* | Format response message với stats                           | [x]    |       |
| 5.5   | Error handling cho các edge cases                           | [x]    |       |

**Deliverables Phase 5**:

- [x] Tool `sync_memorize` xuất hiện trong tool list
- [x] Tool hoạt động đúng khi gọi từ MCP client

---

## Phase 6: Testing & Edge Cases

**Mục tiêu**: Đảm bảo sync hoạt động đúng trong mọi trường hợp.

| #   | Task                                        | Status | Notes |
| --- | ------------------------------------------- | ------ | ----- |
| 6.1 | Test: Sync về folder trống (tạo mới tất cả) | [ ]    |       |
| 6.2 | Test: Sync về folder có sẵn files (update)  | [ ]    |       |
| 6.3 | Test: File local mới hơn cloud (skip)       | [ ]    |       |
| 6.4 | Test: overwrite=false                       | [ ]    |       |
| 6.5 | Test: Project không tồn tại                 | [ ]    |       |
| 6.6 | Test: Project không có memories             | [ ]    |       |
| 6.7 | Test: Supabase không cấu hình               | [ ]    |       |
| 6.8 | Test: Sync single file với filename param   | [ ]    |       |

**Deliverables Phase 6**:

- [ ] Tất cả test cases pass
- [ ] Edge cases được handle gracefully

---

## Phase 7: Documentation & Versioning

**Mục tiêu**: Cập nhật docs và version cho release.

| #     | Task                                             | Status | Notes |
| ----- | ------------------------------------------------ | ------ | ----- |
| 7.1\* | Bump version trong `package.json` lên `1.2.0`    | [x]    |       |
| 7.2\* | Cập nhật version trong `index.ts`                | [x]    |       |
| 7.3\* | Thêm entry v1.2.0 vào `CHANGELOG.md`             | [x]    |       |
| 7.4\* | Cập nhật `README.md` - thêm phần Sync from Cloud | [x]    |       |
| 7.5   | Review `docs/version1.2/overview.md`             | [x]    |       |

**Deliverables Phase 7**:

- [x] Version `1.2.0` nhất quán trong codebase
- [x] README có hướng dẫn dùng `sync_memorize`

---

## Phase 8: Release

**Mục tiêu**: Hoàn tất và đánh dấu release v1.2.0.

| #   | Task                                   | Status | Notes |
| --- | -------------------------------------- | ------ | ----- |
| 8.1 | Final review - tất cả task `*` đã done | [ ]    |       |
| 8.2 | Commit với message: `release: v1.2.0`  | [ ]    |       |
| 8.3 | Tạo git tag `v1.2.0`                   | [ ]    |       |
| 8.4 | Push to remote                         | [ ]    |       |

**Deliverables Phase 8**:

- [ ] Tag `v1.2.0` trên git
- [ ] Code đã push lên remote

---

## Progress Summary

| Phase              | Total Tasks | Completed | Progress |
| ------------------ | ----------- | --------- | -------- |
| 1. Types           | 4           | 4         | 100%     |
| 2. Local Storage   | 5           | 5         | 100%     |
| 3. Supabase Module | 5           | 0         | 0%       |
| 4. Sync Module     | 6           | 0         | 0%       |
| 5. Tool            | 5           | 0         | 0%       |
| 6. Testing         | 8           | 0         | 0%       |
| 7. Documentation   | 5           | 0         | 0%       |
| 8. Release         | 4           | 0         | 0%       |
| **TOTAL**          | **42**      | **0**     | **0%**   |

---

## Notes & Blockers

_Ghi chú các vấn đề phát sinh trong quá trình triển khai:_

| Date | Issue | Resolution |
| ---- | ----- | ---------- |
|      |       |            |

---

## Changelog của Plan này

| Date       | Change               |
| ---------- | -------------------- |
| 2026-01-05 | Initial plan created |
