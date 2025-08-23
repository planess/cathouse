// In this file you can configure migrate-mongo
require('dotenv').config({ path: ['.env.local', '.env'] });

const config = {
  mongodb: {
    // Use the same MongoDB URI from environment variables
    url: process.env.MONGO_DB_URI,

    // Extract database name from URI or use default
    databaseName: process.env.MONGO_DB_NAME,

    options: {
      // MongoDB driver options - removed deprecated options
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'migration-changelog',

  // The mongodb collection where the lock will be created.
  lockCollectionName: 'migration-changelog_lock',

  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
  lockTtl: 0,

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
};

module.exports = config;
