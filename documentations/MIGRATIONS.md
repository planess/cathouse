# Database Migrations

This project uses `migrate-mongo` to manage database schema changes and keep the database up to date.

## How It Works

The system:

1. **Server-side only**: Migrations never run on the client-side for security
2. **Tracks applied migrations**: Only runs migrations that haven't been applied yet
3. **Provides rollback capability**: Each migration includes a `down` function for rollbacks
4. **Ensures consistency**: All instances of your application will have the same database structure

## Security & Architecture

### ✅ **Server-Side Execution**
- Migrations run exclusively on the server
- No client-side migration code
- Secure database operations
- Proper environment variable access

### 🔒 **Access Control**
- Migrations can only be triggered by server-side code
- API routes protected by your authentication system
- No exposure of database credentials to clients

## Environment Setup

### 1. Create Environment File
Copy `env.example` to `.env` and configure your MongoDB connection:

```bash
cp .env.example .env
```

### 2. Configure MongoDB Connection
Edit your `.env` file:

```env
# MongoDB Configuration
MONGO_DB_URI=mongodb://localhost:27017/cathouse
MONGO_DB_NAME=cathouse

# Migration Configuration (Optional)
# Set to 'true' to force migrations in development
FORCE_MIGRATIONS=false

# Node Environment
NODE_ENV=development
```

### 3. Development vs Production Behavior
- **Development**: Migrations are skipped by default (set `FORCE_MIGRATIONS=true` to enable)
- **Production**: Migrations run manually

## Migration Files

Migrations are stored in the `migrations/` directory and follow this naming convention:
```
YYYYMMDDHHMMSS-description.js
```

### Example Migration Structure

```javascript
module.exports = {
  async up(db, client) {
    // Migration logic here
    // This runs when applying the migration
  },

  async down(db, client) {
    // Rollback logic here
    // This runs when rolling back the migration
  }
};
```

## Available Commands

### Server-Side Migration Management
- **API Routes**: `/api/migrations` for programmatic access
- **Server Actions**: Direct server-side migration control
- **Admin Interface**: UI component for migration management

### Manual Migration Commands

```bash
# Check migration status
npm run migrate:status

# Run pending migrations manually
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Create a new migration
npm run migrate:create migration-name
```

## Creating New Migrations

### 1. Using the Command
```bash
npm run migrate:create add-new-feature
```

### 2. Manual Creation
Create a new file in `migrations/` with the current timestamp:
```bash
# Example filename: 20241201120000-add-new-feature.js
```

### 3. Migration Template
```javascript
module.exports = {
  async up(db, client) {
    // Your migration logic here
    // Examples:
    
    // Create collection
    await db.createCollection('newCollection');
    
    // Create indexes
    await db.collection('users').createIndex({ "field": 1 });
    
    // Insert data
    await db.collection('roles').insertOne({
      name: "newRole",
      description: "New role description"
    });
    
    // Update existing data
    await db.collection('users').updateMany(
      { role: "oldRole" },
      { $set: { role: "newRole" } }
    );
  },

  async down(db, client) {
    // Rollback logic here
    // Examples:
    
    // Drop collection
    await db.collection('newCollection').drop();
    
    // Remove indexes
    await db.collection('users').dropIndex("field_1");
    
    // Remove data
    await db.collection('roles').deleteOne({ name: "newRole" });
    
    // Revert updates
    await db.collection('users').updateMany(
      { role: "newRole" },
      { $set: { role: "oldRole" } }
    );
  }
};
```

## Best Practices

### 1. **Always Include Rollback Logic**
Every migration should have a proper `down` function that can undo the changes.

### 2. **Use Schema Validation**
When creating collections, include proper schema validation:
```javascript
await db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password"],
      properties: {
        email: { bsonType: "string" },
        password: { bsonType: "string" }
      }
    }
  }
});
```

### 3. **Create Indexes for Performance**
Add indexes for fields that are frequently queried:
```javascript
await db.collection('users').createIndex({ "email": 1 }, { unique: true });
await db.collection('users').createIndex({ "createdAt": 1 });
```

### 4. **Handle Errors Gracefully**
Use try-catch blocks and provide meaningful error messages:
```javascript
try {
  await db.collection('users').createIndex({ "email": 1 });
} catch (error) {
  console.error('Failed to create email index:', error);
  throw error;
}
```

### 5. **Test Migrations**
Always test your migrations in a development environment before applying to production.

## Server-Side Components

### Migration API Routes
Located in `src/app/api/migrations/`, provides REST endpoints for migration management:
- `GET /api/migrations` - Check migration status
- `POST /api/migrations` - Run migrations, force run, or create new migrations

### Server Actions
Located in `src/app/actions/migrations.server.ts`, provides server actions for migration management:
- `runMigrations()` - Run pending migrations
- `getMigrationStatus()` - Check migration status
- `forceRunMigrations()` - Force run migrations
- `createMigration(name)` - Create new migration file

### Admin Interface
Located in `src/app/components/admin/migration-manager/`, provides a UI for managing migrations.

## Configuration

The migration system is configured in `migrate-mongo-config.js` and uses the same MongoDB connection settings as your application:

- **Database URL**: `MONGO_DB_URI` environment variable
- **Database Name**: `MONGO_DB_NAME` environment variable (defaults to "cathouse")
- **Migrations Directory**: `migrations/`
- **Changelog Collection**: `changelog` (tracks applied migrations)

## Troubleshooting

### Migration Fails on Startup
If migrations fail when the app starts:
1. Check your MongoDB connection
2. Verify environment variables are set correctly
3. Check the console for specific error messages
4. Run `npm run migrate:status` to see migration state

### Manual Migration Required
If you need to run migrations manually:
1. Stop your application
2. Run `npm run migrate:up`
3. Check for any errors
4. Restart your application

### Rollback Issues
If you need to rollback:
1. Run `npm run migrate:down` to rollback the last migration
2. Check the database state
3. Fix any issues in your migration file
4. Run `npm run migrate:up` again

## Environment Variables

Make sure these are set in your `.env` file:
```env
MONGO_DB_URI=mongodb://localhost:27017/your-database
MONGO_DB_NAME=your-database-name
```