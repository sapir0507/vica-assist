# Project context

This project (vica-assist) is portfolio work used for job interviews and is hosted publicly on GitHub.
Code quality, security, and clarity matter more here than speed — assume a reviewer (interviewer) will read the code and the git history.

# Documentation

- Do not write comments that explain WHAT the code does — names should already make that clear.
- Only comment the WHY when it's non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, or behavior that would surprise a reader.
- No multi-paragraph docstrings or decorative comment blocks.
- Don't create standalone docs/markdown files unless explicitly asked.

# Code best practices

- No premature abstractions — don't add helpers, config flags, or extensibility for hypothetical future needs. Three similar lines beat a speculative abstraction.
- No dead code, no backwards-compatibility shims, no unused re-exports — if something is unused, delete it outright. ask before deleting.
- Don't add error handling/validation for cases that can't happen; validate only at real boundaries (user input, external calls).
- Keep changes scoped to the task — a bug fix shouldn't carry unrelated refactors or cleanup.

# Testing

- Favor real, meaningful tests over mocked-out shortcuts; don't mock things that could mask real breakage.
- Keep spec files in sync with the components/services they test when behavior changes.

# Plans

- For non-trivial changes, align on a plan before implementing (use Plan mode), especially when there are multiple viable approaches.
- Update the plan in place when the approach changes. also re-explain in chat only relevent changes.

# Git workflow

- Branch naming: meaningful, nested names (e.g. `feature/flight-item/date-filter`, `fix/my-hotels/upload-validation`), not generic names like `fix1` or `patch`.
- Sync workflow: create son branch to the main branch -> do changes -> go to parent branch -> fetch → rebase → merge (rebase local work on top of latest remote, avoid merge commits from stale branches).
- Never force-push or rewrite shared/published history without explicit confirmation.
- Since this repo is public on GitHub, be mindful of commit messages and PR descriptions — they're part of the portfolio presentation.

# Security

- If a vulnerability is spotted while working in an area of the code (even unrelated to the current task), flag it and fix it — don't leave known issues in place, since this is public, interview-facing code.
