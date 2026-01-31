---
name: task-planning
description: Systematic task planning and breakdown skill for complex projects. Use when receiving multi-step tasks, estimating effort, communicating plans, or organizing work before implementation. Helps break down large tasks into actionable steps.
license: MIT
metadata:
  author: memorize-mcp
  version: "1.0.0"
  category: general
  difficulty: beginner
  tags:
    - planning
    - project-management
    - task-breakdown
    - estimation
---

# Task Planning

Skill lập kế hoạch thực hiện task một cách có hệ thống, chia nhỏ task lớn thành các bước nhỏ có thể thực hiện được.

## When to Apply

Use this skill when:

- Receiving complex tasks with multiple steps
- Need to estimate effort and timeline
- Communicating implementation plans to stakeholders
- Starting a new feature or project
- Breaking down ambiguous requirements
- Coordinating work across team members
- Managing dependencies between tasks

## Planning Framework

### 1. Understand the Task

**Objective:** Clarify requirements and constraints before planning

**Critical Questions:**

- What is the end goal? What defines "done"?
- What are the inputs and outputs?
- What are the constraints (time, resources, technical)?
- What are the dependencies (external APIs, other features)?
- Who are the stakeholders?
- What is the priority level?

**Techniques:**

- Ask clarifying questions
- Review existing documentation
- Identify acceptance criteria
- Understand the business context

### 2. Break Down into Steps

**Objective:** Decompose the task into manageable pieces

**Approach:**

- Identify major milestones (25-30% completion points)
- Break each milestone into concrete tasks
- Order tasks by dependencies (what must come first)
- Estimate complexity for each task (Low/Medium/High)
- Group related tasks together

**Complexity Guidelines:**

- **Low:** < 2 hours, straightforward, no unknowns
- **Medium:** 2-8 hours, some complexity, minor unknowns
- **High:** > 8 hours, complex, significant unknowns (consider breaking down further)

### 3. Identify Risks

**Objective:** Anticipate problems before they occur

**Risk Categories:**

**Technical Risks:**

- New technology or framework
- Complex algorithms or logic
- Performance concerns
- Integration challenges

**Dependency Risks:**

- External APIs or services
- Third-party libraries
- Other team members' work
- Infrastructure requirements

**Time Risks:**

- Underestimation
- Scope creep
- Unclear requirements
- Blocking issues

**Mitigation Strategies:**

- Add buffer time for high-risk tasks
- Create proof-of-concepts for unknowns
- Identify alternative approaches
- Schedule early check-ins

### 4. Create Action Plan

**Objective:** Document the execution plan

**Format:**

```
Project: [Name]
Goal: [Brief description]
Timeline: [Estimated]

Milestones:
1. [ ] Milestone 1 (Week 1)
2. [ ] Milestone 2 (Week 2)
3. [ ] Milestone 3 (Week 3)

Tasks:
1. [ ] Task 1 - Description (Complexity: Low, Owner: Name, Due: Date)
   Prerequisites: None

2. [ ] Task 2 - Description (Complexity: Medium, Owner: Name, Due: Date)
   Prerequisites: Task 1
   2.1 [ ] Sub-task 2.1
   2.2 [ ] Sub-task 2.2

3. [ ] Task 3 - Description (Complexity: High, Owner: Name, Due: Date)
   Prerequisites: Task 2
   Risks: Performance concerns - plan POC

Dependencies:
- External API access (blocking Task 2)
- Database migration (blocking Task 3)

Risks:
- High: New framework (mitigate with POC in Task 1)
- Medium: Timeline tight (buffer added to Task 3)
```

## Examples

### Example 1: Feature Implementation

**Task:** Implement user authentication system

