'use server';

import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { RBACService } from '@app/services/rbac.service';

import Chip from './components/chip';
import Selector from './components/selector';

export default async function Page() {
  const users = await getUserList();
  const roles = await getRoleList();

  const roleMap = new Map(
    roles.map((role) => [role._id.toString(), role.name]),
  );

  const html = [];

  for (const user of users) {
    const chips = [];

    const freeRoles = new Map(roleMap);

    const dr = addRoleFactory(user._id);

    for (const role of user.roles ?? []) {
      const dl = deleteRoleFactory(user._id, role);

      chips.push(
        <Chip
          key={role.toString()}
          label={roleMap.get(role.toString())}
          close={dl}
        />,
      );

      freeRoles.delete(role.toString());
    }

    html.push(
      <div
        key={user._id.toString()}
        className="p-3 border border-gray-300 rounded mb-2"
      >
        <div>email: {user.email}</div>
        <div>
          {chips} | <Selector list={freeRoles} attach={dr} />
        </div>
      </div>,
    );
  }

  return html;
}

async function getUserList() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  return db.collection(DbTables.users).find({}).toArray();
}

async function getRoleList() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  return db.collection(DbTables.roles).find({isActive: true}).toArray();
}

async function deleteRole(userId: ObjectId, roleId: ObjectId) {
  return RBACService.getInstance<RBACService>().removeRoleForUser(
    userId,
    roleId,
  );
}

async function addRole(userId: ObjectId, roleId: string) {
  return RBACService.getInstance<RBACService>().assignRole(
    userId,
    new ObjectId(roleId),
  );
}

function deleteRoleFactory(userId: ObjectId, roleId: ObjectId) {
  return async function() {
    'use server';

    return deleteRole(new ObjectId(userId), new ObjectId( roleId));
  };
}

function addRoleFactory(userId: ObjectId) {
  return async function(roleId: string) {
    'use server';

    return addRole(userId, roleId);
  };
}
