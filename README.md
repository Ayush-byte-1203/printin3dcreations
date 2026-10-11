# PrintIN3D Creations

React storefront with server-rendered catalog pages on Vercel and a separately
hosted Django catalog API on PythonAnywhere. The live catalog and uploaded media
remain owned by that backend.

## Frontend

Use Node 22.12 or later. Run `npm ci`, `npm start`, or `npm run build`.
The build uses Vite and creates `build/` plus the server renderer in `server/`.
Source maps are disabled. Run `npm test`, `npm run test:seo`, and
`npm run test:security` before release.

The admin gateway uses same-origin HttpOnly cookies and CSRF checks. Existing
browser-readable admin tokens are removed on startup. Use a real staff account;
there are no default passwords or offline authentication bypasses.

## Backend

Read `SECURITY_DEPLOYMENT.txt` before deploying backend changes. Back up the live
database and media. Do not overwrite the database or run the demo seeder against
production. Backend deployment, environment secret rotation and authenticator
enrollment are separate from the Vercel frontend deployment.

Use a private `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, and enroll staff
before enabling `DJANGO_REQUIRE_ADMIN_MFA=true`. Never put secrets in this repo.
For local tests only, use `DJANGO_DEBUG=true` and run
`python manage.py test api.tests` from `django_backend/`.