```
Goal: Add secure user authentication with JWT tokens

Milestones:
1. [ ] Backend authentication infrastructure (Week 1)
2. [ ] Frontend login/register UI (Week 2)
3. [ ] Integration and testing (Week 3)

Tasks:

1. [ ] Setup authentication dependencies (Low)
   - Install passport.js and JWT libraries
   - Configure environment variables
   - Setup database tables for users

2. [ ] Implement auth endpoints (Medium)
   - POST /auth/register - User registration
   - POST /auth/login - User login
   - POST /auth/refresh - Token refresh
   - POST /auth/logout - User logout
   Risks: Password hashing performance

3. [ ] Create auth middleware (Medium)
   - JWT token verification middleware
   - Role-based access control (RBAC)
   - Error handling for auth failures

4. [ ] Build login UI (Medium)
   - Login form component
   - Form validation
   - Error message display
   - Loading states

5. [ ] Build register UI (Medium)
   - Registration form
   - Password strength indicator
   - Email validation
   - Success/error handling

6. [ ] Implement password reset flow (High)
   - Backend: Reset token generation
   - Backend: Email sending service
   - Frontend: Request reset form
   - Frontend: Set new password form
   Risks: Email service integration (new dependency)

7. [ ] Testing (Medium)
   - Unit tests for auth logic
   - Integration tests for API endpoints
   - E2E tests for complete flows
   - Security testing (XSS, CSRF)

8. [ ] Documentation (Low)
   - API endpoint documentation
   - Setup guide for developers
   - User guide for login/register

Dependencies:
- Email service account (needed by Task 6)
- Database schema approved (needed by Task 1)

Risks:
- High: Email service integration - Plan POC in parallel
- Medium: Tight timeline - Focus on core features first, password reset can be deferred
```

### Example 2: Bug Fix

**Task:** Fix memory leak in data processing

```
Goal: Identify and fix memory leak causing crashes

Milestones:
1. [ ] Reproduce and diagnose issue (Day 1-2)
2. [ ] Implement fix (Day 3)
3. [ ] Test and deploy (Day 4)

Tasks:

1. [ ] Reproduce the issue (Low)
   - Setup test environment
   - Gather reproduction steps
   - Confirm memory leak with profiling

2. [ ] Profile memory usage (Medium)
   - Run heap snapshots
   - Identify leaking objects
   - Trace references
   Risks: May not be able to reproduce in dev environment

3. [ ] Analyze root cause (High)
   - Review related code
   - Check for event listener leaks
   - Check for closure issues
   - Review caching logic
   Risks: Multiple potential causes

4. [ ] Implement fix (Medium)
   - Apply fix based on root cause
   - Add cleanup logic
   - Update error handling

5. [ ] Test the fix (Medium)
   - Verify leak is resolved
   - Run existing test suite
   - Add regression test
   - Performance testing

6. [ ] Deploy and monitor (Low)
   - Deploy to staging
   - Monitor memory usage
   - Deploy to production
   - Setup alerts

Dependencies:
- Access to production logs (needed for Task 1)

Risks:
- High: Cannot reproduce - Mitigate by analyzing prod logs
- Medium: Multiple causes - Plan to fix incrementally
```

### Example 3: Refactoring

**Task:** Refactor legacy API to use TypeScript

```
Goal: Migrate JavaScript API codebase to TypeScript

Milestones:
1. [ ] Setup and tooling (Week 1)
2. [ ] Core modules migration (Week 2-3)
3. [ ] Complete migration and cleanup (Week 4)

Tasks:

1. [ ] Setup TypeScript (Low)
   - Install TypeScript and types
   - Create tsconfig.json
   - Configure build pipeline
   - Setup linting rules

2. [ ] Create type definitions (Medium)
   - Define core interfaces
   - Define data models
   - Define API request/response types
   - Create utility types

3. [ ] Migrate utilities module (Low)
   - Rename .js to .ts
   - Add type annotations
   - Fix type errors
   - Update tests

4. [ ] Migrate data layer (Medium)
   - Convert database models
   - Type database queries
   - Update repository patterns
   - Test data access

5. [ ] Migrate business logic (High)
   - Convert service classes
   - Add type guards
   - Update error handling
   - Refactor as needed
   Risks: Complex business logic may need redesign

6. [ ] Migrate API controllers (Medium)
   - Convert route handlers
   - Type request/response
   - Update middleware
   - Update validation

7. [ ] Update documentation (Low)
   - Update README
   - Generate API docs from types
   - Create migration guide

8. [ ] Cleanup (Low)
   - Remove old .js files
   - Update imports
   - Final type check
   - Remove any 'any' types

Dependencies:
- None (can work incrementally)

Risks:
- High: Business logic refactoring - May take longer than expected
- Medium: Breaking changes - Mitigate with comprehensive tests
```

