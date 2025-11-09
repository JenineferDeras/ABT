# CodeRabbit Commit Authorship Setup Guide

## Why Commits Show as "Jeninefer" Instead of "@coderabbit"

GitHub displays commit authorship based on:

1. **Git commit author** (name/email in the commit metadata)
2. **Git committer** (who created the commit)
3. **Push account** (who pushed to GitHub)

Your commits show as "Jeninefer" because the git configuration used your account credentials.

## Solution Overview

To make commits appear as **@coderabbit**, you need to:

1. Configure git to use CodeRabbit's identity
2. (For GitHub Actions) Use a CodeRabbit Personal Access Token (PAT) to push

---

## Option 1: Local Commits as CodeRabbit (Quick Setup)

### Automated Script

Run the provided setup script:

```bash
cd ~/Documents/GitHub/ABT
./scripts/setup-coderabbit-git.sh
```

This will configure the repository to commit as CodeRabbit.

### Manual Configuration

Set git identity for this repository only:

```bash
cd ~/Documents/GitHub/ABT
git config user.name "CodeRabbit"
git config user.email "coderabbit@users.noreply.github.com"
```

**Verify:**

```bash
git config user.name
git config user.email
```

### Make a Test Commit

```bash
# Make a change
echo "# Test commit by CodeRabbit" >> test.md

# Commit as CodeRabbit
git add test.md
git commit -m "test: verify CodeRabbit authorship"

# Push (uses your GitHub credentials, but commit author is CodeRabbit)
git push origin main
```

**Result**: The commit will show "CodeRabbit" as the author on GitHub.

---

## Option 2: GitHub Actions Commits as CodeRabbit

For automated commits from CI/CD workflows (like CodeRabbit auto-reviews), you need a Personal Access Token from the CodeRabbit GitHub account.

### Step 1: Create CodeRabbit PAT

**Note**: This requires access to the CodeRabbit GitHub account.

1. **Login to GitHub as CodeRabbit**
2. Go to: https://github.com/settings/tokens/new
3. Configure token:
   - **Note**: `ABT Repository Access`
   - **Expiration**: No expiration (or your preference)
   - **Scopes**:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows) - optional
4. Click **Generate token**
5. **⚠️ COPY THE TOKEN IMMEDIATELY** - you won't see it again!

### Step 2: Add PAT to GitHub Secrets

1. Go to: https://github.com/JenineferDeras/ABT/settings/secrets/actions
2. Click **New repository secret**
3. **Name**: `CODERABBIT_PAT`
4. **Value**: [paste the token from Step 1]
5. Click **Add secret**

### Step 3: Update GitHub Actions Workflows

Modify workflows that should commit as CodeRabbit:

#### Example: CodeRabbit Auto-Review Workflow

**File**: `.github/workflows/coderabbit.yml` (currently in workflows-disabled)

```yaml
name: CodeRabbit Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Git Identity
        run: |
          git config user.name "CodeRabbit"
          git config user.email "coderabbit@users.noreply.github.com"

      - name: Run CodeRabbit Analysis
        # Your CodeRabbit analysis steps here
        run: |
          # Analysis commands...
          echo "Analysis complete"

      - name: Commit and Push Results
        if: success()
        run: |
          git add .
          git commit -m "chore: CodeRabbit analysis results" || echo "No changes to commit"
          git push https://x-access-token:${{ secrets.CODERABBIT_PAT }}@github.com/${{ github.repository }} HEAD:${{ github.head_ref }}
```

**Key Changes:**

- Set git identity before committing
- Use `CODERABBIT_PAT` in push URL
- Push to the PR branch (`github.head_ref`)

---

## Option 3: Amend Existing Commits (Change History)

**⚠️ WARNING**: This rewrites git history. Only do this if:

- You understand the risks
- No one else has pulled/merged these commits
- You coordinate with collaborators

### Amend Last Commit

```bash
cd ~/Documents/GitHub/ABT
git commit --amend --author="CodeRabbit <coderabbit@users.noreply.github.com>" --no-edit
git push --force-with-lease origin main
```

### Amend Multiple Commits (Interactive Rebase)

```bash
# Rebase last N commits (e.g., last 5)
git rebase -i HEAD~5

# In the editor, change 'pick' to 'edit' for commits to change
# Save and close

# For each commit:
git commit --amend --author="CodeRabbit <coderabbit@users.noreply.github.com>" --no-edit
git rebase --continue

# Force push when done
git push --force-with-lease origin main
```

---

## Reverting to Your Identity

### Unset Repository-Level Config

To go back to your global git config:

```bash
git config --unset user.name
git config --unset user.email
```

### Set Back to Your Identity

```bash
git config user.name "Jeninefer Deras"
git config user.email "your-email@example.com"
```

---

## Verification Checklist

### Local Commits

- [ ] Repository git config set to CodeRabbit identity
- [ ] Test commit created and pushed
- [ ] Commit shows "CodeRabbit" as author on GitHub

### GitHub Actions

- [ ] Created PAT from CodeRabbit GitHub account
- [ ] Added `CODERABBIT_PAT` to repository secrets
- [ ] Updated workflow files to set git identity
- [ ] Updated push commands to use PAT
- [ ] Test workflow runs and commits show as CodeRabbit

---

## Troubleshooting

### Commits still show as "Jeninefer"

**Cause**: Git config not applied or using wrong email.

**Solution**:

```bash
# Check current config
git config user.name
git config user.email

# Ensure it's set for this repo
git config user.name "CodeRabbit"
git config user.email "coderabbit@users.noreply.github.com"
```

### Email not associated with CodeRabbit account

**Cause**: The email `coderabbit@users.noreply.github.com` is not verified on the CodeRabbit GitHub account.

**Solution**:

1. Login to GitHub as CodeRabbit
2. Go to: https://github.com/settings/emails
3. Verify the email or use the verified email address
4. Update git config with the verified email

### GitHub Actions push fails with 403

**Cause**: PAT doesn't have required permissions.

**Solution**:

1. Recreate PAT with `repo` scope
2. Update `CODERABBIT_PAT` secret in repository
3. Re-run the workflow

### Workflow still uses default GITHUB_TOKEN

**Cause**: Push command doesn't use the PAT.

**Solution**: Ensure push uses this format:

```bash
git push https://x-access-token:${{ secrets.CODERABBIT_PAT }}@github.com/${{ github.repository }}
```

---

## Best Practices

1. **Use repository-level config** (not global) to avoid accidentally committing as CodeRabbit in other projects:

   ```bash
   git config user.name  # NOT: git config --global user.name
   ```

2. **Verify before pushing**:

   ```bash
   git log --format="%an <%ae>" -1  # Check last commit author
   ```

3. **Use PAT securely**:
   - Never commit PAT to code
   - Store only in GitHub Secrets
   - Rotate PAT periodically

4. **Document workflow changes**:
   - Add comments explaining CodeRabbit identity setup
   - Update workflow README files

---

## Quick Reference

### Check Current Git Identity

```bash
git config user.name
git config user.email
```

### Set CodeRabbit Identity (This Repo)

```bash
git config user.name "CodeRabbit"
git config user.email "coderabbit@users.noreply.github.com"
```

### Revert to Global Identity

```bash
git config --unset user.name
git config --unset user.email
```

### View Last Commit Author

```bash
git log --format="%an <%ae>" -1
```

### Amend Last Commit Author

```bash
git commit --amend --author="CodeRabbit <coderabbit@users.noreply.github.com>" --no-edit
```

---

## Additional Resources

- [Git Configuration](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Actions: Pushing with PAT](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow)
- [Changing Commit Author](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)
