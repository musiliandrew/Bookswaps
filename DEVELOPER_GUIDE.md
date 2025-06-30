# 🛠️ BookSwaps Developer Guide

> **Comprehensive technical documentation for BookSwaps social reading platform**
> 
> A complete guide for developers working with the BookSwaps codebase, APIs, and architecture.

---

## 🏗️ **Architecture Overview**

### **System Architecture**

BookSwaps is built as a modern full-stack application with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React.js      │◄──►│   Django REST   │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   WebSockets    │    │   Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Technology Stack:**
- **Frontend:** React 18, Tailwind CSS, Framer Motion
- **Backend:** Django 4.2, Django REST Framework, Channels
- **Database:** PostgreSQL 14+, Redis for caching
- **Real-time:** WebSockets via Django Channels
- **Containerization:** Docker & Docker Compose
- **Authentication:** JWT with refresh tokens

### **Project Structure**

```
BookSwaps/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and styling
├── backend/                 # Django application
│   ├── users/              # User management app
│   ├── library/            # Book management app
│   ├── swaps/              # Swap system app
│   ├── discussions/        # Social features app
│   ├── chat/               # Real-time chat app
│   └── utils/              # Shared utilities
├── docker-compose.yml       # Container orchestration
└── docs/                   # Documentation
```

---

## 🚀 **Development Setup**

### **Prerequisites**

- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (for local frontend development)
- **Python 3.11+** (for local backend development)
- **PostgreSQL 14+** (if running without Docker)
- **Redis** (for caching and WebSockets)

### **Quick Start with Docker**

```bash
# Clone the repository
git clone https://github.com/musiliandrew/Bookswaps.git
cd Bookswaps

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
```

### **Local Development Setup**

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Environment setup
cp .env.example .env
# Edit .env with your database and API keys

# Database setup
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

### **Environment Variables**

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bookswaps
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# External APIs
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

---

## 📊 **Database Schema**

### **Core Models**

**Users App:**
```python
class CustomUser(AbstractUser):
    user_id = UUIDField(primary_key=True)
    username = CharField(max_length=150, unique=True)
    email = EmailField(unique=True)
    birth_date = DateField(blank=True, null=True)
    gender = CharField(max_length=17, choices=GENDER_CHOICES)
    city = CharField(max_length=100)
    country = CharField(max_length=100)
    genres = JSONField(default=list)
    profile_picture = URLField()
    profile_completed = BooleanField(default=False)
    # ... additional fields
```

**Library App:**
```python
class Book(models.Model):
    book_id = UUIDField(primary_key=True)
    user = ForeignKey(CustomUser)
    title = CharField(max_length=255)
    author = CharField(max_length=255)
    isbn = CharField(max_length=13, unique=True)
    genre = CharField(max_length=100)
    condition = CharField(max_length=20)
    available_for_exchange = BooleanField(default=True)
    available_for_borrow = BooleanField(default=False)
    # ... additional fields
```

**Swaps App:**
```python
class Swap(models.Model):
    swap_id = UUIDField(primary_key=True)
    initiator = ForeignKey(CustomUser, related_name='initiated_swaps')
    receiver = ForeignKey(CustomUser, related_name='received_swaps')
    initiator_book = ForeignKey(Book, related_name='initiated_swaps')
    receiver_book = ForeignKey(Book, related_name='received_swaps')
    status = CharField(max_length=20, choices=STATUS_CHOICES)
    meetup_location = CharField(max_length=255)
    meetup_time = DateTimeField()
    # ... additional fields
```

### **Relationships**

```mermaid
erDiagram
    CustomUser ||--o{ Book : owns
    CustomUser ||--o{ Swap : initiates
    CustomUser ||--o{ Swap : receives
    Book ||--o{ Swap : involved_in
    CustomUser ||--o{ Discussion : creates
    CustomUser ||--o{ Society : joins
    Society ||--o{ SocietyMember : has
```

---

## 🔌 **API Documentation**

### **Authentication Endpoints**

