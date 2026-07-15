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
              description: 'Повна email-адреса',
            },
            normalizedAddress: {
              bsonType: 'string',
              description: 'Нормалізована адреса для пошуку та унікальності',
            },
            displayName: {
              bsonType: 'string',
              description: 'Назва, яка відображається одержувачеві',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Дата створення',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Дата останнього оновлення',
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
              description: "Ім'я контакту",
            },
            address: {
              bsonType: 'string',
              description: 'Email-адреса контакту',
            },
            normalizedAddress: {
              bsonType: 'string',
              description: 'Нормалізована адреса для пошуку та унікальності',
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
              description: 'ID поштової скриньки, до якої належить тред',
            },
            subject: {
              bsonType: 'string',
              description: 'Тема першого повідомлення в треді',
            },
            participants: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID учасника (контакту) в треді',
              },
              description:
                'Унікальний список всіх учасників у треді (from, to, cc, bcc)',
            },
            messageCount: {
              bsonType: 'int',
              description: 'Кількість повідомлень у треді',
            },
            lastMessageId: {
              bsonType: 'objectId',
              description: 'ID останнього повідомлення в треді',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Дата створення треду',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Дата останнього оновлення треду',
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
              description: 'ID треду, до якого належить повідомлення',
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
              description: 'Напрямок повідомлення (вхідне/вихідне)',
              enum: ['incoming', 'outgoing'],
            },
            from: {
              bsonType: 'objectId',
              description: 'Відправник повідомлення',
            },
            sender: {
              bsonType: 'objectId',
              description:
                'Відправник повідомлення (якщо відрізняється від from)',
            },
            replyTo: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID контактів для Reply-To',
              },
              description: 'Список контактів для Reply-To',
            },
            to: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID контактів для To',
              },
              description: 'Список контактів для To',
            },
            cc: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID контактів для Cc',
              },
              description: 'Список контактів для Cc',
            },
            bcc: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID контактів для Bcc',
              },
              description: 'Список контактів для Bcc',
            },
            subject: {
              bsonType: 'string',
              description: 'Тема повідомлення',
            },
            content: {
              bsonType: 'object',
              description: 'Вміст повідомлення (текст, HTML, вкладення)',
              anyOf: [{ required: ['text'] }, { required: ['html'] }],
              properties: {
                text: {
                  bsonType: 'string',
                  description: 'Текстова версія повідомлення',
                },
                html: {
                  bsonType: 'string',
                  description: 'HTML версія повідомлення',
                },
              },
            },
            attachments: {
              bsonType: 'array',
              items: {
                bsonType: 'objectId',
                description: 'ID вкладень, пов’язаних з повідомленням',
              },
              description: 'Список ID вкладень, пов’язаних з повідомленням',
            },
            headers: {
              bsonType: 'object',
              additionalProperties: {
                anyOf: [
                  { bsonType: 'string' },
                  { bsonType: 'array', items: { bsonType: 'string' } },
                ],
              },
              description: 'Заголовки повідомлення у вигляді ключ-значення',
            },
            dates: {
              bsonType: 'object',
              required: ['headerDate', 'createdAt', 'updatedAt'],
              properties: {
                headerDate: {
                  bsonType: 'date',
                  description: 'Дата з заголовка повідомлення (Date header)',
                },
                receivedAt: {
                  bsonType: 'date',
                  description: 'Дата отримання повідомлення на сервері',
                },
                sentAt: {
                  bsonType: 'date',
                  description: 'Дата відправлення повідомлення (якщо відома)',
                },
                deliveredAt: {
                  bsonType: 'date',
                  description: 'Дата доставки повідомлення (якщо відома)',
                },
                createdAt: {
                  bsonType: 'date',
                  description:
                    'Дата створення запису повідомлення в базі даних',
                },
                updatedAt: {
                  bsonType: 'date',
                  description:
                    'Дата останнього оновлення запису повідомлення в базі даних',
                },
              },
            },
            source: {
              bsonType: 'object',
              properties: {
                protocol: {
                  bsonType: 'string',
                  description: 'Протокол отримання/відправки',
                  enum: ['SMTP', 'IMAP', 'POP3', 'API'],
                },
                remoteIp: {
                  bsonType: 'string',
                  description: 'IP-адреса відправника або сервера',
                },
                provider: {
                  bsonType: 'string',
                  description: 'Провайдер електронної пошти (якщо відомо)',
                },
                rawMessageStorageKey: {
                  bsonType: 'string',
                  description:
                    'Ключ для зберігання сирого повідомлення (raw message)',
                },
                rawSizeBytes: {
                  bsonType: 'int',
                  description: 'Розмір сирого повідомлення в байтах',
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
          required: ['filename', 'contentType'],
          properties: {
            filename: {
              bsonType: 'string',
              description: 'Ім’я файлу вкладення',
            },
            contentType: {
              bsonType: 'string',
              description: 'MIME-тип вкладення',
            },
            sizeBytes: {
              bsonType: 'int',
              description: 'Розмір вкладення в байтах',
            },
            disposition: {
              bsonType: 'string',
              description: 'Disposition (inline або attachment)',
              enum: ['inline', 'attachment'],
            },
            contentId: {
              bsonType: 'string',
              description:
                'Content-ID для inline-вкладень (якщо відомо, без кутових дужок)',
            },
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
