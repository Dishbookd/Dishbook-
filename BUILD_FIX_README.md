DishBook cloud build fix

This package adds the missing Node/Vite/Capacitor project files.

Important:
- Keep your existing app files.
- Rename INDEX.HTML to index.html because GitHub Actions runs Linux and is case-sensitive.
- Keep app.js if your current app uses it.
- The workflow should run npm install, npm run build, npx cap add android, npx cap sync android, then ./gradlew bundleRelease.
- Keep Supabase credentials in GitHub Actions repository secrets. Never put a Supabase secret/service_role key in the repository.
