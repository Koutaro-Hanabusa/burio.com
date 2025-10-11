# Cloudflare API Token Setup Guide

## 1. API Token Creation

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Select "Custom token"
4. Set permissions:
   ```
   Account - Cloudflare D1:Edit
   Zone - Zone:Read
   Zone - Zone Settings:Read
   ```
5. Account Resources: Include - Your Account
6. Zone Resources: Include - All zones
7. Click "Continue to summary" → "Create Token"

## 2. Update Environment Variables

After getting your token, update the following files:

### apps/server/.env
```bash
CLOUDFLARE_ACCOUNT_ID=8b507ae45219db85402c35138c953727
CLOUDFLARE_DATABASE_ID=02de547d-2aa5-4183-933a-25503971e540
CLOUDFLARE_D1_TOKEN=YOUR_GENERATED_TOKEN_HERE
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_SECRET=ABYRxhYLiXqscByhwaTEEf1QEjfbR4Nc
BETTER_AUTH_URL=http://localhost:3000
```

### apps/server/.env.production
```bash
CLOUDFLARE_ACCOUNT_ID=8b507ae45219db85402c35138c953727
CLOUDFLARE_DATABASE_ID=7390edad-195a-4da4-80a8-90209083afcc
CLOUDFLARE_D1_TOKEN=YOUR_GENERATED_TOKEN_HERE
CORS_ORIGIN=https://burio16.com
BETTER_AUTH_SECRET=ABYRxhYLiXqscByhwaTEEf1QEjfbR4Nc
BETTER_AUTH_URL=https://api.burio16.com
```

## 3. Commands to run after token setup

```bash
# Apply schema to production database
bun db:push

# Generate new migration if needed
bun db:generate

# Apply migration to production
bunx wrangler d1 migrations apply burio-com-db

# Deploy with updated settings
bun run deploy
```

## 4. Test database connection

```bash
# Test local development DB
bunx wrangler d1 execute burio-com-dev --local --env dev --command="SELECT * FROM users LIMIT 1;"

# Test production DB (after token setup)
bunx wrangler d1 execute burio-com-db --command="SELECT * FROM users LIMIT 1;"
```