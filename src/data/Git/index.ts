import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Branching & Merging',
    questions: [
      {
        q: 'Explain Git branching strategies: GitFlow, Trunk-Based, GitHub Flow.',
        a: `<pre><code># GITFLOW: Structured, release-oriented
# Branches:
#   main/master — production-ready code
#   develop — integration branch for features
#   feature/* — new features (branch from develop)
#   release/* — prep for release (branch from develop)
#   hotfix/* — urgent fixes (branch from main)

# Flow:
# 1. feature/login → develop (merge when done)
# 2. develop → release/1.2.0 (stabilize, bug fixes)
# 3. release/1.2.0 → main + develop (tag release)
# 4. hotfix/security-patch → main + develop (emergency)

# Pros: Clear structure, multiple versions in production
# Cons: Complex, slow for CI/CD, merge conflicts accumulate

# TRUNK-BASED DEVELOPMENT: Simple, CI/CD focused
# Everyone commits to main (trunk) daily
# Short-lived branches (&lt; 1-2 days)
# Feature flags for incomplete features
# Flow: feature/x → main (frequently, small PRs)

# Pros: Fast feedback, fewer conflicts, enables CD
# Cons: Requires feature flags, good CI, discipline

# GITHUB FLOW: Simplified GitFlow
# Only main + feature branches
# 1. Branch from main
# 2. Commit, push, open PR
# 3. Review + CI checks
# 4. Merge to main → deploy

# When to use:
# GitFlow → Multiple release versions, mobile apps, enterprise
# Trunk-Based → SaaS, microservices, mature CI/CD
# GitHub Flow → Web apps, small teams, continuous deployment</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Merge vs Rebase: When to use each? What are the trade-offs?',
        a: `<pre><code># MERGE: Creates a merge commit (preserves branch history)
git checkout main
git merge feature/login
# Creates: A-B-C-D-E-M (M = merge commit with two parents)
#              \     /
#               F-G-H (feature commits)

# REBASE: Replays commits on top of target (linear history)
git checkout feature/login
git rebase main
# Creates: A-B-C-D-E-F'-G'-H' (linear! F' G' H' are NEW commits)
# Original F, G, H are abandoned (different SHA)

# INTERACTIVE REBASE: Edit/squash/reorder commits before merging
git rebase -i main
# pick abc1234 Add login form
# squash def5678 Fix typo        → Squashes into previous
# reword ghi9012 WIP             → Edit commit message
# drop jkl3456 Debug logging     → Remove commit entirely

# When to MERGE:
# - Public/shared branches (main, develop)
# - Want to preserve full history and branch points
# - Collaborative feature branches (multiple contributors)
# - Never rebase public history!

# When to REBASE:
# - Before merging feature into main (clean linear history)
# - Updating feature branch with latest main changes
# - Squashing messy commits before PR
# - Personal branches only!

# Golden Rule: NEVER rebase commits that others have based work on!
# git push --force after rebase → overwrites remote history → breaks colleagues

# Safe force push (with lease):
git push --force-with-lease  # Fails if remote has new commits you haven't seen

# Squash merge (PR option):
git merge --squash feature/login  # All feature commits → one commit on main
git commit -m "feat: add login"   # Clean history, lose individual commits</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to resolve merge conflicts? Best practices.',
        a: `<pre><code># Conflict markers:
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (current branch — yours)
const timeout = 5000;
=======
const timeout = 10000;
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/performance (incoming branch — theirs)

# Resolution steps:
# 1. Understand both changes (read context!)
# 2. Edit file: remove markers, keep correct code
# 3. git add resolved-file.ts
# 4. git commit (or git rebase --continue)

# Conflict resolution strategies:
git checkout --ours path/to/file    # Keep current branch version
git checkout --theirs path/to/file  # Keep incoming branch version
git merge --abort                    # Cancel merge entirely
git rebase --abort                   # Cancel rebase entirely

# Prevention best practices:
# 1. Rebase feature branch on main frequently (small conflicts)
# 2. Keep PRs small and focused
# 3. Communicate about shared files
# 4. Use .gitattributes for merge strategies:
*.lock merge=ours          # Always keep our version for lock files
# 5. Avoid reformatting unrelated code in PRs

# Three-way merge (how Git merges):
# Base (common ancestor) + Ours + Theirs → Result
# If only one side changed a section → take that change (auto-merge)
# If both sides changed same section → CONFLICT

# After resolving:
git add .
git commit  # For merge
# OR
git rebase --continue  # For rebase

# Tools: VS Code merge editor, IntelliJ merge tool, Beyond Compare
# git mergetool → opens configured tool for each conflict</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Git Internals',
    questions: [
      {
        q: 'Explain Git object model: blobs, trees, commits, refs.',
        a: `<pre><code># Git is a content-addressable filesystem. Everything is objects.

# BLOB: File content (no filename!). SHA-1 hash of content.
git hash-object -w file.txt  # Store file, get SHA
# Same content → same hash (deduplication!)

# TREE: Directory listing. Maps filenames → blobs/trees
# tree abc123
#   blob 1a2b3c  README.md
#   blob 4d5e6f  index.ts
#   tree 7g8h9i  src/

# COMMIT: Snapshot. Points to tree + parent commit(s) + metadata
# commit def456
#   tree: abc123 (root tree of this snapshot)
#   parent: 789xyz (previous commit)
#   author: Alice &lt;alice@example.com&gt; 1705000000 +0000
#   committer: Alice &lt;alice@example.com&gt; 1705000000 +0000
#   message: Add feature X

# REF: Named pointer to a commit
# .git/refs/heads/main → abc123 (branch = pointer to latest commit)
# .git/refs/tags/v1.0 → def456 (tag = pointer to specific commit)
# .git/HEAD → ref: refs/heads/main (current branch)

# Inspect objects:
git cat-file -t abc123  # Type (blob, tree, commit, tag)
git cat-file -p abc123  # Pretty-print content

# Storage:
# Loose objects: .git/objects/ab/c123... (one file per object)
# Packfiles: .git/objects/pack/ (compressed, delta-encoded)
# git gc → packs loose objects, garbage collects unreachable objects

# Key insight: Commits are IMMUTABLE. "Changing history" creates NEW objects.
# Amend, rebase, reset → old commits still exist until garbage collected.</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain HEAD, detached HEAD, and how refs work.',
        a: `<pre><code># HEAD: Pointer to current position in history
cat .git/HEAD
# Normal: ref: refs/heads/main (attached to branch)
# Detached: abc123def456... (pointing directly to commit)

# Detached HEAD: Not on any branch
git checkout abc1234      # Checkout specific commit → detached!
git checkout v2.0         # Checkout tag → detached!
# WARNING: Commits made in detached HEAD are "orphaned" (no branch points to them)
# Fix: git checkout -b new-branch (create branch from current position)

# Relative refs:
HEAD~1  # Parent of HEAD (same as HEAD^)
HEAD~3  # 3 commits before HEAD
HEAD^2  # Second parent (for merge commits — the merged branch)

# Reflog: History of where HEAD/branches have pointed (local only!)
git reflog
# abc1234 HEAD@{0}: commit: Add feature
# def5678 HEAD@{1}: checkout: moving from main to feature
# ghi9012 HEAD@{2}: commit: Previous commit

# Recover "lost" commits:
git reflog  # Find the commit SHA
git checkout -b recovery abc1234  # Create branch at that commit

# Refs storage:
# .git/refs/heads/ → branch tips
# .git/refs/tags/ → tags
# .git/refs/remotes/origin/ → remote tracking branches
# .git/packed-refs → packed refs (optimization for many refs)

# Symbolic refs:
git symbolic-ref HEAD refs/heads/main  # Point HEAD to branch
# Useful for scripting (programmatically switch branch)</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Advanced Operations',
    questions: [
      {
        q: 'Explain git reset vs git revert vs git checkout.',
        a: `<pre><code># git reset: Move branch pointer backward (DESTRUCTIVE for shared branches!)
git reset --soft HEAD~1   # Undo commit. Changes stay STAGED.
git reset --mixed HEAD~1  # Undo commit. Changes stay UNSTAGED. (default)
git reset --hard HEAD~1   # Undo commit. Changes DISCARDED! (dangerous!)

# When to use reset:
# - Undo local commits (before push)
# - Unstage files: git reset HEAD file.txt
# - Start over: git reset --hard origin/main

# git revert: Create NEW commit that undoes a previous commit (SAFE!)
git revert abc1234        # Creates new commit undoing abc1234
git revert HEAD~3..HEAD   # Revert last 3 commits (one revert each)
git revert -m 1 merge123  # Revert a merge commit (-m 1 = keep main parent)

# When to use revert:
# - Undo commits on shared/public branches (preserves history!)
# - Undo a merge that caused issues
# - Need audit trail of the undo

# git checkout (vs git switch/restore):
git checkout branch-name  # Switch branches (modern: git switch)
git checkout -- file.txt  # Restore file from HEAD (modern: git restore)
git checkout abc123       # Detached HEAD at commit

# Modern equivalents (Git 2.23+):
git switch branch-name    # Switch branches
git restore file.txt      # Restore file from HEAD
git restore --staged f.txt # Unstage file

# Decision tree:
# "Undo pushed commit" → git revert
# "Undo local commit" → git reset --soft (keep changes) or --hard (discard)
# "Discard local changes to file" → git restore file.txt
# "Undo staging" → git restore --staged file.txt</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How does cherry-pick work? When to use it?',
        a: `<pre><code># Cherry-pick: Apply a specific commit to current branch
git cherry-pick abc1234   # Apply commit abc1234 to current branch

# How it works:
# 1. Computes the diff of the cherry-picked commit (commit vs its parent)
# 2. Applies that diff to current HEAD
# 3. Creates NEW commit with same changes (different SHA!)

# Multiple commits:
git cherry-pick abc1234 def5678 ghi9012  # Multiple specific commits
git cherry-pick abc1234..def5678          # Range (exclusive of first)
git cherry-pick abc1234^..def5678         # Range (inclusive of first)

# Cherry-pick options:
git cherry-pick --no-commit abc1234  # Apply changes without committing
git cherry-pick -x abc1234           # Add "cherry picked from" to message
git cherry-pick --abort              # Cancel in-progress cherry-pick

# When to use:
# 1. Hotfix: Apply specific bug fix from develop to main
# 2. Backport: Apply feature commit to older release branch
# 3. Extract: Pull specific commits from a messy branch
# 4. Split: When a branch has mixed changes, pick only relevant ones

# When NOT to use:
# - Copying many sequential commits → use merge or rebase instead
# - Regular workflow → leads to duplicate commits, confusion
# - Already merged branch → conflicts likely

# Cherry-pick conflicts:
# Same resolution as merge conflicts
git cherry-pick abc1234
# CONFLICT! Resolve...
git add resolved-file.txt
git cherry-pick --continue</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain git stash, worktrees, and bisect.',
        a: `<pre><code># GIT STASH: Temporarily save uncommitted changes
git stash                    # Stash tracked modified + staged
git stash -u                 # Include untracked files
git stash -m "WIP: login"   # With message
git stash list               # Show all stashes
git stash pop                # Apply latest + remove from stash
git stash apply stash@{2}   # Apply specific stash (keep in list)
git stash drop stash@{0}    # Delete specific stash
git stash show -p stash@{0} # Show diff of stash

# Use cases: Quick branch switch, pull with local changes, interrupt workflow

# GIT WORKTREES: Multiple working directories for same repo
git worktree add ../hotfix-branch hotfix/critical
# Now: work on hotfix in ../hotfix-branch while main work stays in original dir
git worktree list            # Show all worktrees
git worktree remove ../hotfix-branch

# Use cases:
# - Work on hotfix without stashing current work
# - Compare branches side by side
# - Run tests on another branch while coding
# - CI: check out multiple branches simultaneously

# GIT BISECT: Binary search for bug-introducing commit
git bisect start
git bisect bad               # Current commit is broken
git bisect good v1.0         # v1.0 was working
# Git checks out middle commit...
git bisect good              # This commit is OK
# Git narrows range, checks out next middle...
git bisect bad               # This one is broken!
# ... repeat until:
# "abc1234 is the first bad commit"
git bisect reset             # Go back to original HEAD

# Automated bisect:
git bisect start HEAD v1.0
git bisect run npm test      # Automatically run tests at each step!
# Finds exact commit that broke tests — no manual intervention!

# Pro tip: bisect with script for complex checks:
git bisect run ./check-bug.sh  # Script exits 0 (good) or 1 (bad)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Git Hooks & Workflows',
    questions: [
      {
        q: 'What are Git hooks? How to use them for CI/CD?',
        a: `<pre><code># Git Hooks: Scripts triggered at specific Git events
# Location: .git/hooks/ (local) or managed via tools like Husky

# Client-side hooks:
# pre-commit:    Before commit (lint, format, tests)
# prepare-commit-msg: After default message, before editor
# commit-msg:    Validate commit message format
# pre-push:      Before push (full test suite)
# post-checkout: After git checkout (install deps, notify)
# post-merge:    After merge (install deps if package.json changed)

# Server-side hooks:
# pre-receive:   Before accepting push (enforce policies)
# update:        Like pre-receive but per-branch
# post-receive:  After push accepted (trigger CI/CD, deploy)

# Example pre-commit hook (shell):
#!/bin/sh
# Run linter on staged files
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$')
if [ -n "$FILES" ]; then
    npx eslint $FILES || exit 1
fi

# Commit message validation (commit-msg hook):
#!/bin/sh
MSG=$(cat "$1")
PATTERN="^(feat|fix|docs|refactor|test|chore)(\(.+\))?: .{1,72}$"
if ! echo "$MSG" | grep -qE "$PATTERN"; then
    echo "ERROR: Commit message must match Conventional Commits format!"
    echo "Example: feat(auth): add login endpoint"
    exit 1
fi

# Husky (modern hook management — shared via package.json):
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
# lint-staged: Only lint/format files that are staged
# Package.json:
# "lint-staged": { "*.ts": ["eslint --fix", "prettier --write"] }

# Skip hooks (emergency):
git commit --no-verify -m "hotfix: urgent"
git push --no-verify</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Best practices for Git in team environments.',
        a: `<pre><code># COMMIT MESSAGES — Conventional Commits:
# type(scope): description
# feat(auth): add OAuth2 login flow
# fix(api): handle null response from payment gateway
# refactor(db): extract query builder utility
# Types: feat, fix, docs, style, refactor, perf, test, chore, ci

# PR BEST PRACTICES:
# 1. Small PRs (&lt; 400 lines changed)
# 2. One concern per PR (don't mix refactor with feature)
# 3. Descriptive title + body (what, why, how)
# 4. Self-review before requesting others
# 5. Include tests
# 6. Screenshots for UI changes

# BRANCH NAMING:
# feature/JIRA-123-add-login
# bugfix/JIRA-456-fix-null-pointer
# hotfix/critical-security-patch
# chore/update-dependencies

# .gitignore ESSENTIALS:
node_modules/
.env
.env.local
*.log
dist/
build/
.idea/
.DS_Store
*.class
target/

# .gitattributes (consistent line endings):
* text=auto
*.sh text eol=lf
*.bat text eol=crlf
*.png binary
*.jar binary

# MONOREPO PRACTICES:
# - CODEOWNERS file: Auto-assign reviewers per directory
# - Path-based CI: Only test what changed
# - Conventional commits with scopes: feat(payment): ...
# /docs/CODEOWNERS:
# /backend/ @backend-team
# /frontend/ @frontend-team
# *.sql @dba-team

# SECURITY:
# - Never commit secrets (use .env + .gitignore)
# - git-secrets or trufflehog to scan for leaked credentials
# - Signed commits: git commit -S (GPG)
# - Protected branches: Require reviews, CI pass, no force push</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
];

export default sections;
