module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('animals', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'species',
            'name',
            'sex',
            'status',
            'createdAt',
            'createdBy',
          ],
          properties: {
            species: {
              bsonType: 'string', // e.g., 'cat', 'dog'...
              description: 'Species of the animal',
            },
            name: {
              bsonType: 'string',
              description: 'Name of the animal',
            },
            sex: {
              bsonType: 'string',
              description: 'Sex of the animal (male, female, unknown)',
            },
            description: {
              bsonType: 'string',
              description: 'Description of the animal',
            },
            passportCode: {
              bsonType: 'string',
              description: 'Passport of the animal',
            },
            birthday: {
              bsonType: 'date',
              description: 'Birthday of the animal',
            },
            chipNumber: {
              bsonType: 'string',
              description: 'Chip number of the animal',
            },
            informator: {
              bsonType: 'objectId',
              description:
                'Reference to the person who provided the information about the animal',
            },
            vetMarkers: {
              bsonType: 'object',
              description: 'Veterinary markers of the animal',
              properties: {
                sterilized: {
                  bsonType: 'object',
                  description: 'Information of sterilization',
                  required: ['date'],
                  properties: {
                    date: {
                      bsonType: 'date',
                      description: 'Date of sterilization',
                    },
                    method: {
                      bsonType: 'string',
                      description: 'Method of sterilization',
                    },
                    clinic: {
                      bsonType: 'objectId',
                      description:
                        'Reference to the clinic where sterilization was done',
                    },
                  },
                },
                parasites: {
                  bsonType: 'array',
                  description: 'Array of deworming dates',
                  items: {
                    bsonType: 'object',
                    required: ['date', 'name'],
                    properties: {
                      date: {
                        bsonType: 'date',
                        description: 'Date of deworming',
                      },
                      name: {
                        bsonType: 'string',
                        description: 'Name of the deworming medication',
                      },
                    },
                  },
                },
                rabiesVaccination: {
                  bsonType: 'array',
                  description: 'Array of rabies vaccine records',
                  items: {
                    bsonType: 'object',
                    required: ['date', 'name'],
                    properties: {
                      date: {
                        bsonType: 'date',
                        description: 'Date of rabies vaccination',
                      },
                      name: {
                        bsonType: 'string',
                        description: 'Name of the rabies vaccine',
                      },
                      clinic: {
                        bsonType: 'objectId',
                        description:
                          'Reference to the clinic where vaccination was done',
                      },
                    },
                  },
                },
                virusVaccination: {
                  bsonType: 'array',
                  description: 'Array of virus vaccine records',
                  items: {
                    bsonType: 'object',
                    required: ['date', 'name'],
                    properties: {
                      date: {
                        bsonType: 'date',
                        description: 'Date of virus vaccination',
                      },
                      name: {
                        bsonType: 'string',
                        description: 'Name of the virus vaccine',
                      },
                      clinic: {
                        bsonType: 'objectId',
                        description:
                          'Reference to the clinic where vaccination was done',
                      },
                    },
                  },
                },
              },
            },
            vetTreatments: {
              bsonType: 'array',
              description: 'Array of veterinary treatments',
              items: {
                bsonType: 'object',
                required: ['complaints', 'startDate'],
                properties: {
                  complaints: {
                    bsonType: 'string',
                    description: 'Complaints leading to the treatment',
                  },
                  startDate: {
                    bsonType: 'date',
                    description: 'Start date of the treatment',
                  },
                  endDate: {
                    bsonType: 'date',
                    description: 'End date of the treatment',
                  },
                  interventions: {
                    bsonType: 'array',
                    description: 'Array of interventions during the treatment',
                    items: {
                      bsonType: 'object',
                      required: ['date', 'description'],
                      properties: {
                        date: {
                          bsonType: 'date',
                          description: 'Date of the intervention',
                        },
                        description: {
                          bsonType: 'string',
                          description: 'Description of the intervention',
                        },
                        clinic: {
                          bsonType: 'objectId',
                          description:
                            'Reference to the clinic where intervention was done',
                        },
                      },
                    },
                  },
                  medications: {
                    bsonType: 'array',
                    description: 'Array of medications',
                    items: {
                      bsonType: 'object',
                      required: ['name', 'dosage', 'startDate'],
                      properties: {
                        name: {
                          bsonType: 'string',
                          description: 'Name of the medicine',
                        },
                        dosage: {
                          bsonType: 'string',
                          description: 'Dosage of the medicine',
                        },
                        startDate: {
                          bsonType: 'date',
                          description:
                            'Start date of the medicine administration',
                        },
                        endDate: {
                          bsonType: 'date',
                          description:
                            'End date of the medicine administration',
                        },
                        clinic: {
                          bsonType: 'objectId',
                          description:
                            'Reference to the clinic where medication was prescribed',
                        },
                      },
                    },
                  },
                  summary: {
                    bsonType: 'string',
                    description: 'Summary of the treatment',
                  },
                },
              },
            },
            mainAsset: {
              bsonType: 'object',
              required: ['key', 'size', 'uploadedAt', 'originalName'],
              properties: {
                key: {
                  bsonType: 'string',
                  description: 'Storage key of the media file',
                },
                size: {
                  bsonType: 'int',
                  description: 'Size of the media file in bytes',
                },
                mimeType: {
                  bsonType: 'string',
                  description: 'MIME type of the media file',
                },
                uploadedAt: {
                  bsonType: 'date',
                  description: 'Record creation time',
                },
                originalName: {
                  bsonType: 'string',
                  description: 'Original name of the uploaded file',
                },
                checksum: {
                  bsonType: 'string',
                  description: 'Checksum of the media file',
                },
              },
            },
            observations: {
              bsonType: 'array',
              description: 'Array of observation records',
              items: {
                bsonType: 'object',
                oneOf: [
                  { required: ['date', 'note', 'createdBy', 'createdAt'] },
                  { required: ['date', 'location', 'createdBy', 'createdAt'] },
                ],
                properties: {
                  date: {
                    bsonType: 'date',
                    description: 'Date of the observation',
                  },
                  note: {
                    bsonType: 'string',
                    description: 'Observation note',
                  },
                  location: {
                    bsonType: 'object',
                    description: 'Location details of the observation',
                    required: ['address', 'coordinates'],
                    properties: {
                      address: {
                        bsonType: 'string',
                        description:
                          'Address of the location or place where the animal was found',
                      },
                      coordinates: {
                        bsonType: 'object',
                        description: 'Geographical coordinates of the location',
                        required: ['latitude', 'longitude'],
                        properties: {
                          latitude: {
                            bsonType: 'double',
                            description: 'Latitude of the location',
                          },
                          longitude: {
                            bsonType: 'double',
                            description: 'Longitude of the location',
                          },
                        },
                      },
                    },
                  },
                  assets: {
                    bsonType: 'array',
                    description:
                      'Array of media asset references for the observation',
                    items: {
                      bsonType: 'object',
                      required: ['key', 'size', 'uploadedAt', 'originalName'],
                      properties: {
                        key: {
                          bsonType: 'string',
                          description: 'Storage key of the media file',
                        },
                        size: {
                          bsonType: 'int',
                          description: 'Size of the media file in bytes',
                        },
                        mimeType: {
                          bsonType: 'string',
                          description: 'MIME type of the media file',
                        },
                        uploadedAt: {
                          bsonType: 'date',
                          description: 'Record creation time',
                        },
                        originalName: {
                          bsonType: 'string',
                          description: 'Original name of the uploaded file',
                        },
                        checksum: {
                          bsonType: 'string',
                          description: 'Checksum of the media file',
                        },
                      },
                    },
                  },
                  informator: {
                    bsonType: 'objectId',
                    description:
                      'Reference to the person who provide the information in case if there is any external person reported the summary',
                  },
                  health: {
                    bsonType: 'int',
                    description: 'Health status rating of the animal (1-10)',
                  },
                  createdBy: {
                    bsonType: 'objectId',
                    description:
                      'Reference to the volunteer who created the observation',
                  },
                  createdAt: {
                    bsonType: 'date',
                    description: 'Observation creation time',
                  },
                },
              },
            },
            status: {
              bsonType: 'string',
              description:
                'Current status of the animal (e.g., active, adopted, lost, dead)',
            },
            draft: {
              bsonType: 'bool',
              description: 'Indicates if the record is a draft',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'Reference to the volunteer who created the record',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Record creation time',
            },
          },
        },
      },
    });

    await db.createCollection('people', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'phone', 'createdAt', 'createdBy'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the person',
            },
            phone: {
              bsonType: 'string',
              description: 'Phone number of the person',
            },
            age: {
              bsonType: 'int',
              description:
                'Approximate age of the person. Just for internal use',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Record creation time',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'Reference to the volunteer who created the record',
            },
          },
        },
      },
    });

    await db.createCollection('clinics', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'name',
            'address',
            'coordinates',
            'createdAt',
            'createdBy',
          ],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the clinic',
            },
            address: {
              bsonType: 'string',
              description: 'Address of the clinic',
            },
            coordinates: {
              bsonType: 'object',
              description: 'Geographical coordinates of the clinic',
              required: ['latitude', 'longitude'],
              properties: {
                latitude: {
                  bsonType: 'double',
                  description: 'Latitude of the clinic',
                },
                longitude: {
                  bsonType: 'double',
                  description: 'Longitude of the clinic',
                },
              },
            },
            createdAt: {
              bsonType: 'date',
              description: 'Record creation time',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'Reference to the volunteer who created the record',
            },
          },
        },
      },
    });

    // chipNumber should be unique
    await db
      .collection('animals')
      .createIndex({ chipNumber: 1 }, { unique: true, sparse: true });
    // status index for faster queries by status
    await db.collection('animals').createIndex({ status: 1 });
    // createdAt index for sorting by creation date
    await db.collection('animals').createIndex({ createdAt: -1 });
    // createdBy index for queries by user
    await db.collection('animals').createIndex({ createdBy: 1 });

    await db.collection('people').createIndex({ phone: 1 }, { unique: true });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('animals').drop();
    await db.collection('people').drop();
    await db.collection('clinics').drop();
  },
};
