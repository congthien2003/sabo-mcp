# Skills Directory

This directory contains reusable skills that AI agents can reference to perform specific tasks following best practices.

## Structure

Each skill is organized in its own directory:

```
skills/
  {skill-name}/
    SKILL.md          # Main skill documentation with frontmatter
    examples/         # (Optional) Code examples
    resources/        # (Optional) Additional resources
```

## Available Skills

### General Skills

- **[code-analysis](./code-analysis/SKILL.md)** - Systematic code analysis for understanding codebase structure, dependencies, and patterns
- **[task-planning](./task-planning/SKILL.md)** - Task planning and breakdown for complex projects

### Front-End Skills

- **[vercel-react-best-practices](./vercel-react-best-practices/SKILL.md)** - React and Next.js performance optimization guidelines from Vercel

## Creating a New Skill

See the comprehensive guide: [How to Create a Skill](../docs/resources/create-skill.md)

### Quick Start

1. Create a new directory: `skills/{your-skill-name}/`
2. Create `SKILL.md` with proper frontmatter
3. Follow the template structure
4. Add examples and resources as needed

### Skill Template

```markdown
---
name: your-skill-name
description: Clear description with trigger keywords
license: MIT
metadata:
  author: your-name
  version: "1.0.0"
  category: general|front-end|back-end|devops|testing|data-science
  tags:
    - tag1
    - tag2
---

# Skill Title

[Content following the template...]
```

## Using Skills

Skills can be referenced in:

- **Workflows**: `.workflows/` directory
- **Agent Instructions**: Direct references in prompts
- **MCP Tools**: Pulled via `pull_workflows` tool

## Skill Categories

- **general** - Universal skills applicable to any project
- **front-end** - Web UI, React, Vue, Angular, etc.
- **back-end** - APIs, databases, server-side logic
- **devops** - CI/CD, infrastructure, deployment
- **testing** - Testing strategies and frameworks
- **data-science** - ML, data analysis, visualization

## Contributing

When adding a new skill:

1. Follow the template in [create-skill.md](../docs/resources/create-skill.md)
2. Include practical examples
3. Add frontmatter metadata
4. Update this README with a link
5. Test the skill in actual workflows

## Quality Standards

All skills should have:

- Clear, descriptive frontmatter
- Well-defined "When to Apply" section
- At least 3 practical examples
- Prioritized guidelines or rules
- Code examples with explanations
- Common pitfalls section
- Quick reference for scanning

## License

Unless otherwise specified, all skills are licensed under MIT.
