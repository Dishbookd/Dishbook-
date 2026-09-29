DishBook is prepared for a GitHub Actions cloud build.

Workflow:
.github/workflows/android-build.yml

It will:
1. Install Node
2. Install dependencies
3. Inject Supabase public configuration from GitHub Secrets
4. Build the web app
5. Create the Android Capacitor project
6. Sync Android
7. Install Android API 36/build tools
8. Build a release AAB
9. Upload the AAB as a workflow artifact

For Google Play production, configure proper release signing. Do not commit a keystore or passwords.
