---
name: pr-description
description: A skill for reviewing pull requests.
version: 1.0.0
author: Ajay Dangol
license: MIT 
allowed-tools:Read, Grep, Glob, Bash
model:gpt-4
---

# PR Description Criteria

Use these criteria when writing or reviewing a pull request description. Base every claim on the actual diff (`git diff main...HEAD`) and commit history, not on assumptions.

## Title

- Short (under ~70 characters), imperative mood: "Add project filter to gallery", not "Added..." or "Adds...".
- Says what changed, not which files were touched.
- Uses a conventional prefix when the repo does (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

## Required sections

### Summary
- 1–3 sentences on **what** this PR does and **why** it is needed.
- Link the related issue or ticket if there is one (`Closes #123`).

### Changes
- Bulleted list of the meaningful changes, grouped by area (e.g. UI, API, config, styles).
- Name new components, routes, or dependencies explicitly.
- Leave out trivial noise (formatting, import reordering) unless that is the point of the PR.

### Screenshots / Recordings
- Required for any visible UI change: show before/after, and mobile and desktop where layout changes.
- Write "N/A" if there is no visual change.

### How to Test
- Numbered steps a reviewer can follow to verify the change locally.
- Include setup steps (env vars, new dependencies, migrations) when needed.
- State what the expected result is.

### Checklist
- [ ] Builds and lints without errors
- [ ] Tested locally in the browser (and at mobile width for UI changes)
- [ ] No console errors or warnings introduced
- [ ] Accessibility checked (alt text, keyboard navigation, contrast) for UI changes
- [ ] No secrets, API keys, or personal data committed
- [ ] Docs/README updated if behavior or setup changed

## Optional sections (include only when relevant)

- **Breaking changes** — what breaks and how to migrate.
- **Performance impact** — bundle size, load time, or Lighthouse score changes.
- **Follow-ups / Known limitations** — work deliberately left out of this PR.
- **Notes for reviewers** — specific areas to focus on or decisions you want challenged.

## Quality rules

- Be specific and factual; avoid vague phrases like "various fixes" or "some improvements".
- Keep it scannable: headings, bullets, and short sentences over long paragraphs.
- Don't restate the diff line by line; explain intent and impact.
- If the PR does more than one unrelated thing, recommend splitting it.
- Flag anything the description claims that the diff does not support.

## Template

```markdown
## Summary
<what and why>

Closes #<issue>

## Changes
- 

## Screenshots
<before/after or N/A>

## How to Test
1. 

## Checklist
- [ ] Builds and lints without errors
- [ ] Tested locally (desktop + mobile)
- [ ] No console errors
- [ ] Accessibility checked
- [ ] No secrets committed
- [ ] Docs updated if needed
```
