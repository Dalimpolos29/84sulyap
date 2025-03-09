# Sulyap - UPIS Alumni Batch 1984 Community Website
## Technical Documentation

### 1. Technical Stack
#### Frontend
- **Framework**: Next.js 14
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (by Tailwind team)
- **UI Components**: Custom components with Tailwind

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for photos)
- **Real-time**: Supabase Realtime

### 2. Development Environment Setup
#### Required Software
- **Node.js**: v22.14.0
- **npm**: 10.9.2
- **Git**: 2.48.1
- **VS Code**: Latest version

#### Installation Notes
- Node.js: Installed via Windows installer
- Git: Installed via winget
  - Configured with user.name="Dennis Alimpolos"
  - Configured with user.email="mr.dennisalimpolos@gmail.com"
  - Repository: https://github.com/Dalimpolos29/sulyap84.git
  - SSH authentication configured
  - .gitignore configured for Next.js project
- VS Code: Installed via winget
- All tools verified and working in development environment

### 3. Project Structure
```
sulyap84/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── profile/
│   │   │   ├── events/
│   │   │   └── photos/
│   │   ├── (admin)/           # Admin routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # Basic UI components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility functions
│   │   ├── supabase/        # Supabase client
│   │   └── utils/           # Helper functions
│   └── styles/              # Global styles
├── public/                  # Static files
└── config/                 # Configuration files
```

### 4. Database Schema

1. **users** (extends Supabase auth.users)
```sql
- id (uuid, primary key)
- email (string, unique)
- full_name
- maiden_name
- married_name
- section_first
- section_second
- section_third
- section_fourth
- birthday
- profession
- profile_picture_url
- then_picture_url
- created_at
- updated_at
```

2. **profiles** (additional user information)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- address
- phone_number
- emergency_contact_name
- emergency_contact_phone
- spouse_name
- children (jsonb array)
- pets (jsonb array)
- created_at
- updated_at
```

3. **social_links**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- platform
- url
- created_at
```

4. **events**
```sql
- id (uuid, primary key)
- title
- description
- date
- location
- created_by (uuid, foreign key to users)
- created_at
- updated_at
```

5. **event_rsvps**
```sql
- id (uuid, primary key)
- event_id (uuid, foreign key to events)
- user_id (uuid, foreign key to users)
- status (enum: 'going', 'not_going')
- created_at
```

6. **photos**
```sql
- id (uuid, primary key)
- event_id (uuid, foreign key to events)
- uploaded_by (uuid, foreign key to users)
- url
- status (enum: 'pending', 'approved', 'rejected')
- created_at
```

7. **contact_requests**
```sql
- id (uuid, primary key)
- requester_id (uuid, foreign key to users)
- receiver_id (uuid, foreign key to users)
- status (enum: 'pending', 'approved', 'rejected')
- created_at
```

8. **announcements**
```sql
- id (uuid, primary key)
- title
- content
- created_by (uuid, foreign key to users)
- created_at
- updated_at
```

### 5. Authentication Flow

1. **User Registration**
- Public registration link shared via text message
- Link directs to pre-filled data check
- Two possible paths:
  a. Existing Member:
     - Shows "Welcome Back" message
     - "Get Started" button for first-time login
     - Redirects to profile completion page
  b. New Member:
     - Redirects to registration form
     - Collects required information
     - Creates account

2. **Login Process**
- Email/password login
- System validates credentials
- Redirects to dashboard if valid
- Shows error if invalid

3. **Password Management**
- Simple password requirements:
  - Minimum 6 characters
  - Letters and numbers only
  - (Optional) Stronger password suggested but not required
- Password reset via text message
- Password change in settings

4. **Session Management**
- Extended session duration (30 days)
- Auto-logout after 30 days of inactivity
- Remember me option enabled by default
- Secure cookie handling

5. **Role-Based Access**
- Super Admin (you)
- Admin (officers)
- Member 