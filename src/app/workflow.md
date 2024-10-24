# Complete Application Workflow

## 1. Client Registration Process
1. Client visits the landing page
2. Clicks "Get Started" to begin registration
3. Can register using:
   - Email/Password
   - Google Sign-in
4. Basic profile created in Firebase

## 2. Search Mandate Form
1. Client fills out comprehensive form:
   - Personal Information
     - Name, email, phone
     - Address
     - Birth date
     - Nationality
     - Residence permit type
   - Current Housing Details
     - Current property manager
     - Current rent
     - Living duration
   - Financial Information
     - Professional details
     - Monthly income
     - Extraordinary charges
   - Property Search Criteria
     - Type of property
     - Locations
     - Budget
     - Required features

2. Document Upload
   - Three months of payslips
   - Prosecution record (less than 3 months old)
   - ID or residence permit
   - Optional additional documents

## 3. Payment and Account Activation
1. Client completes mandate form
2. Proceeds to payment
   - 300 CHF activation fee
   - Stripe payment integration
   - Supports cards and TWINT
3. Upon successful payment:
   - Account activated for 90 days
   - Countdown starts
   - Search mandate status updated

## 4. Admin Review and Agent Assignment
1. Admin receives notification of new mandate
2. Reviews submitted documents and information
3. Assigns client to appropriate agent based on:
   - Location
   - Property type
   - Agent workload
4. Both client and agent notified of assignment

## 5. Property Search and Matching
1. System searches across multiple sources:
   - Flatfox API integration
   - Facebook Marketplace API
   - Homegate.ch (web scraping)
2. Properties matched based on criteria:
   - Location match
   - Price range
   - Property features
   - Required amenities
3. Match scoring algorithm applied
4. High-match properties (>80%) trigger notifications

## 6. Property Viewing Process
1. Client receives property matches
2. Can request viewings through platform
3. Agent receives viewing requests
4. Agent can:
   - Accept/decline requests
   - Propose alternative times
   - Add notes to visits
5. Client receives confirmation
6. Both parties get reminders

## 7. Client-Agent Communication
1. Instant messaging system
2. File sharing capabilities
3. Notification system for:
   - New messages
   - Visit updates
   - Property matches
   - Document status

## 8. Role-Specific Features

### Client Dashboard
- Active properties matches
- Upcoming visits
- Unread messages
- Subscription status
- Document status
- Agent contact info

### Agent Dashboard
- Assigned clients list
- Property viewing schedule
- Client communications
- Document management
- Match notifications

### Admin Dashboard
- User management
- Agent-client assignments
- Mandate approval
- Subscription tracking
- System analytics

## 9. Document Management
1. Client upload system
2. Admin verification process
3. Secure storage in Firebase
4. Status tracking:
   - Pending
   - Approved
   - Rejected
5. Expiry notifications

## 10. Subscription Management
1. 90-day countdown tracking
2. Renewal notifications:
   - 14 days before expiry
   - 7 days before expiry
   - 1 day before expiry
3. Automatic access restriction on expiry
4. Renewal process via Stripe

## 11. Property Match Updates
1. Regular property scans
2. New match notifications
3. Match score calculation
4. Automated alerts for:
   - New properties
   - Price changes
   - Status updates

## 12. Visit Scheduling System
1. Client requests visit
2. Agent receives notification
3. Visit confirmation workflow
4. Calendar integration
5. Status tracking:
   - Requested
   - Confirmed
   - Completed
   - Cancelled
6. Visit notes and feedback

## 13. Security and Privacy
1. Role-based access control
2. Secure document storage
3. Data encryption
4. Privacy compliance
5. Audit logging

## 14. Third-party Integrations
1. Firebase Authentication
2. Stripe Payments
3. Property APIs
   - Flatfox
   - Facebook Marketplace
4. Calendar systems
5. Notification services

## 15. System Maintenance
1. Automated backups
2. Error logging
3. Performance monitoring
4. Usage analytics
5. Regular updates