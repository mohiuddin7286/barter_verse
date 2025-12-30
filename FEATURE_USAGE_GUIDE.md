# 🚀 Quick Start Guide - New Features

## Feature 1: Data Protection & Privacy 🔐

### How to Use
1. Navigate to **Settings** → **Privacy & Data Protection**
2. Choose one of the following:

#### Export Your Data (GDPR)
- Click **📥 Export Data**
- A JSON file with all your data will download
- Includes: Profile, listings, trades, transactions, activity logs

#### Delete Your Account
- Scroll to **Delete Account** section
- Click **Delete Account**
- Enter your password to confirm
- Your account will be anonymized (not deleted)
- All personal info will be removed

#### View Activity Log
- Check the **Account Activity Log** table
- See all login attempts, trades, messages, etc.
- Timestamps and action results included

---

## Feature 2: Location-Based Matching 🗺️

### Setup Your Location
**Option A: Browser GPS**
1. Go to **Explore** → **Location Matching**
2. Click **📍 Use Current Location**
3. Allow browser to access your location
4. Your coordinates will be auto-filled

**Option B: Manual City/Country**
1. Enter your city name (e.g., "Bangalore")
2. Enter your country (e.g., "India")
3. Click **💾 Save Location**

### Find Nearby Traders
1. Set your location first
2. Select **Search Type**: "Nearby Traders"
3. (Optional) Enter category (e.g., "photography")
4. Adjust radius (1-500 km)
5. Click **🔍 Search**
6. View traders with their:
   - Distance from you
   - Rating
   - Skills/listings they offer

### Find Nearby Listings
1. Set your location first
2. Select **Search Type**: "Nearby Listings"
3. (Optional) Enter category filter
4. Click **🔍 Search**
5. View listings within your radius sorted by distance

---

## Feature 3: Skill Session Scheduling 📅

### Create a Session (as Skill Provider)
1. Go to **Skill Sessions**
2. Click **➕ New Session**
3. Fill in:
   - **Participant User ID** - Who you're teaching
   - **Skill Title** - What you're teaching (e.g., "Photography Basics")
   - **Date/Time** - When the session will be
   - **Duration** - Length in minutes (30-480)
   - **Location** - Physical address or "Online"
   - **Meeting Link** - Zoom/Google Meet link (if online)
4. Click **✅ Create Session**

### View Your Sessions
- **As Provider**: See all sessions where you're teaching
- **As Participant**: See all sessions where you're learning
- **All Sessions**: See everything

### During a Session
1. When the session time comes:
2. Click **Start Session** to mark it as in-progress
3. Complete the skill share/training
4. Click **Mark Complete** when done

### After a Session
1. Rate the session (1-5 stars)
2. Leave feedback (optional)
3. Submit feedback
4. The other person can see your rating

---

## Feature 4: Direct Messaging 💬

### Start a New Conversation
1. Go to **Messages** section
2. Click **➕ New Chat**
3. Enter the other user's **User ID**
4. Click ✓ to start

### Send a Message
1. Select a conversation from the left
2. Type your message in the input box
3. Click **Send** or press Enter
4. Message appears immediately

### View Unread Messages
- Check the badge at the top showing **X Unread**
- Messages are automatically marked as read when you open the conversation
- See read status in messages

### Delete a Message
- You can only delete your own messages
- Click **Delete** on your message
- Message is permanently removed

### Chat Features
- **Auto-refresh**: New messages appear every 3 seconds
- **Timestamps**: Every message shows when it was sent
- **Conversation List**: Shows last message and timestamp
- **Unread Badge**: Red badge shows unread count per conversation

---

## Security & Privacy Features

### Data Encryption
- Passwords are hashed with bcryptjs
- Sensitive data encrypted with AES-256-GCM
- Authentication tags prevent tampering

### GDPR Compliance
- **Right to Access**: Export all your data anytime
- **Right to be Forgotten**: Delete and anonymize account
- **Audit Trail**: Complete log of all activities
- **Data Portability**: Download as JSON

### Location Privacy
- Your location is only visible to people you interact with
- Can be updated or removed anytime
- Used only for finding nearby traders/listings

---

## API Reference for Developers

### Privacy Endpoints
```bash
# Export user data
GET /api/privacy/export
Header: Authorization: Bearer {token}

# Delete account (anonymize)
POST /api/privacy/delete-account
Body: { password: "user_password" }

# Get audit logs
GET /api/privacy/audit-logs?limit=50
```

### Location Endpoints
```bash
# Update location
PUT /api/location/update-location
Body: { latitude: 28.7041, longitude: 77.1025, city: "Delhi", country: "India" }

# Find nearby traders
GET /api/location/nearby-traders?radius=50&category=photography

# Find nearby listings
GET /api/location/nearby-listings?radius=50&category=photography
```

### Session Endpoints
```bash
# Create session
POST /api/sessions/create
Body: {
  participant_id: "user_id",
  skill_title: "Photography Basics",
  scheduled_at: "2025-01-15T14:00:00",
  duration_minutes: 60,
  meeting_link: "https://zoom.us/..."
}

# Get my sessions
GET /api/sessions/my-sessions?role=provider

# Update status
PUT /api/sessions/{session_id}/status
Body: { status: "COMPLETED", rating: 4.5, feedback: "Great session!" }
```

### Chat Endpoints
```bash
# Send message
POST /api/chat/send
Body: { receiver_id: "user_id", content: "Hello!" }

# Get conversation
GET /api/chat/conversation/{user_id}?limit=50

# Get all conversations
GET /api/chat/conversations

# Get unread count
GET /api/chat/unread-count

# Mark as read
PUT /api/chat/{message_id}/read

# Delete message
DELETE /api/chat/{message_id}
```

---

## Troubleshooting

### Location not updating?
- ✓ Ensure browser allows geolocation
- ✓ Check internet connection
- ✓ Try manual city/country entry
- ✓ Verify coordinates are valid (-90 to 90, -180 to 180)

### Messages not appearing?
- ✓ Check internet connection
- ✓ Page auto-refreshes every 3 seconds
- ✓ Try refreshing the page manually
- ✓ Ensure you selected the correct conversation

### Session not showing up?
- ✓ Check scheduled date is in the future
- ✓ Verify participant user ID is correct
- ✓ Look in the right tab (Provider/Participant)

### Can't delete account?
- ✓ Ensure password is correct
- ✓ Account will be anonymized, not deleted
- ✓ You'll be logged out after deletion

---

## Tips & Tricks

💡 **Location Matching**
- Wider radius = more results but longer distances
- Update location regularly for accuracy
- Category filter helps find specific skills

💡 **Sessions**
- Add meeting link for online sessions
- Set clear duration expectations
- Feedback helps other users trust you

💡 **Privacy**
- Export your data regularly for backup
- Review activity logs for security
- Messages are private between 2 people only

💡 **Messaging**
- Messages load automatically every 3 seconds
- Delete message if sent by mistake
- Keep conversations organized

---

## Performance Metrics

- **Location Search**: < 500ms for radius searches
- **Message Delivery**: < 1 second
- **Session Creation**: < 500ms
- **Data Export**: < 2 seconds (JSON generation)

---

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled
- Geolocation permission (for GPS location)

---

Need help? Contact support or file an issue on GitHub! 🎉
