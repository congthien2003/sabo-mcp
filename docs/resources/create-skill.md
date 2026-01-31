# How to Create a New Skill

This guide explains how to create a new skill for the Memorize MCP project.

## Skill Structure

Each skill is stored in its own directory following the pattern:

```
skills/
  {skillName}/
    SKILL.md          # Main skill documentation
    examples/         # (Optional) Code examples
    resources/        # (Optional) Additional resources
```

## SKILL.md Template

Create a new skill file at `skills/{your-skill-name}/SKILL.md` using this template:

````markdown
---
name: your-skill-name
description: A clear, concise description of what this skill does and when it should be used. Include trigger keywords that indicate when this skill is relevant.
license: MIT
metadata:
  author: your-name
  version: "1.0.0"
  category: general|front-end|back-end|devops|testing|data-science
  tags:
    - tag1
    - tag2
---

# [Skill Title]

Brief overview of the skill (1-2 paragraphs). Explain the purpose and value proposition.

## When to Apply

List specific scenarios when this skill should be used:

- Scenario 1: Description
- Scenario 2: Description
- Scenario 3: Description

## Prerequisites

(Optional) List what knowledge or setup is required:

- Prerequisite 1
- Prerequisite 2

## Core Concepts

Explain the fundamental concepts this skill is based on:

### Concept 1

Description and explanation.

### Concept 2

Description and explanation.

## Guidelines

Provide actionable guidelines organized by priority or category:

### High Priority Guidelines

| Rule ID         | Description       | Impact          |
| --------------- | ----------------- | --------------- |
| `prefix-rule-1` | Brief description | HIGH/MEDIUM/LOW |
| `prefix-rule-2` | Brief description | HIGH/MEDIUM/LOW |

### Medium Priority Guidelines

...

## Quick Reference

Provide a concise checklist or cheat sheet:

### Category 1

- `rule-id-1` - Brief description
- `rule-id-2` - Brief description

### Category 2

- `rule-id-3` - Brief description

## Examples

### Example 1: [Scenario Name]

**Context:** When to use this example

**Bad Approach:**

```language
// Incorrect code example
// Explain why this is problematic
```
````

**Good Approach:**

```language
// Correct code example
// Explain why this is better
```

**Key Takeaways:**

- Takeaway 1
- Takeaway 2

### Example 2: [Scenario Name]

...

## Step-by-Step Guide

(Optional) For process-oriented skills, provide a step-by-step guide:

### Step 1: [Action]

Description and instructions.

```language
// Code example if applicable
```

### Step 2: [Action]

...

## Best Practices

General best practices that don't fit into specific rules:

- ✅ **Do:** Recommendation with explanation
- ❌ **Don't:** Anti-pattern with explanation

## Common Pitfalls

List common mistakes and how to avoid them:

### Pitfall 1: [Description]

**Problem:** What goes wrong
**Solution:** How to fix or avoid it

### Pitfall 2: [Description]

...

## Tools & Resources

(Optional) Helpful tools, libraries, or references:

### Tools

- [Tool Name](url) - Description

### Documentation

- [Resource Name](url) - Description

### Further Reading

- [Article/Book](url) - Description

## Checklist

Provide a final checklist for applying this skill:

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## Related Skills

(Optional) Link to related skills:

- [Related Skill 1](../skill-name/SKILL.md) - How it relates
- [Related Skill 2](../skill-name/SKILL.md) - How it relates

---

## Metadata

- **Last Updated:** YYYY-MM-DD
- **Difficulty Level:** Beginner|Intermediate|Advanced
- **Estimated Learning Time:** X hours
- **Applies To:** Languages, frameworks, or domains this skill applies to

```

## Frontmatter Fields Explained

### Required Fields

- **name**: Kebab-case identifier (e.g., `react-performance-optimization`)
- **description**: 1-3 sentences explaining the skill and when to use it. Include trigger keywords.
- **license**: License type (usually MIT)
- **metadata.author**: Creator's name or organization
- **metadata.version**: Semantic version (e.g., "1.0.0")

### Optional Fields

- **metadata.category**: Helps organize skills (general, front-end, back-end, devops, testing, data-science)
- **metadata.tags**: Array of searchable tags
- **metadata.difficulty**: beginner|intermediate|advanced
- **metadata.language**: Primary programming language if applicable
- **metadata.framework**: Primary framework if applicable

## Content Guidelines

### 1. Be Specific and Actionable

❌ Bad: "Write clean code"
✅ Good: "Extract functions longer than 20 lines into smaller, single-purpose functions"

### 2. Provide Context

Always explain **why** a guideline matters, not just **what** to do.

### 3. Use Examples

Code examples should:
- Show both incorrect and correct approaches
- Include comments explaining the reasoning
- Be realistic and practical

### 4. Organize by Priority

Use priority levels (CRITICAL, HIGH, MEDIUM, LOW) to help users focus on what matters most.

### 5. Make it Scannable

- Use clear headings
- Include tables for quick reference
- Provide a "Quick Reference" section
- Use consistent formatting

## Example Categories

### General Skills
- Code analysis
- Task planning
- Debugging strategies
- Documentation writing

### Front-End Skills
- React best practices
- CSS optimization
- Accessibility guidelines
- Performance optimization

### Back-End Skills
- API design
- Database optimization
- Security best practices
- Caching strategies

### DevOps Skills
- CI/CD setup
- Container optimization
- Monitoring setup
- Infrastructure as code

### Testing Skills
- Unit testing patterns
- Integration testing
- E2E testing strategies
- Test-driven development

### Data Science Skills
- Data cleaning
- Model optimization
- Feature engineering
- Visualization best practices

## Publishing Your Skill

1. Create your skill directory: `skills/{your-skill-name}/`
2. Write the SKILL.md file following the template
3. Add examples in `examples/` directory if needed
4. Test the skill by referencing it in a workflow
5. Update the main skills index if one exists

## Tips

- Start with a simple structure and expand as needed
- Review existing skills for inspiration
- Get feedback from potential users
- Keep the skill focused on a specific domain
- Update the version when making significant changes
- Include real-world examples from actual projects

## Skill Quality Checklist

Before publishing, ensure your skill has:

- [ ] Clear, descriptive name and description
- [ ] Well-defined "When to Apply" section
- [ ] At least 3 practical examples
- [ ] Prioritized guidelines or rules
- [ ] Code examples with explanations
- [ ] Common pitfalls section
- [ ] Quick reference for easy scanning
- [ ] Proper frontmatter metadata
- [ ] No spelling or grammatical errors
- [ ] Tested with actual use cases
```
