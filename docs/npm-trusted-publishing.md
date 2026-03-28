# npm Trusted Publishing (OIDC)

This package is published from GitHub Actions using [Trusted Publishers](https://docs.npmjs.com/trusted-publishers) (no long-lived `NPM_TOKEN` in the repo).

## If publish fails with `E404` on `PUT .../sunsynk-node-api-client`

npm often returns **404** when the workflow is **not** authorized to publish that package (instead of 403). Fix the mapping on npmjs.com, not the token.

### Checklist (must match exactly)

1. npm: **Package** → **Settings** → **Publishing access** → **Trusted publishers**
2. **Repository**: `paul-ridgway/sunsynk-node-api-client` (GitHub owner + repo name; fix if the repo was renamed or is a fork).
3. **Workflow file**: `.github/workflows/npm-publish.yml`
4. **Environment**: leave default unless you use a GitHub Environment named in npm’s UI—then the workflow must declare that same `environment:` on the publish job.

If anything changed, **remove** the old trusted publisher entry and **add** it again with the correct values.

### CI logs

The publish workflow prints the registry URL before `npm publish`. It may also run `npm whoami`, which can return **401** with OIDC-backed tokens even when `npm publish` is correctly configured—do not treat that alone as proof of misconfiguration.

### Fallback: automation token (debug only)

To confirm the problem is **only** Trusted Publisher mapping (vs. package name, version, etc.):

1. Create a short-lived **Automation** token on npm (with publish rights to this package).
2. In the repo, add a GitHub Actions secret `NPM_TOKEN` (same name the snippet uses).
3. Add a **temporary** job or workflow (or run locally) that does **not** commit the token:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
    registry-url: https://registry.npmjs.org/
- run: npm ci && npm run build
- run: npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Use `setup-node` with `registry-url` so `NODE_AUTH_TOKEN` is written to `.npmrc` (see [setup-node](https://github.com/actions/setup-node)). Omit `--provenance` for this smoke test unless you keep OIDC for that step.

4. After a successful publish, delete the secret and remove the temporary job.

Do not leave a permanent token in place if you want OIDC-only publishing.
