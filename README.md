# AltroAI website release

The revised marketing homepage is served at `/` and `/he/`. The package contains source code, assets, the npm lockfile, the existing Vercel configuration and server routes. It is not linked to a Vercel project and contains no environment values.

1. Review and import the source into the existing AltroAI website repository or deployment workflow.
2. Use the existing project's environment variables and deployment settings. Run `npm ci` and `npm run build`. The Vite output is `dist` and the server routes are in `api`.
3. Deploy a staging preview on the existing project. Verify the homepage in both languages, legal links and return navigation, then test contact delivery with approved test data and confirm the CRM receives it.
4. Promote the tested revision through the existing production deployment process.

The legal pages are intentionally provided in English on both routes. The separate static review link does not submit leads. No production deploy, database migration or configuration change was performed.

The ClipTov project card is included without an external link because the previous URL failed the HTTPS check.