## Best Practices

- ✅ **Do:** Start with high-level milestones, then add details
- ✅ **Do:** Keep tasks small and actionable (< 8 hours)
- ✅ **Do:** Document dependencies and blockers
- ✅ **Do:** Include testing in your plan
- ✅ **Do:** Add buffer time for high-risk tasks
- ✅ **Do:** Update the plan as you learn more
- ✅ **Do:** Communicate changes to stakeholders

- ❌ **Don't:** Over-plan - aim for "good enough" not perfect
- ❌ **Don't:** Create plans in isolation - get input
- ❌ **Don't:** Ignore risks and dependencies
- ❌ **Don't:** Forget about testing and documentation
- ❌ **Don't:** Set the plan in stone - be flexible
- ❌ **Don't:** Plan more than 2-3 sprints ahead in detail

## Common Pitfalls

### Pitfall 1: Over-Planning

**Problem:** Spending too much time planning, not enough executing
**Solution:** Time-box planning sessions. Start with a rough plan and refine as you go.

### Pitfall 2: Under-Estimating

**Problem:** Tasks consistently take longer than estimated
**Solution:** Track actual vs. estimated time. Add 50% buffer for uncertain tasks.

### Pitfall 3: Ignoring Dependencies

**Problem:** Tasks blocked because dependencies weren't identified
**Solution:** Always ask "What needs to be done first?" for each task.

### Pitfall 4: No Contingency Plans

**Problem:** Plan falls apart when one thing goes wrong
**Solution:** Identify risks and have backup approaches for high-risk items.

### Pitfall 5: Unclear Success Criteria

**Problem:** Not knowing when a task is "done"
**Solution:** Define acceptance criteria for each major task.

## Tools & Resources

### Planning Tools

- **Notion** - Flexible task management
- **Linear** - Issue tracking for dev teams
- **Jira** - Enterprise project management
- **Trello** - Visual kanban boards
- **GitHub Projects** - Integrated with code

### Estimation Techniques

- **Story Points** - Relative sizing (Fibonacci: 1, 2, 3, 5, 8, 13)
- **T-Shirt Sizing** - XS, S, M, L, XL
- **Time Boxing** - Fixed time, variable scope

### Further Reading

- [Getting Things Done (GTD)](https://gettingthingsdone.com/) - Task management methodology
- [SMART Goals](https://en.wikipedia.org/wiki/SMART_criteria) - Goal setting framework

## Planning Checklist

- [ ] Understand the end goal and success criteria
- [ ] Identify all constraints and dependencies
- [ ] Break down into milestones (25-30% increments)
- [ ] Create actionable tasks (< 8 hours each)
- [ ] Order tasks by dependencies
- [ ] Estimate complexity for each task
- [ ] Identify and document risks
- [ ] Create mitigation strategies for high risks
- [ ] Add buffer time for uncertain tasks
- [ ] Include testing and documentation tasks
- [ ] Document the plan in a shared location
- [ ] Review plan with team/stakeholders
- [ ] Set up tracking mechanism
- [ ] Plan regular check-ins and updates

## Related Skills

- [Code Analysis](../code-analysis/SKILL.md) - Analyze before planning implementation
- Time Management - Prioritize tasks effectively
- Risk Management - Deep dive into risk analysis

---

## Metadata

- **Last Updated:** 2026-01-31
- **Difficulty Level:** Beginner
- **Estimated Learning Time:** 1-2 hours
- **Applies To:** All projects and domains
