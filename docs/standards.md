# Project Standards and Conventions

This document defines the conventions and standards that all team members should follow in the Burger Builder Application project.

---

## Branch Naming Convention

We use a clear and consistent branch naming structure to help the team understand the purpose of each branch.

 Type | Purpose | Example |
------|----------|----------|
 feat/ | New feature | feat/add-login-page |
 fix/ | Bug fix | fix/cart-total-bug |
 docs/ | Documentation | docs/update-readme |
 chore/ | Maintenance or config | chore/update-dockerfile |
 refactor/ | Code refactor | refactor/order-controller |
 test/ | Adding or updating tests | test/add-cart-tests |

**Rules:**
- Use lowercase letters and hyphens (-)
- Describe the branch purpose clearly
- Example: feat/add-user-authentication
- Never use spaces or underscores
- Always branch from `main`

---

## Commit Message Convention

We use Conventional Commits to keep commit messages clear and structured.

**Format:**
<type>(scope): short description

**Examples:**
feat(api): add endpoint for order creation
fix(ui): correct layout for burger preview
docs(readme): update setup instructions


**Common Types:**
| Type | Description |
|------|--------------|
| feat | A new feature |
| fix | A bug fix |
| docs | Documentation only changes |
| chore | Build or maintenance tasks |
| refactor | Code refactor (no new features or bug fixes) |
| test | Adding or modifying tests |

**Tips:**
- Keep descriptions short and written in the present tense (e.g., "add" not "added").
- Avoid long messages; describe only what the commit changes.

---

## Git Workflow

We use a simple Trunk-Based Development workflow.

1. Create a new branch from `main`
2. Make changes and commit using the convention above
3. Push the branch to GitHub
4. Open a Pull Request (PR)
5. Get at least one approval from a team member
6. Merge into `main` after all checks pass

Do not push directly to `main`.

---

## Folder Naming Convention

All folders and files use lowercase-with-hyphens.

**Examples:**
- order-service
- user-controller.js
- burger-builder-context.tsx

**Folder Structure Overview**
| Folder | Purpose |
|---------|----------|
| frontend/ | React web app |
| backend/ | API and business logic |
| docs/ | Project documentation |
| infrastructure/ | Infrastructure as Code (Terraform, etc.) |
| kubernetes/ | Kubernetes manifests |
| .github/workflows/ | CI/CD pipelines |

---

## Versioning and Tagging

We follow Semantic Versioning (SemVer):

v<MAJOR>.<MINOR>.<PATCH>

**Examples:**
| Version | Meaning |
|----------|----------|
| v1.0.0 | Initial stable release |
| v1.1.0 | Added new feature(s) |
| v1.1.1 | Fixed bugs or minor issues |

**Example Docker Tag:**
burger-api:v1.0.0


---

## Environment Naming

We use three main environments:

 Environment | Purpose |
--------------|----------|
dev | Local development and testing 
prod| Live production deployment 

Use consistent naming across Kubernetes namespaces, clusters, and pipelines.

**Example:**
burgerbuilder-dev
burgerbuilder-prod


---

## Code Style and Linting

### Frontend
- Use Prettier for formatting
- Use ESLint for code quality
- Follow TypeScript best practices

### Backend
- Use Ruff or Black for Python formatting (if Python is used)
- Keep function names descriptive and consistent

### General Rules
- No commented-out or unused code in main
- Each function should have a short comment or docstring
- Avoid long functions; keep them simple and focused

---

## Documentation Standards

Each main directory must include a `README.md` file that explains:
- What the folder contains
- How to run or test it
- Who maintains it (optional)

**Example:**
Backend
This folder contains the API code for the Burger Builder Application.
To 
run locally:
cd backend
mvn spring-boot:run


---

## Pull Request Guidelines

- Use clear PR titles:
  - [feat]: add login endpoint
  - [fix]: resolve API timeout issue
- Include a short description of what and why you changed something
- Assign at least one reviewer
- Reference related issue numbers if applicable
- Do not merge without review

---

## Summary

These conventions ensure:
- Consistency across all team members
- Easier collaboration and understanding
- Clear and readable project history
- A professional and maintainable repository structure