**POST /api/users/register/**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "birth_date": "YYYY-MM-DD",
  "city": "string",
  "country": "string"
}
```

**POST /api/users/login/**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string",
    "profile_completed": boolean
  }
}
```

### **Library Endpoints**

**GET /api/library/books/**
- Query params: `page`, `search`, `genre`, `available_for_exchange`
- Returns paginated list of books

**POST /api/library/books/**
```json
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "genre": "string",
  "condition": "string",
  "available_for_exchange": boolean,
  "available_for_borrow": boolean
}
```

**GET /api/library/books/{book_id}/**
- Returns detailed book information

### **Swap Endpoints**

**POST /api/swaps/initiate/**
```json
{
  "receiver_id": "uuid",
  "initiator_book_id": "uuid",
  "receiver_book_id": "uuid",
  "message": "string"
}
```

**PATCH /api/swaps/{swap_id}/accept/**
```json
{
  "status": "Accepted",
  "meetup_location": "string",
  "meetup_time": "ISO_datetime"
}
```

**POST /api/swaps/{swap_id}/confirm/**
- Confirms swap completion

### **Social Endpoints**

**POST /api/users/follow/**
```json
{
  "user_id": "uuid"
}
```

**GET /api/discussions/**
- Returns paginated discussions

**POST /api/discussions/**
```json
{
  "title": "string",
  "content": "string",
  "post_type": "Article|Synopsis",
  "book_reference": "string",
  "tags": ["string"]
}
```

### **Chat Endpoints**

**GET /api/chat/conversations/**
- Returns user's chat conversations

**POST /api/chat/conversations/{conversation_id}/messages/**
```json
{
  "content": "string",
  "message_type": "TEXT"
}
```

**GET /api/chat/societies/**
- Returns available societies

**POST /api/chat/societies/{society_id}/messages/send/**
```json
{
  "content": "string",
  "message_type": "TEXT"
}
```

---

## ⚛️ **Frontend Architecture**

### **Component Structure**

**Page Components:**
```
src/pages/
├── AuthPage.jsx          # Login/Register
├── LibraryPage.jsx       # Book management
├── SwapsPage.jsx         # Swap management
├── SocialsPage.jsx       # Social features
├── ProfilePage.jsx       # User profile
└── SettingsPage.jsx      # User settings
```

**Shared Components:**
```
src/components/
├── Layout/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
├── UI/
│   ├── Button.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   └── Form/
├── Library/
│   ├── BookCard.jsx
│   ├── BookModal.jsx
│   └── AddBookForm.jsx
├── Swaps/
│   ├── SwapCard.jsx
│   ├── SwapModal.jsx
│   └── SwapHistory.jsx
└── Chat/
    ├── ConversationList.jsx
    ├── MessageView.jsx
    └── SocietyChat.jsx
```

### **State Management**

**Custom Hooks:**
```javascript
// Authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ... auth logic
};

// API Hooks
const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... CRUD operations
};

const useSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  // ... swap management
};
```

**Context Providers:**
```javascript
// AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Auth methods
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  const refreshToken = async () => { /* ... */ };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **Routing**

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
          <Route path="/swaps" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} />
          <Route path="/socials" element={<ProtectedRoute><SocialsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 🔄 **Real-time Features**

### **WebSocket Implementation**

**Backend (Django Channels):**
```python
# consumers.py
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_group_name = f"user_{self.user.user_id}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        
        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'notification':
            await self.handle_notification(data)
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
```

**Frontend (WebSocket Hook):**
```javascript
// useWebSocket.js
export const useWebSocket = (url, onMessage) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    return () => ws.close();
  }, [url]);
  
  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };
  
  return { sendMessage, isConnected };
};
```

### **Notification System**

**Backend Notification Service:**
```python
# utils/websocket.py
async def send_notification_to_user(user_id, notification_data):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        f"user_{user_id}",
        {
            'type': 'notification',
            'notification': notification_data
        }
    )

# Usage in views
from backend.utils.websocket import send_notification_to_user

async def create_swap_notification(swap):
    notification_data = {
        'type': 'swap_request',
        'title': 'New Swap Request',
        'message': f'{swap.initiator.username} wants to swap books',
        'swap_id': str(swap.swap_id)
    }
    await send_notification_to_user(swap.receiver.user_id, notification_data)
```

---

## 🧪 **Testing**

### **Backend Testing**

**Test Structure:**
```
backend/tests/
├── test_users.py         # User authentication tests
├── test_library.py       # Book management tests
├── test_swaps.py         # Swap system tests
├── test_chat.py          # Chat functionality tests
└── test_api.py           # API endpoint tests
```

**Example Test:**
```python
# tests/test_swaps.py
from django.test import TestCase
from rest_framework.test import APIClient
from backend.users.models import CustomUser
from backend.library.models import Book
from backend.swaps.models import Swap

class SwapTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = CustomUser.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        
    def test_initiate_swap(self):
        # Create books
        book1 = Book.objects.create(
            user=self.user1,
            title='Test Book 1',
            author='Test Author'
        )
        book2 = Book.objects.create(
            user=self.user2,
            title='Test Book 2',
            author='Test Author'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user1)
        
        # Initiate swap
        response = self.client.post('/api/swaps/initiate/', {
            'receiver_id': str(self.user2.user_id),
            'initiator_book_id': str(book1.book_id),
            'receiver_book_id': str(book2.book_id),
            'message': 'Test swap request'
        })
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Swap.objects.filter(
            initiator=self.user1,
            receiver=self.user2
        ).exists())
```

**Running Tests:**
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test backend.swaps

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### **Frontend Testing**

**Test Setup (Jest + React Testing Library):**
```javascript
// __tests__/components/BookCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from '../src/components/Library/BookCard';

describe('BookCard', () => {
  const mockBook = {
    book_id: '123',
    title: 'Test Book',
    author: 'Test Author',
    condition: 'Good',
    available_for_exchange: true
  };
  
  test('renders book information correctly', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });
  
  test('shows swap button for available books', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Request Swap')).toBeInTheDocument();
  });
});
```

**Running Frontend Tests:**
```bash
cd frontend
npm test                    # Run tests in watch mode
npm run test:coverage      # Run with coverage report
npm run test:ci           # Run once for CI/CD
```

---

## 🚀 **Deployment**

### **Docker Production Setup**

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    depends_on:
      - backend
      
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://user:pass@db:5432/bookswaps
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: bookswaps
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
volumes:
  postgres_data:
```

### **Environment Configuration**

**Production Environment Variables:**
```env
# Security
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@db:5432/bookswaps

# Static Files
STATIC_URL=/static/
STATIC_ROOT=/app/staticfiles/

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# Security Headers
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

### **CI/CD Pipeline**

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Backend Tests
        run: |
          cd backend
          python -m pytest
          
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm ci
          npm run test:ci
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 **Development Guidelines**

### **Code Style**

**Backend (Python):**
- Follow PEP 8 style guide
- Use Black for code formatting
- Use isort for import sorting
- Maximum line length: 88 characters

**Frontend (JavaScript):**
- Use ESLint with Airbnb config
- Use Prettier for code formatting
- Use camelCase for variables and functions
- Use PascalCase for components

### **Git Workflow**

**Branch Naming:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring

**Commit Messages:**
```
feat: add user authentication system
fix: resolve swap notification bug
docs: update API documentation
refactor: improve database query performance
```

### **Code Review Process**

1. **Create Feature Branch** from main
2. **Implement Changes** with tests
3. **Create Pull Request** with description
4. **Code Review** by team members
5. **Address Feedback** and update
6. **Merge** after approval

---

## 📚 **Additional Resources**

### **External APIs**

**Google Books API:**
- Used for book metadata and cover images
- Rate limit: 1000 requests per day
- Documentation: https://developers.google.com/books

**Google Maps API:**
- Used for location services and meetup suggestions
- Rate limit: Based on billing plan
- Documentation: https://developers.google.com/maps

### **Third-party Libraries**

**Backend:**
- `djangorestframework` - REST API framework
- `django-channels` - WebSocket support
- `django-cors-headers` - CORS handling
- `celery` - Background task processing
- `redis` - Caching and message broker

**Frontend:**
- `react-router-dom` - Client-side routing
- `framer-motion` - Animations
- `react-hook-form` - Form handling
- `react-query` - Data fetching and caching
- `socket.io-client` - WebSocket client

### **Performance Optimization**

**Backend:**
- Use database indexing for frequently queried fields
- Implement caching with Redis
- Use select_related() and prefetch_related() for database queries
- Implement pagination for large datasets

**Frontend:**
- Use React.memo() for component optimization
- Implement lazy loading for routes and components
- Optimize images and assets
- Use service workers for caching

---

## 🆘 **Troubleshooting**

### **Common Issues**

**Database Connection Issues:**
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d
```

**WebSocket Connection Issues:**
```bash
# Check Redis status
docker-compose logs redis

# Restart channels
docker-compose restart backend
```

**Frontend Build Issues:**
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --clean
```

### **Debug Mode**

**Enable Debug Logging:**
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

---

## 📞 **Support & Contributing**

### **Getting Help**

- **Documentation:** Check this guide and inline code comments
- **Issues:** Create GitHub issues for bugs and feature requests
- **Discussions:** Use GitHub Discussions for questions
- **Email:** Contact andrewthepyrookie@gmail.com for urgent issues

### **Contributing**

1. **Read** the [CONTRIBUTING.md](./CONTRIBUTING.md) file
2. **Fork** the repository
3. **Create** a feature branch
4. **Make** your changes with tests
5. **Submit** a pull request

---

**Happy Coding! 🚀**

*BookSwaps Developer Team*
