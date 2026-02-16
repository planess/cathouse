import { expect, test } from '@playwright/test';

test.describe('Admin roles management', () => {
  test('allows editing inherited roles and shows resolved permissions', async ({ page }) => {
    const permissions = [
      {
        _id: 'perm-manage-users',
        name: 'Manage Users',
        description: 'Create or update users',
        resource: 'user',
        action: 'manage',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        _id: 'perm-view-history',
        name: 'View History',
        description: 'View shelter history',
        resource: 'history',
        action: 'read',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        _id: 'perm-audit-data',
        name: 'Audit Data',
        description: 'Audit platform data',
        resource: 'audit',
        action: 'read',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
    ];

    let roles = [
      {
        _id: 'role-base',
        name: 'Base User',
        description: 'Read-only access',
        permissions: ['perm-view-history'],
        resolvedPermissions: ['perm-view-history'],
        inheritsFrom: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        _id: 'role-auditor',
        name: 'Auditor',
        description: 'Audit capabilities',
        permissions: ['perm-audit-data'],
        resolvedPermissions: ['perm-audit-data'],
        inheritsFrom: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        _id: 'role-manager',
        name: 'Manager',
        description: 'Manage operations',
        permissions: ['perm-manage-users'],
        resolvedPermissions: ['perm-manage-users', 'perm-view-history'],
        inheritsFrom: ['role-base'],
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
    ];

    const updateRequests: Array<{ inheritsFrom: string[]; permissions: string[] }> = [];

    await page.route('**/api/admin/permissions', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ permissions }),
        });
      }

      return route.continue();
    });

    await page.route('**/api/admin/roles*', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ roles }),
        });
      }

      if (method === 'PUT') {
        const payload = JSON.parse(request.postData() ?? '{}');
        const roleId = request.url().split('/').pop() ?? '';

        updateRequests.push(payload);

        roles = roles.map((role) => {
          if (role._id !== roleId) {
            return role;
          }

          const inheritsFrom: string[] = payload.inheritsFrom ?? [];
          const permissionsFromForm: string[] = payload.permissions ?? [];

          const inheritedPermissions = inheritsFrom.flatMap((parentRoleId) => {
            const parentRole = roles.find((candidate) => candidate._id === parentRoleId);

            return parentRole?.resolvedPermissions ?? parentRole?.permissions ?? [];
          });

          return {
            ...role,
            ...payload,
            inheritsFrom,
            permissions: permissionsFromForm,
            resolvedPermissions: Array.from(
              new Set([...permissionsFromForm, ...inheritedPermissions]),
            ),
          };
        });

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }

      return route.continue();
    });

    await page.goto('/admin/roles');

    const managerCard = page.locator('[data-role-id="role-manager"]');

    await expect(managerCard).toBeVisible();
    await expect(
      managerCard.locator('text=Audit Data(audit:read)'),
    ).toHaveCount(0);

    await managerCard.getByRole('button', { name: 'Edit' }).click();

    const inheritsSelect = page.locator('select[name="inheritsFrom"]');

    await inheritsSelect.selectOption(['role-base', 'role-auditor']);

    await page.getByRole('button', { name: 'Update Role' }).click();

    await expect.poll(() => updateRequests.length).toBe(1);
    expect(updateRequests[0].inheritsFrom.sort()).toEqual(
      ['role-base', 'role-auditor'].sort(),
    );

    await expect(
      managerCard.locator('text=Audit Data(audit:read)').first(),
    ).toBeVisible();
  });
});
