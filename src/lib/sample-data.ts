export const sampleAccounts = {
  admin: {
    email: 'admin@immo-rama.ch',
    password: 'admin123!',
    role: 'admin',
    displayName: 'Admin User'
  },
  agents: [
    {
      email: 'agent1@immo-rama.ch',
      password: 'agent123!',
      role: 'agent',
      displayName: 'Agent One',
      region: 'Lausanne',
      specialization: 'Residential'
    },
    {
      email: 'agent2@immo-rama.ch',
      password: 'agent123!',
      role: 'agent',
      displayName: 'Agent Two',
      region: 'Geneva',
      specialization: 'Commercial'
    }
  ],
  clients: [
    {
      email: 'client1@example.com',
      password: 'client123!',
      role: 'client',
      displayName: 'Client One',
      searchCriteria: {
        location: ['Lausanne', 'Morges'],
        minPrice: 500000,
        maxPrice: 800000,
        minRooms: 3,
        propertyType: ['apartment']
      }
    },
    {
      email: 'client2@example.com',
      password: 'client123!',
      role: 'client',
      displayName: 'Client Two',
      searchCriteria: {
        location: ['Geneva'],
        minPrice: 800000,
        maxPrice: 1200000,
        minRooms: 4,
        propertyType: ['house']
      }
    }
  ]
};

export const sampleProperties = [
  {
    title: 'Modern Apartment in Lausanne',
    description: 'Beautiful modern apartment with lake view',
    price: 650000,
    location: 'Lausanne',
    type: 'apartment',
    rooms: 3.5,
    surface: 95,
    amenities: ['balcony', 'parking', 'elevator'],
    images: [
      'https://example.com/images/property1-1.jpg',
      'https://example.com/images/property1-2.jpg'
    ],
    available: true
  },
  {
    title: 'Family House in Geneva',
    description: 'Spacious family house with garden',
    price: 1100000,
    location: 'Geneva',
    type: 'house',
    rooms: 5.5,
    surface: 180,
    amenities: ['garden', 'garage', 'fireplace'],
    images: [
      'https://example.com/images/property2-1.jpg',
      'https://example.com/images/property2-2.jpg'
    ],
    available: true
  }
];

export const sampleVisits = [
  {
    propertyId: 'property1',
    clientId: 'client1',
    agentId: 'agent1',
    date: new Date('2024-02-15T14:00:00'),
    status: 'scheduled',
    notes: 'First visit scheduled'
  },
  {
    propertyId: 'property2',
    clientId: 'client2',
    agentId: 'agent2',
    date: new Date('2024-02-16T10:00:00'),
    status: 'scheduled',
    notes: 'Follow-up visit'
  }
];

export const sampleDocuments = [
  {
    userId: 'client1',
    type: 'salary',
    status: 'pending',
    url: 'https://example.com/documents/salary1.pdf',
    name: 'Salary_Statement_2023.pdf',
    validUntil: new Date('2024-12-31')
  },
  {
    userId: 'client2',
    type: 'id',
    status: 'approved',
    url: 'https://example.com/documents/id2.pdf',
    name: 'ID_Card.pdf'
  }
];

export const sampleMessages = [
  {
    senderId: 'client1',
    receiverId: 'agent1',
    content: 'Hello, I\'m interested in scheduling a visit.',
    read: false,
    timestamp: new Date('2024-02-10T09:30:00')
  },
  {
    senderId: 'agent1',
    receiverId: 'client1',
    content: 'I\'ll check the availability and get back to you.',
    read: true,
    timestamp: new Date('2024-02-10T10:15:00')
  }
];

export const sampleSettings = {
  system: {
    maintenanceMode: false,
    registrationEnabled: true,
    maxClientsPerAgent: 10,
    visitTimeSlotDuration: 45,
    propertyMatchingThreshold: 0.7,
    documentExpirationWarningDays: 30,
    subscriptionPeriodDays: 365,
    systemAnnouncement: {
      title: 'Welcome to IMMO-RAMA',
      message: 'We\'re excited to help you find your perfect property!',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      severity: 'info'
    }
  },
  notifications: {
    visitReminder: {
      enabled: true,
      advanceNotice: 24 // hours
    },
    documentExpiration: {
      enabled: true,
      advanceNotice: 7 // days
    },
    propertyMatches: {
      enabled: true,
      frequency: 'daily'
    }
  }
};