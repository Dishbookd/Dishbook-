# DishBook

DishBook is a food-recipe sharing app.

## Included
- Android project using Capacitor
- Recipe home feed
- Search
- Categories
- Recipe details
- Add/upload recipe form
- Supabase database/storage configuration
- Play Store preparation files

## What you need
1. Node.js 20+
2. Android Studio
3. A Supabase project
4. Your Supabase URL and anon key
5. A Google Play Console account for publishing

## Run
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Then build an Android App Bundle in Android Studio.

Before release, put your real Supabase values in `.env` and replace the placeholder app icon if desired.
