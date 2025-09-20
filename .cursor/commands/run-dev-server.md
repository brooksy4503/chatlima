# Run Development Server

Starts the ChatLima development server with proper pre-start checks and cleanup.

## Command

```bash
# Check if dev server is already running and kill if necessary
lsof -ti:3000 | xargs -r kill -9
pkill -f "next dev" || true

# Clear cache and start fresh dev server
pnpm dev:fresh
```

## Alternative Commands

```bash
# Standard dev server (if no conflicts)
pnpm dev

# Clear cache only
pnpm cache:clear

# Check for running processes
lsof -ti:3000
ps aux | grep "next dev"
```

## What This Does

1. **Pre-start Checks**: Kills any existing dev server processes on port 3000
2. **Process Cleanup**: Removes any hanging Next.js dev processes
3. **Cache Clear**: Clears the `.next` cache directory
4. **Fresh Start**: Starts the development server with `--turbopack` for faster builds

## Port

The development server runs on port 3000 by default. If you need a different port:

```bash
pnpm dev --port 3001
```

## Troubleshooting

If the dev server won't start:
1. Check for port conflicts: `lsof -ti:3000`
2. Clear cache manually: `pnpm cache:clear`
3. Restart terminal session
4. Check for hanging processes: `ps aux | grep "next dev"`
