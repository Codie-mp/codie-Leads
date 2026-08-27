# Contributing

Use a focused branch and pull request. For a feature or major change, follow the spec-kit lifecycle: constitution, specification, clarification, plan, tasks, analysis, implementation, tests, and documentation. Re-read the active `plan.md` and `tasks.md` before resuming work.

Use camelCase for variables/functions, PascalCase for components/types, small reusable components, feature-owned imports, environment configuration, parameterized SQL, and stable API contracts. Every change must include relevant tests and documentation, pass lint/type-check/build, and avoid generated caches or secrets.

Reviewers should verify behavior, tenant isolation, authorization, migrations, error leakage, responsive/accessibility impact, performance, tests, docs, rollback, and production observability. Definition of done means the change is implemented, tested, documented, reviewed, and its residual risk is explicit.
