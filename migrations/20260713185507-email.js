module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('email_mailboxes', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['address', 'normalizedAddress', 'createdAt', 'updatedAt'],
          properties: {
            address: {
              bsonType: 'string',
              description: 'Full email address',
            },
            normalizedAddress: {
              bsonType: 'string',
              description: 'Normalized address for search and uniqueness',
            },
            displayName: {
              bsonType: 'string',
              description: 'Name displayed to the recipient',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Date of last update',
            },
          },
        },
      },
    });

    db.createCollection('email_contacts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['address', 'normalizedAddress'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Contact name',
            },
            address: {
              bsonType: 'string',
              description: 'Contact email address',
            },
            normalizedAddress: {
              bsonType: 'string',
              description: 'Normalized address for search and uniqueness',
            },
          },
        },
      },
    });

    db.createCollection('email_threads', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'mailboxId',
            'subject',
            'participants',
            'messageCount',
            'lastMessageId',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            mailboxId: {
              bsonType: 'objectId',
              description: 'ID of the mailbox to which the thread belongs',
            },
            subject: {
              bsonType: 'string',
              description: 'Subject of the first message in the thread',
            },
            participants: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of participant (contact) in the thread',
              },
              description:
                'Unique list of all participants in the thread (from, to, cc, bcc)',
            },
            messageCount: {
              bsonType: 'int',
              description: 'Number of messages in the thread',
            },
            lastMessageId: {
              bsonType: 'objectId',
              description: 'ID of the last message in the thread',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of thread creation',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Date of last update of the thread',
            },
          },
        },
      },
    });

    db.createCollection('email_messages', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'messageId',
            'threadId',
            'direction',
            'from',
            'to',
            'subject',
            'content',
            'headers',
            'dates',
          ],
          properties: {
            messageId: {
              bsonType: 'string',
              description: 'Message-ID header value',
            },
            threadId: {
              bsonType: 'objectId',
              description: 'ID of the thread to which the message belongs',
            },
            inReplyTo: {
              bsonType: 'string',
              description:
                'In-Reply-To header value (Message-ID of the parent message)',
            },
            references: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
                description: 'Message-ID header values of referenced messages',
              },
              description:
                'References header values (Message-IDs of referenced messages)',
            },
            direction: {
              bsonType: 'string',
              description: 'Message direction (incoming/outgoing)',
              enum: ['incoming', 'outgoing'],
            },
            from: {
              bsonType: 'objectId',
              description: 'Message sender',
            },
            sender: {
              bsonType: 'objectId',
              description: 'Message sender (if different from from)',
            },
            replyTo: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of contacts for Reply-To',
              },
              description: 'List of contacts for Reply-To',
            },
            to: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of contacts for To',
              },
              description: 'List of contacts for To',
            },
            cc: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of contacts for Cc',
              },
              description: 'List of contacts for Cc',
            },
            bcc: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of contacts for Bcc',
              },
              description: 'List of contacts for Bcc',
            },
            subject: {
              bsonType: 'string',
              description: 'Message subject',
            },
            content: {
              bsonType: 'object',
              description: 'Message content (text, HTML, attachments)',
              anyOf: [{ required: ['text'] }, { required: ['html'] }],
              properties: {
                text: {
                  bsonType: 'string',
                  description: 'Text version of the message',
                },
                html: {
                  bsonType: 'string',
                  description: 'HTML version of the message',
                },
              },
            },
            attachments: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID of attachments related to the message',
              },
              description: 'List of IDs of attachments related to the message',
            },
            headers: {
              bsonType: 'object',
              additionalProperties: {
                anyOf: [
                  { bsonType: 'string' },
                  { bsonType: 'array', items: { bsonType: 'string' } },
                ],
              },
              description: 'Message headers as key-value',
            },
            dates: {
              bsonType: 'object',
              required: ['headerDate', 'createdAt', 'updatedAt'],
              properties: {
                headerDate: {
                  bsonType: 'date',
                  description: 'Date from message header (Date header)',
                },
                receivedAt: {
                  bsonType: 'date',
                  description: 'Date the message was received on the server',
                },
                sentAt: {
                  bsonType: 'date',
                  description: 'Date the message was sent (if known)',
                },
                deliveredAt: {
                  bsonType: 'date',
                  description: 'Date the message was delivered (if known)',
                },
                createdAt: {
                  bsonType: 'date',
                  description:
                    'Date of creation of the message record in the database',
                },
                updatedAt: {
                  bsonType: 'date',
                  description:
                    'Date of last update of the message record in the database',
                },
              },
            },
            source: {
              bsonType: 'object',
              properties: {
                protocol: {
                  bsonType: 'string',
                  description: 'Protocol for receiving/sending',
                  enum: ['SMTP', 'IMAP', 'POP3', 'API'],
                },
                remoteIp: {
                  bsonType: 'string',
                  description: 'IP address of sender or server',
                },
                provider: {
                  bsonType: 'string',
                  description: 'Email provider (if known)',
                },
                rawMessageStorageKey: {
                  bsonType: 'string',
                  description: 'Key for storing raw message (raw message)',
                },
                rawSizeBytes: {
                  bsonType: 'int',
                  description: 'Size of raw message in bytes',
                },
              },
            },
          },
        },
      },
    });

    db.createCollection('email_attachments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['filename', 'contentType', 'disposition', 'storageKey'],
          properties: {
            filename: {
              bsonType: 'string',
              description: 'Name of the attachment file',
            },
            contentType: {
              bsonType: 'string',
              description: 'MIME type of attachment',
            },
            sizeBytes: {
              bsonType: 'int',
              description: 'Size of attachment in bytes',
            },
            disposition: {
              bsonType: 'string',
              description: 'Disposition (inline or attachment)',
              enum: ['inline', 'attachment'],
            },
            contentId: {
              bsonType: 'string',
              description:
                'Content-ID for inline attachments (if known, without angle brackets)',
            },
            storageKey: {
              bsonType: 'string',
              description: 'Key for storing attachment content',
            },
          },
          if: {
            properties: { disposition: { const: 'inline' } },
          },
          then: {
            required: ['contentId'],
          },
        },
      },
    });

    db.collection('email_mailboxes').createIndex(
      { normalizedAddress: 1 },
      { unique: true },
    );

    db.collection('email_contacts').createIndex(
      { normalizedAddress: 1 },
      { unique: true },
    );

    db.collection('email_messages').createIndex(
      { messageId: 1 },
      { unique: true },
    );
    db.collection('email_messages').createIndex({ threadId: 1 });

    db.collection('email_attachments').createIndex({ contentId: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('email_mailboxes').drop();
    await db.collection('email_contacts').drop();
    await db.collection('email_threads').drop();
    await db.collection('email_messages').drop();
    await db.collection('email_attachments').drop();
  },
};
