'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import type { EmailContactSummary } from '@app/models/email-contact-summary';

type EmailContactsManagerProps = {
  canManage: boolean;
  initialContacts: EmailContactSummary[];
};

type ContactMutationResponse = {
  contact?: EmailContactSummary;
  message: string;
  success: boolean;
};

/** Displays email contacts and controls for creating, renaming, and deleting them. */
export function EmailContactsManager({
  canManage,
  initialContacts,
}: EmailContactsManagerProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pendingContactId, setPendingContactId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<ContactMutationResponse | null>(null);

  const sortContacts = (nextContacts: EmailContactSummary[]) =>
    [...nextContacts].sort(
      (a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '') ||
        a.address.localeCompare(b.address),
    );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManage || isCreating) {
      return;
    }

    setIsCreating(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/email/contacts', {
        body: JSON.stringify({ address: newAddress, name: newName }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload = (await response.json()) as ContactMutationResponse;

      setStatus(payload);

      if (response.ok && payload.success && payload.contact !== undefined) {
        const createdContact = payload.contact;

        setContacts((currentContacts) =>
          sortContacts([...currentContacts, createdContact]),
        );
        setNewName('');
        setNewAddress('');
      }
    } catch {
      setStatus({ success: false, message: 'Failed to create contact.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (contactId: string) => {
    if (!canManage || pendingContactId !== null) {
      return;
    }

    setPendingContactId(contactId);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/email/contacts/${contactId}`, {
        body: JSON.stringify({ name: editingName }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      const payload = (await response.json()) as ContactMutationResponse;

      setStatus(payload);

      if (response.ok && payload.success && payload.contact !== undefined) {
        const updatedContact = payload.contact;

        setContacts((currentContacts) =>
          sortContacts(
            currentContacts.map((contact) =>
              contact.id === contactId ? updatedContact : contact,
            ),
          ),
        );
        setEditingContactId(null);
        setEditingName('');
      }
    } catch {
      setStatus({ success: false, message: 'Failed to update contact.' });
    } finally {
      setPendingContactId(null);
    }
  };

  const handleDelete = async (contact: EmailContactSummary) => {
    if (
      !canManage ||
      pendingContactId !== null ||
      !window.confirm(`Delete contact ${contact.address}?`)
    ) {
      return;
    }

    setPendingContactId(contact.id);
    setStatus(null);

    try {
      const response = await fetch(`/api/admin/email/contacts/${contact.id}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as ContactMutationResponse;

      setStatus(payload);

      if (response.ok && payload.success) {
        setContacts((currentContacts) =>
          currentContacts.filter(({ id }) => id !== contact.id),
        );
      }
    } catch {
      setStatus({ success: false, message: 'Failed to delete contact.' });
    } finally {
      setPendingContactId(null);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_1.35fr_auto]"
          onSubmit={(event) => void handleCreate(event)}
        >
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Name (optional)"
            type="text"
            value={newName}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            onChange={(event) => setNewAddress(event.target.value)}
            placeholder="Email address"
            required
            type="email"
            value={newAddress}
          />
          <button
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? 'Adding...' : 'Add contact'}
          </button>
        </form>
      )}

      {status !== null && (
        <p
          className={`text-sm ${
            status.success
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-red-700 dark:text-red-300'
          }`}
          role="status"
        >
          {status.message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {contacts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
            No contacts.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {contacts.map((contact) => {
              const isEditing = editingContactId === contact.id;
              const isPending = pendingContactId === contact.id;

              return (
                <div
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.35fr_auto] md:items-center"
                  key={contact.id}
                >
                  {isEditing ? (
                    <input
                      aria-label={`Name for ${contact.address}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      onChange={(event) => setEditingName(event.target.value)}
                      type="text"
                      value={editingName}
                    />
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {contact.name ?? '—'}
                    </span>
                  )}
                  <span className="break-all text-sm text-slate-600 dark:text-slate-300">
                    {contact.address}
                  </span>
                  {canManage && (
                    <div className="flex gap-2 md:justify-end">
                      {isEditing ? (
                        <>
                          <button
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                            disabled={isPending}
                            onClick={() => void handleUpdate(contact.id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                            onClick={() => setEditingContactId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                            onClick={() => {
                              setEditingContactId(contact.id);
                              setEditingName(contact.name ?? '');
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30"
                            disabled={isPending}
                            onClick={() => void handleDelete(contact)}
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
