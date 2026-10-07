# Project context

This project (vica-assist) is portfolio work used for job interviews and is hosted publicly on GitHub.
Code quality, security, and clarity matter more here than speed — assume a reviewer (interviewer) will read the code and the git history.

# Documentation

- Do not write comments that explain WHAT the code does — names should already make that clear.
- Only comment the WHY when it's non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, or behavior that would surprise a reader.
- No multi-paragraph docstrings or decorative comment blocks.
- Don't create standalone docs/markdown files unless explicitly asked.
- update the readme.md file of the project when it needs it

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
- Also identify areas where the project could be improved.

# Git workflow

- Branch naming: meaningful, nested names (e.g. `feature/flight-item/date-filter`, `fix/my-hotels/upload-validation`), not generic names like `fix1` or `patch`.
- Sync workflow: create son branch to the main branch -> do changes -> go to parent branch -> fetch → rebase → merge (rebase local work on top of latest remote, avoid merge commits from stale branches).
- Never force-push or rewrite shared/published history without explicit confirmation.
- Since this repo is public on GitHub, be mindful of commit messages and PR descriptions — they're part of the portfolio presentation.

# GitHub Presentation
Improve the repository presentation.

## Consider:
- README badges where appropriate
- Clear repository description
- Feature highlights
- Architecture diagram
- Screenshots
- Clean documentation hierarchy
- Table of contents if useful
- Links between README and /docs
- Clear setup instructions

# Security

- If a vulnerability is spotted while working in an area of the code (even unrelated to the current task), flag it and fix it — don't leave known issues in place, since this is public, interview-facing code.

# Bugs
- If a bug is spotted while working in an area of the code (even unrelated to the current task), flag it and fix it — don't leave known issues in place, since this is public, interview-facing code.

# Editing Rules

When modifying existing code:

- Change only what is necessary.

- Preserve unrelated behavior.

- Preserve existing public interfaces unless requested otherwise.

- Avoid cosmetic-only edits.

- Avoid unnecessary formatting churn.

- Do not remove unrelated dead code, TODOs, or comments.

- Avoid introducing new dependencies unless necessary. 

Every modified line should have a direct reason tied to the task.

# Code quality

- SOLID principles
- Separation of concerns
- Dependency injection
- Reusable abstractions
- Design patterns
- Naming conventions
- Error handling
- Validation
- Maintainability
- Scalability
- Potential technical debt

# README
- Use a clean professional structure.
- Do not write a generic marketing README.
- Explain why important architectural decisions were made.
Suggested structure:

# Project Name

Short professional description

## Overview

## Key Features

## Architecture

## Authentication & Authorization

## Application Flow

## Technology Stack

## Project Structure

## Angular Architecture

## Design & Engineering Decisions

## Security Considerations

## Validation & Error Handling

## Testing

## Getting Started 

## Configuration 

## Running the Application 

## Build 

## Code Quality 

## Known Limitations 

## Future Improvements 

## Screenshots 

## Author


# Architecture Documentation
Create a /docs directory if appropriate.
Only create documents that provide real value.

Suggested documentation:

docs/
├── architecture.md
├── authentication-and-authorization.md
├── application-flow.md
├── development.md
└── decisions.md

#Development Guide

Create:

docs/development.md

Include:

Prerequisites
Node version
Angular CLI requirements
Installation
Environment configuration
Development server
Production build
Testing
Linting
Formatting
Debugging
Common development issues

Derive commands from the repository.

Do not invent commands.