---
name: code-analysis
description: Systematic code analysis skill for understanding codebase structure, dependencies, and patterns. Use when exploring new codebases, planning refactoring, debugging complex issues, or identifying patterns to follow.
license: MIT
metadata:
  author: memorize-mcp
  version: "1.0.0"
  category: general
  difficulty: intermediate
  tags:
    - code-analysis
    - architecture
    - debugging
    - refactoring
---

# Code Analysis

Skill phân tích code để hiểu cấu trúc, dependencies, và patterns được sử dụng trong project một cách có hệ thống.

## When to Apply

Use this skill when:

- Exploring a new codebase for the first time
- Planning a major refactoring effort
- Debugging complex issues that require understanding system architecture
- Identifying code patterns to follow or document
- Onboarding to a new project
- Conducting code reviews at the architectural level

## Analysis Framework

### 1. Project Structure Analysis

**Objective:** Understand the overall organization and entry points

**Steps:**

- Map out the directory structure
- Identify entry points (main files, index files)
- Locate configuration files (tsconfig.json, package.json, .env, etc.)
- Identify the framework/library ecosystem being used
- Document the project type (API, webapp, library, CLI, etc.)

**Questions to Answer:**

- What type of application is this?
- Where does execution begin?
- How are files organized (by feature, by type, or mixed)?
- What build tools are configured?

### 2. Dependency Analysis

**Objective:** Map out external and internal dependencies

**Steps:**

- Read package.json / requirements.txt / go.mod
- Categorize dependencies: core, utilities, development
- Check for version compatibility issues
- Identify deprecated or outdated packages
- Map dependency relationships

**Questions to Answer:**

- What are the core dependencies the project relies on?
- Are there any security vulnerabilities?
- What's the update strategy (locked versions vs. ranges)?
- Are there any conflicting dependencies?

### 3. Code Pattern Analysis

**Objective:** Identify coding conventions and patterns

**Steps:**

- Review several representative files
- Identify naming conventions (camelCase, PascalCase, kebab-case)
- Find common design patterns (Repository, Factory, Observer, etc.)
- Analyze error handling approaches
- Review logging and monitoring practices
- Check code formatting and style

**Questions to Answer:**

- What patterns are consistently used?
- Are there any anti-patterns present?
- How is error handling implemented?
- What testing patterns are followed?

### 4. Architecture Analysis

**Objective:** Understand the high-level system design

**Steps:**

- Identify architectural layers (presentation, business logic, data access)
- Map component/module relationships
- Find API boundaries and contracts
- Document data flow and state management
- Identify external integrations

**Questions to Answer:**

- What architectural pattern is used (MVC, Clean Architecture, Hexagonal, etc.)?
- How do components communicate?
- Where is business logic concentrated?
- How is state managed?

## Analysis Output Format

After completing the analysis, create a structured summary:

```json
{
  "project_type": "Node.js REST API",
  "main_technologies": ["TypeScript", "Express.js", "PostgreSQL", "Redis"],
  "architecture": "Layered Architecture (Controller → Service → Repository)",
  "key_patterns": [
    "Repository pattern for data access",
    "Dependency Injection via constructor",
    "Factory pattern for creating services",
    "Strategy pattern for authentication methods"
  ],
  "entry_points": ["src/index.ts", "src/server.ts"],
  "dependencies": {
    "core": ["express", "pg", "redis"],
    "utilities": ["lodash", "moment", "winston"],
    "development": ["jest", "eslint", "typescript"]
  },
  "code_conventions": {
    "naming": "camelCase for variables/functions, PascalCase for classes",
    "file_structure": "Organized by feature (modules)",
    "error_handling": "Custom error classes + global error middleware",
    "testing": "Jest with unit tests for services, integration tests for controllers"
  },
  "strengths": [
    "Clear separation of concerns",
    "Comprehensive error handling",
    "Good test coverage (>80%)"
  ],
  "weaknesses": [
    "Some circular dependencies between modules",
    "Inconsistent logging practices",
    "Missing API documentation"
  ],
  "recommendations": [
    "Add OpenAPI/Swagger documentation",
    "Resolve circular dependencies",
    "Standardize logging with structured format",
    "Consider adding API versioning strategy"
  ]
}
```

