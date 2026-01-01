# AI Quiz Application

A comprehensive AI-powered quiz application with real-time monitoring, RAG-based document processing, and intelligent quiz generation.

## 🚀 Features

### Core Functionality
- **AI-Powered Quiz Generation**: Generate quizzes from uploaded PDF documents using Google Gemini AI
- **RAG (Retrieval-Augmented Generation)**: Advanced document processing with vector similarity search
- **Real-time Proctoring**: Webcam-based monitoring with face detection and violation tracking
- **Multi-User Support**: Complete authentication system with role-based access
- **Leaderboard System**: Competitive scoring with filtering by topic and difficulty
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Advanced Features
- **Document Processing**: PDF parsing with semantic chunking and embedding generation
- **Vector Database**: FAISS-based similarity search for relevant content retrieval
- **Security Monitoring**: Tab switching, fullscreen exit, and multi-person detection
- **Smart Violation System**: Configurable thresholds with automatic camera shutdown
- **Real-time Updates**: Firebase integration for live data synchronization

## 🏗️ Project Structure

```
ai-quiz-app-final/
├── app/                          # Next.js App Router
│   ├── admin/                     # Admin dashboard
│   ├── api/                       # API routes
│   │   └── generate-quiz/         # Quiz generation endpoint
│   ├── chat/                      # Chat interface
│   ├── dashboard/                  # User dashboard
│   ├── leaderboard/                # Leaderboard with filters
│   ├── login/                     # Authentication
│   ├── quiz/                      # Quiz interface
│   │   ├── [quizId]/             # Dynamic quiz pages
│   │   └── start/                # Quiz start page
│   ├── result/                    # Results display
│   │   ├── [resultId]/            # Individual results
│   │   └── page.tsx              # All results list
│   ├── signup/                    # User registration
│   ├── globals.css                # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                 # Landing page
├── backend/                      # FastAPI Python backend
│   ├── api.py                    # API endpoints
│   ├── main.py                   # FastAPI application
│   ├── rag.py                    # RAG system implementation
│   ├── security.py               # Authentication middleware
│   └── requirements.txt          # Python dependencies
├── components/                   # Reusable React components
│   ├── ui/                      # UI component library
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   └── ... (more UI components)
│   └── webcam-monitor.tsx         # Proctoring component
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication state
├── hooks/                       # Custom React hooks
│   └── use-toast.ts             # Toast notifications
├── lib/                         # Utility libraries
│   └── firebase.ts              # Firebase configuration
├── styles/                      # Styling
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── .env                         # Environment variables
├── package.json                 # Node.js dependencies
├── run.py                      # Backend startup script
└── tailwind.config.ts           # Tailwind configuration
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Context API
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI Integration**: Google Generative AI (Gemini)
- **Computer Vision**: TensorFlow.js with BlazeFace model

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: LangChain with Google Gemini
- **Document Processing**: PyPDF, Sentence Transformers
- **Vector Database**: FAISS
- **Embeddings**: HuggingFace Sentence Transformers
- **API Documentation**: Automatic OpenAPI/Swagger

### Infrastructure
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **File Storage**: Temporary file processing
- **Real-time**: Firebase real-time listeners

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Google API Key for Gemini
- Firebase project configuration

### Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your Firebase and Google API keys

# Run development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python run.py
```

### Environment Variables
```env
# Frontend (.env)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend (.env)
GOOGLE_API_KEY=your_google_gemini_api_key
BACKEND_API_KEY=your_backend_api_key
```

## 📱 Core Features Explained

### 1. AI Quiz Generation
- Upload PDF documents for processing
- Automatic text extraction and chunking
- Vector embedding generation for semantic search
- Context-aware quiz generation with customizable parameters

### 2. Real-time Proctoring
- Webcam-based face detection using TensorFlow.js
- Multi-person detection alerts
- Tab switching and fullscreen exit monitoring
- Configurable violation thresholds (default: 5 violations)
- Automatic camera shutdown on threshold breach

### 3. User Management
- Firebase Authentication integration
- Role-based access control (User/Admin)
- Secure session management
- Profile management with name and email

### 4. Quiz Interface
- Responsive question display with radio buttons
- Real-time progress tracking
- Question navigation with numbered buttons
- Timer functionality with visual indicators
- Violation tracking with visual alerts

### 5. Results & Analytics
- Detailed quiz results with explanations
- Performance metrics and scoring
- Historical results tracking
- Leaderboard with filtering (topic, difficulty)
- Comparative analysis with averages

## 🔐 Security Features

### Proctoring System
- **Face Detection**: Continuous monitoring using BlazeFace
- **Multi-Person Alert**: Detects additional people in frame
- **No-Face Detection**: Alerts when user leaves camera view
- **Tab Switching**: Monitors browser tab changes
- **Fullscreen Monitoring**: Detects fullscreen exit attempts

### Violation Scoring
- Multiple People Detected: 10 points
- Tab Switch: 10 points
- Fullscreen Exit: 10 points
- No Face Detected: 10 points
- Camera auto-shutdown at 5 violations

## 📊 API Endpoints

### Backend FastAPI Endpoints
- `POST /upload/` - Upload and process PDF documents
- `POST /generate-quiz/` - Generate quizzes from processed documents
- `GET /` - Health check endpoint

### Frontend API Routes
- `/api/generate-quiz/` - Quiz generation proxy
- Authentication middleware for protected routes

## 🎯 Usage Flow

1. **Authentication**: Users sign up/login with Firebase Auth
2. **Document Upload**: Upload PDF for quiz generation
3. **Quiz Configuration**: Set topic, difficulty, and question count
4. **Quiz Taking**: Real-time proctoring with webcam monitoring
5. **Results**: View detailed performance and explanations
6. **Leaderboard**: Compare scores with other users

## 🔧 Configuration

### Webcam Monitoring
- **Violation Threshold**: Configurable (default: 5 violations)
- **Detection Sensitivity**: Adjustable face detection parameters
- **Camera Resolution**: Responsive sizing (max 240px height)
- **Monitoring Frequency**: Real-time detection loop

### Quiz Generation
- **Chunk Size**: 1000 characters with 100 character overlap
- **Embedding Model**: sentence-transformers/all-MiniLM-L6-v2
- **AI Model**: Google Gemini 2.5 Flash
- **Question Types**: Multiple choice with explanations

## 🚀 Deployment

### Frontend (Next.js)
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Backend (FastAPI)
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📈 Performance Considerations

### Frontend Optimizations
- Component lazy loading
- Image optimization with Next.js
- Responsive design for all devices
- Efficient state management

### Backend Optimizations
- Vector database caching
- Efficient document processing
- Batch API requests
- Memory management for large documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue with detailed information

---

**Built with ❤️ using Next.js, FastAPI, Firebase, and Google AI**
#   A I - B a s e d - Q u i z - A p p l i c a t i o n  
 