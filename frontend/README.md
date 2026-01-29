## Linting & Formatting

This project uses **ESLint + Prettier** with automatic import sorting.

### Tools

- **ESLint v9 (Flat Config)** — code linting
- **Prettier** — code formatting
- **eslint-plugin-simple-import-sort** — import sorting
- **eslint-config-next** — Next.js rules

---

### Commands

Run lint checks:

```bash
npm run lint
```

Fix ESLint issues automatically (including import order):

```bash
npm run lint:fix
```

Format code (spacing, quotes, commas, line width):

```bash
npm run format
```

Editor integration
On file save:
Prettier formats the code
ESLint automatically fixes import order
Recommended VS Code settings:

```bash
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
