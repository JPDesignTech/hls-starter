# Monorepo Migration Guide

This document details the migration from a single Next.js application to a pnpm + Turborepo monorepo structure.

## What Changed?

### Before (Single App)
```
hls-starter/
├── app/
├── components/
├── lib/
├── public/
├── package.json
└── tsconfig.json
```

### After (Monorepo)
```
hls-starter/
├── apps/
│   └── web/              # Main Next.js app (all previous code)
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       └── package.json  # App-specific dependencies
├── packages/             # For future shared packages
├── pnpm-workspace.yaml  # Workspace configuration
├── turbo.json           # Task pipeline & caching
├── .eslintrc.cjs        # Shared linting rules
├── prettier.config.js   # Shared formatting rules
├── tsconfig.base.json   # Base TypeScript config
└── package.json         # Root workspace scripts
```

## Key Changes

### 1. File Structure
- **Moved**: All application code to `apps/web/`
- **Created**: Workspace configuration files at root
- **Preserved**: All functionality remains the same

### 2. Package Manager
- **Before**: Any package manager (npm/yarn/pnpm)
- **After**: pnpm with workspaces (required)
- **Why**: Better dependency management, faster installs, workspace support

### 3. Scripts
- **Before**: `npm run dev`, `npm run build`
- **After**: `pnpm dev`, `pnpm build` (runs via workspace filter)

### 4. Dependencies
- **Root**: Development tools (eslint, prettier, turbo, husky)
- **apps/web**: Application dependencies (next, react, etc.)

## New Developer Tools

### 1. ESLint (Strict Type-Checking)
- **Location**: `.eslintrc.cjs`
- **Features**:
  - TypeScript type-checked rules
  - Consistent import style enforcement
  - Unused variable warnings
  - React 19 compatible rules

### 2. Prettier
- **Location**: `.prettierrc`, `prettier.config.js`
- **Features**:
  - Automatic code formatting
  - Tailwind CSS class sorting
  - Consistent style across codebase

### 3. Turborepo
- **Location**: `turbo.json`
- **Features**:
  - Intelligent build caching
  - Task pipeline orchestration
  - 3-10x faster repeat builds
  - Parallel task execution

### 4. Husky Pre-commit Hooks
- **Location**: `.husky/pre-commit`
- **Checks**:
  - Code formatting (`turbo run format:check`) - cached by Turbo
  - Linting rules (`turbo run lint`) - cached by Turbo
  - Blocks commits if checks fail
- **Benefits**:
  - First run: Full checks
  - Subsequent runs: Only checks changed files (Turbo cached)
  - Dramatically faster pre-commit checks

## Command Changes

### Old Commands
```bash
npm install
npm run dev
npm run build
npm run start
```

### New Commands
```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run linter
pnpm typecheck        # Type-check code
pnpm format:check     # Check formatting
pnpm format:write     # Auto-format code

# Turborepo (with caching)
pnpm turbo:build      # Cached build
pnpm turbo:lint       # Cached lint
pnpm turbo:type-check # Cached type-check
```

## Migration Benefits

### 1. Scalability
- Easy to add new applications (mobile, desktop, admin)
- Shared packages for common code
- Independent versioning per app

### 2. Performance
- Turborepo caching speeds up builds
- pnpm hardlinks reduce disk usage
- Parallel task execution

### 3. Code Quality
- Strict linting prevents bugs
- Automatic formatting ensures consistency
- Pre-commit hooks catch issues early

### 4. Developer Experience
- Clear workspace structure
- Consistent tooling across team
- Better IDE integration

## Breaking Changes

### None for Application Code
- All application code works exactly the same
- Import paths unchanged (`@/*` aliases still work)
- API routes, components, all preserved

### New Requirements
1. **pnpm**: Must use pnpm instead of npm/yarn
   ```bash
   npm install -g pnpm@9.15.0
   ```

2. **Git Hooks**: Husky runs pre-commit checks
   - Can skip with `git commit --no-verify` (not recommended)

3. **Code Formatting**: Prettier enforces style
   - Run `pnpm format:write` to auto-fix

## Troubleshooting

### "Cannot find module" errors
**Solution**: Run `pnpm install` to properly link workspace packages

### Pre-commit hook failures
**Solution**: 
1. Fix linting errors: `pnpm lint`
2. Fix formatting: `pnpm format:write`
3. Then commit again

### Turborepo cache issues
**Solution**: Clear cache and rebuild
```bash
rm -rf .turbo
pnpm turbo:build
```

### Type-checking errors
**Solution**: The monorepo uses stricter TypeScript rules. Fix errors or temporarily adjust rules in `.eslintrc.cjs`

## Future Enhancements

### Planned Additions
1. **Shared Packages**:
   - `@hls-starter/shared`: Common utilities
   - `@hls-starter/types`: Shared TypeScript types
   - `@hls-starter/config`: Shared configurations

2. **Additional Apps**:
   - Mobile app (React Native / Capacitor)
   - Desktop app (Electron)
   - Admin dashboard

3. **CI/CD Optimization**:
   - Turbo Remote Cache
   - Parallel test execution
   - Affected package detection

## Questions?

If you encounter issues or have questions:
1. Check this guide first
2. Review the main [README.md](README.md)
3. Check Turborepo docs: https://turbo.build/repo/docs
4. Check pnpm docs: https://pnpm.io/workspaces

## Summary

✅ **What stayed the same**: All application code, functionality, and features  
🆕 **What's new**: Better tooling, stricter quality checks, monorepo structure  
📈 **Benefits**: Faster builds, better DX, easier scaling, consistent code quality
