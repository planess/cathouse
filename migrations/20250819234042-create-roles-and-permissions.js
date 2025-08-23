module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Create roles collection
    await db.createCollection('roles', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "description", 'permissions', 'isActive', "createdAt"],
          properties: {
            name: { bsonType: "string" },
            description: { bsonType: "string" },
            permissions: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            isActive: { bsonType: "bool" },
            createdAt: { bsonType: "date" }
          }
        }
      }
    });

    // Create permissions collection
    await db.createCollection('permissions', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "description", "resource", "action", "createdAt", "isActive"],
          properties: {
            name: { bsonType: "string" },
            description: { bsonType: "string" },
            resource: { bsonType: "string" },
            action: { bsonType: "string" },
            isActive: { bsonType: "bool" },
            createdAt: { bsonType: "date" }
          }
        }
      }
    });

    // Create indexes
    await db.collection('roles').createIndex({ "name": 1 }, { unique: true });
    await db.collection('roles').createIndex({ "isActive": 1 });
    await db.collection('permissions').createIndex({ "name": 1 }, { unique: true });
    await db.collection('permissions').createIndex({ "resource": 1 });
    await db.collection('permissions').createIndex({ "action": 1 });

    // Insert default roles and permissions
    const defaultPermissions = [
      {
        name: "user:read",
        description: "Read user information",
        resource: "user",
        action: "read",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "user:write",
        description: "Create and update user information",
        resource: "user",
        action: "write",
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "admin:all",
        description: "Full administrative access",
        resource: "admin",
        action: "all",
        isActive: true,
        createdAt: new Date()
      }
    ];

    const defaultRoles = [
      {
        name: "user",
        description: "Standard user role",
        permissions: ["user:read"],
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "admin",
        description: "Administrator role",
        permissions: ["user:read", "user:write", "admin:all"],
        isActive: true,
        createdAt: new Date()
      }
    ];

    await db.collection('permissions').insertMany(defaultPermissions);
    await db.collection('roles').insertMany(defaultRoles);

    console.info('Roles and permissions collections created with default data');
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Rollback: drop the collections
    await db.collection('roles').drop();
    await db.collection('permissions').drop();

    console.info('Roles and permissions collections dropped');
  }
};