## Step-by-Step Analysis Guide

### Phase 1: Quick Scan (15-30 minutes)

1. **Read the README**
   - Understand the project's purpose
   - Note setup instructions
   - Check for architecture diagrams

2. **Check the root directory**
   - Review package.json/requirements.txt
   - Look at configuration files
   - Identify build scripts

3. **Explore the main directories**
   - Map out the folder structure
   - Identify patterns in naming

### Phase 2: Deep Dive (1-2 hours)

4. **Trace the entry point**
   - Start from main/index file
   - Follow imports/requires
   - Build a mental model of initialization

5. **Analyze key modules**
   - Pick 2-3 representative modules
   - Study their internal structure
   - Note patterns and conventions

6. **Review data flow**
   - How does data enter the system?
   - How is it transformed?
   - Where is it stored?

### Phase 3: Documentation (30 minutes)

7. **Create architecture diagram**
   - Sketch the high-level structure
   - Show component relationships
   - Document data flow

8. **Write analysis summary**
   - Use the JSON format above
   - Highlight key findings
   - List recommendations

## Best Practices

- ✅ **Do:** Start with the README and documentation
- ✅ **Do:** Follow code execution paths from entry points
- ✅ **Do:** Look for tests - they reveal expected behavior
- ✅ **Do:** Pay attention to configuration files
- ✅ **Do:** Note both patterns and anti-patterns
- ✅ **Do:** Document your findings as you go

- ❌ **Don't:** Try to read every file in detail
- ❌ **Don't:** Get lost in implementation details initially
- ❌ **Don't:** Assume patterns without verification
- ❌ **Don't:** Skip the README and documentation
- ❌ **Don't:** Analyze in isolation - discuss with team members

## Common Pitfalls

### Pitfall 1: Analysis Paralysis

**Problem:** Trying to understand everything before taking action
**Solution:** Set time limits for each analysis phase. Focus on what's needed for your immediate task.

### Pitfall 2: Surface-Level Analysis

**Problem:** Only looking at file names and folder structure
**Solution:** Always trace execution paths and read actual code in key modules.

### Pitfall 3: Ignoring Tests

**Problem:** Skipping test files during analysis
**Solution:** Tests are documentation - they show how components are meant to be used.

### Pitfall 4: Missing the Forest for the Trees

**Problem:** Getting lost in implementation details
**Solution:** Maintain both high-level and detailed views. Zoom out regularly.

## Tools & Resources

### Static Analysis Tools

- **ESLint/TSLint** - Code quality and pattern detection
- **SonarQube** - Code quality and security analysis
- **Madge** - Dependency graph visualization
- **dependency-cruiser** - Validate and visualize dependencies

### Visualization Tools

- **VS Code Architecture View** - Project structure visualization
- **Draw.io** - Architecture diagrams
- **Mermaid** - Text-based diagrams

### Documentation

- [C4 Model](https://c4model.com/) - Architecture documentation framework
- [ADR](https://adr.github.io/) - Architecture Decision Records

## Analysis Checklist

- [ ] Read README and documentation
- [ ] Identify project type and purpose
- [ ] Map directory structure
- [ ] Locate and understand entry points
- [ ] Analyze key configuration files
- [ ] List core dependencies
- [ ] Identify architectural pattern
- [ ] Document code conventions
- [ ] Map data flow
- [ ] Review error handling approach
- [ ] Check testing strategy
- [ ] Note strengths and weaknesses
- [ ] Provide actionable recommendations
- [ ] Create architecture diagram (if needed)

## Related Skills

- [Task Planning](../task-planning/SKILL.md) - Use after analysis to plan implementation
- Documentation Writing - Document your analysis findings

---

## Metadata

- **Last Updated:** 2026-01-31
- **Difficulty Level:** Intermediate
- **Estimated Learning Time:** 2-3 hours
- **Applies To:** All programming languages and frameworks
