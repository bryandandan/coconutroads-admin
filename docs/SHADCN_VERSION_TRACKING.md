# shadcn/ui Version Tracking Guide

This document explains how to monitor updates and stability for the shadcn/ui v4 components used in this project.

## 📋 Table of Contents

- [Understanding Our Setup](#understanding-our-setup)
- [Version Comparison](#version-comparison)
- [How to Check for Updates](#how-to-check-for-updates)
- [Stability Indicators](#stability-indicators)
- [Monthly Maintenance Routine](#monthly-maintenance-routine)
- [Component Comparison Tools](#component-comparison-tools)

---

## Understanding Our Setup

### What We're Using

This project uses **shadcn/ui v4 components** from the official repository's work-in-progress registry:

- **Source**: Official shadcn/ui GitHub repository (`/apps/v4/registry/new-york-v4/`)
- **React Version**: React 19
- **Tailwind Version**: Tailwind CSS 4
- **Status**: Canary/WIP (Work In Progress)
- **Local Playground**: `/Users/bryan/repos/playground/ui` (clone of `github.com/shadcn-ui/ui`)

### Why v4?

From `/Users/bryan/repos/playground/ui/apps/v4/README.md`:
> "This is a wip registry for the `shadcn` canary version. It has React 19 and Tailwind v4 components."

**Key Features of v4 Components:**
- ✅ React 19 function components (no `forwardRef`)
- ✅ Tailwind CSS 4 syntax
- ✅ OKLCH color system (vs HSL in v3)
- ✅ Dark mode support built-in
- ✅ Enhanced accessibility (`aria-invalid` states)
- ✅ Smart responsive behavior (`has-[>svg]:px-*`)
- ✅ `data-slot` attributes for debugging
- ✅ Better focus states (`ring-[3px]` vs `ring-1`)
- ✅ Size-specific refinements (e.g., `sm` buttons use `gap-1.5`)

---

## Version Comparison

### The Three Versions of shadcn/ui

| Feature | Stable (CLI) | Canary (CLI) | v4 Playground (Our Choice) |
|---------|-------------|--------------|---------------------------|
| **React** | 18 | 19 | 19 |
| **Tailwind** | 3 | 4 | 4 |
| **Component Style** | forwardRef | Function | Function |
| **Colors** | HSL | OKLCH | OKLCH |
| **Dark Mode** | Basic | Enhanced | Enhanced |
| **Accessibility** | Good | Better | Better |
| **CLI Command** | `npx shadcn@latest` | `npx shadcn@canary` | Manual copy |
| **Status** | Stable | Beta | WIP |
| **Availability** | Default | Opt-in | GitHub repo only |

### Example: Button Component Differences

#### Stable Version (v3)
```typescript
// Basic gap for all sizes
size: {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
}

// Simple transitions
"transition-colors focus-visible:outline-none focus-visible:ring-1"
```

#### Our Version (v4 Playground)
```typescript
// Size-specific gaps and smart padding
size: {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
  "icon-sm": "size-8",  // Extra sizes!
  "icon-lg": "size-10",
}

// Enhanced transitions and focus states
"transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50"
// Plus dark mode and aria-invalid states
```

---

## How to Check for Updates

### 1. Watch GitHub Repository (Recommended)

**Setup notifications:**
1. Visit: https://github.com/shadcn-ui/ui
2. Click **"Watch"** → **"Custom"**
3. Check **"Releases"** only
4. You'll receive email notifications for new releases

**Why this works:** All major updates are announced through GitHub releases.

### 2. Check Official Changelog

**URL:** https://ui.shadcn.com/docs/changelog

**What to look for:**
- Entries mentioning "v4", "React 19", or "Tailwind v4"
- Breaking changes or deprecations
- New component features
- Migration guides

**Frequency:** Check monthly or when you see a GitHub release notification.

### 3. Follow shadcn on X (Twitter)

**Account:** [@shadcn](https://x.com/shadcn)

**Why follow:** Major announcements like:
- v4 stability milestones
- CLI updates
- Breaking changes
- New component releases

### 4. Update Local Playground Repo

**Commands:**
```bash
# Navigate to playground repo
cd /Users/bryan/repos/playground/ui

# Fetch latest changes
git fetch origin

# View recent commits affecting v4 components
git log origin/main --oneline --since="1 month ago" -- "apps/v4/registry/new-york-v4/ui/*.tsx"

# See what changed in specific components
git log origin/main --oneline -- "apps/v4/registry/new-york-v4/ui/button.tsx"
git log origin/main --oneline -- "apps/v4/registry/new-york-v4/ui/input.tsx"

# Pull latest changes
git pull origin main

# See detailed diff of a specific component
git diff HEAD~1 apps/v4/registry/new-york-v4/ui/button.tsx
```

### 5. Use CLI Diff Command

**Check for component updates:**
```bash
# In your project directory
cd /Users/bryan/repos/bryandandan/coconutroads-admin

# Compare with canary registry (v4)
pnpm dlx shadcn@canary diff button
pnpm dlx shadcn@canary diff input
pnpm dlx shadcn@canary diff sidebar

# Note: Use @canary to check against v4, not stable v3
```

**Interpreting results:**
- `No updates found` = Your component matches the registry
- Shows diff = Upstream changes available (review before applying)

### 6. Compare Components Manually

**Quick comparison script:**
```bash
# Fetch latest official component
curl -s "https://ui.shadcn.com/r/styles/new-york/button.json" | jq -r '.files[0].content' > /tmp/official_button.tsx

# Compare with your version
diff /tmp/official_button.tsx src/components/ui/button.tsx
```

**Note:** This compares against v3 stable, not v4. Useful to see what we're ahead of.

---

## Stability Indicators

### When is v4 Stable?

Watch for these signals that v4 has moved from WIP to stable:

#### ✅ Official Announcements
- [ ] Blog post on https://ui.shadcn.com
- [ ] X (Twitter) announcement from @shadcn
- [ ] GitHub release notes mention "v4 stable"

#### ✅ Documentation Updates
- [ ] Tailwind v4 docs move from "experimental" section
- [ ] React 19 becomes default in examples
- [ ] v4 demo site (https://v4.shadcn.com) references stable

#### ✅ CLI Changes
- [ ] `npx shadcn@latest` serves v4 by default (not just `@canary`)
- [ ] `npx shadcn init` creates v4 projects by default

#### ✅ Repository Changes
- [ ] `/apps/v4/README.md` removes "wip" (work in progress) mention
- [ ] v4 registry moves to main registry path
- [ ] Major version bump (e.g., shadcn@4.0.0)

### Current Status (as of November 2025)

**Stability Assessment:** ⚠️ Canary/WIP but mostly stable

- ✅ Architecture is solid and unlikely to change
- ✅ Core components (button, input) haven't changed in weeks
- ✅ Already used by early adopters in production
- ⚠️ Still marked as "wip" in official repo
- ⚠️ Not default in CLI yet
- ⚠️ May receive refinements before stable release

**Risk Level:** **Low** - Safe for production use, minor updates expected

---

## Monthly Maintenance Routine

Run these checks once a month to stay updated:

### Quick Check (5 minutes)

```bash
#!/bin/bash
# Save as: scripts/check-shadcn-updates.sh

echo "🔍 Checking for shadcn/ui updates..."
echo ""

# 1. Update playground repo
echo "1️⃣ Updating playground repo..."
cd /Users/bryan/repos/playground/ui
git fetch origin
UPDATES=$(git log HEAD..origin/main --oneline | wc -l)
if [ $UPDATES -gt 0 ]; then
  echo "   ⚠️  $UPDATES new commits available"
  echo "   Recent changes:"
  git log HEAD..origin/main --oneline --max-count=5 -- "apps/v4/registry/new-york-v4/ui/*.tsx"
else
  echo "   ✅ Playground repo is up to date"
fi
echo ""

# 2. Check v4 component changes
echo "2️⃣ Checking v4 component changes (last 30 days)..."
V4_CHANGES=$(git log origin/main --oneline --since="30 days ago" -- "apps/v4/registry/new-york-v4/ui/*.tsx" | wc -l)
if [ $V4_CHANGES -gt 0 ]; then
  echo "   ⚠️  $V4_CHANGES commits to v4 components in last 30 days"
  git log origin/main --oneline --since="30 days ago" -- "apps/v4/registry/new-york-v4/ui/*.tsx"
else
  echo "   ✅ No v4 component changes in last 30 days"
fi
echo ""

# 3. Check latest release
echo "3️⃣ Latest shadcn release:"
curl -s https://api.github.com/repos/shadcn-ui/ui/releases/latest | jq -r '.tag_name, .name, .published_at'
echo ""

echo "4️⃣ Manual checks:"
echo "   📋 Changelog: https://ui.shadcn.com/docs/changelog"
echo "   🐦 X/Twitter: https://x.com/shadcn"
echo "   📦 Releases: https://github.com/shadcn-ui/ui/releases"
echo ""
echo "✨ Done!"
```

**Make it executable and run:**
```bash
chmod +x scripts/check-shadcn-updates.sh
./scripts/check-shadcn-updates.sh
```

### Deep Check (15 minutes)

1. **Pull latest playground changes:**
   ```bash
   cd /Users/bryan/repos/playground/ui && git pull origin main
   ```

2. **Compare key components:**
   ```bash
   diff -u /Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/ui/button.tsx \
           /Users/bryan/repos/bryandandan/coconutroads-admin/src/components/ui/button.tsx

   diff -u /Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/ui/input.tsx \
           /Users/bryan/repos/bryandandan/coconutroads-admin/src/components/ui/input.tsx
   ```

3. **Review changelog:**
   - Visit https://ui.shadcn.com/docs/changelog
   - Look for v4 mentions, breaking changes

4. **Check X/Twitter:**
   - Visit https://x.com/shadcn
   - Look for announcements in last 30 days

5. **Test CLI diff:**
   ```bash
   pnpm dlx shadcn@canary diff button
   pnpm dlx shadcn@canary diff input
   ```

---

## Component Comparison Tools

### Diff Against Official Registry

**Fetch and compare any component:**
```bash
# Usage: ./scripts/diff-component.sh <component-name>
# Example: ./scripts/diff-component.sh button

COMPONENT="$1"
curl -s "https://ui.shadcn.com/r/styles/new-york/${COMPONENT}.json" | \
  jq -r '.files[0].content' > /tmp/official_${COMPONENT}.tsx

diff -u /tmp/official_${COMPONENT}.tsx \
  src/components/ui/${COMPONENT}.tsx
```

### Compare with Playground

**Check if your component matches the v4 playground:**
```bash
# Usage: ./scripts/diff-playground.sh <component-name>
# Example: ./scripts/diff-playground.sh button

COMPONENT="$1"
diff -u /Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/ui/${COMPONENT}.tsx \
  src/components/ui/${COMPONENT}.tsx
```

### List All Components

**See which components you have:**
```bash
# In your project
ls -1 src/components/ui/*.tsx | xargs -n1 basename | sed 's/.tsx$//'

# In playground v4 registry
ls -1 /Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/ui/*.tsx | \
  xargs -n1 basename | sed 's/.tsx$//'
```

---

## Important Links

### Official Resources
- 🏠 Homepage: https://ui.shadcn.com
- 📋 Changelog: https://ui.shadcn.com/docs/changelog
- 📖 Tailwind v4 Docs: https://ui.shadcn.com/docs/tailwind-v4
- 🐦 X/Twitter: https://x.com/shadcn
- 💻 GitHub: https://github.com/shadcn-ui/ui
- 📦 Releases: https://github.com/shadcn-ui/ui/releases

### Local Paths
- 🎨 Playground Repo: `/Users/bryan/repos/playground/ui`
- 📁 v4 Components: `/Users/bryan/repos/playground/ui/apps/v4/registry/new-york-v4/ui/`
- 📋 v4 README: `/Users/bryan/repos/playground/ui/apps/v4/README.md`
- 🏗️ Project Components: `/Users/bryan/repos/bryandandan/coconutroads-admin/src/components/ui/`

---

## FAQ

### Q: Why not use the stable CLI?
**A:** The stable CLI serves React 18 + Tailwind v3 components. We're using React 19 + Tailwind v4 for better features and future-proofing.

### Q: Is v4 safe for production?
**A:** Yes. While marked "WIP", the architecture is solid and components are stable. Expect minor refinements, not major breaking changes.

### Q: What if v4 has breaking changes?
**A:**
1. You'll see them announced in the changelog and on X/Twitter
2. Migration guides will be provided (shadcn always provides these)
3. Changes will show up in your monthly checks
4. You can choose when to update (not forced)

### Q: Can I mix v3 and v4 components?
**A:** Not recommended. Stick with v4 since your project uses React 19 + Tailwind v4. v3 components won't work properly.

### Q: How do I update a component?
**A:**
1. Check what changed: `cd /Users/bryan/repos/playground/ui && git pull`
2. Review the diff: `git log -- apps/v4/registry/new-york-v4/ui/button.tsx`
3. Copy manually from playground to your project
4. Test thoroughly in your app

### Q: What's the best way to stay informed?
**A:**
1. Set up GitHub watch for releases (email notifications)
2. Run monthly check script
3. Follow @shadcn on X for major announcements

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2025-11-23 | Initial documentation | Claude |

---

**Last Updated:** November 23, 2025
**Project:** CoconutRoads Admin
**shadcn Playground Commit:** Check with `cd /Users/bryan/repos/playground/ui && git rev-parse HEAD`
