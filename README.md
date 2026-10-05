# AI-Powered Hospital Management System

A full-stack Hospital Management System built to manage patients, doctors, appointments, medical records, prescriptions, and doctor availability. The system also integrates a machine learning model for cardiovascular disease risk prediction as a clinical decision-support feature.

## 🚀 Live Demo

**Frontend:** [https://ai-powered-hospital-management-syst-psi.vercel.app/]

**Backend API:** [https://ai-powered-hospital-management-system-r7ov.onrender.com/]

**API Documentation:** [https://ai-powered-hospital-management-system-r7ov.onrender.com/docs]

The live application is deployed using Vercel for the frontend, Render for the FastAPI backend, and PostgreSQL through Supabase.

## Features

### Admin

- Manage doctors and patients
- Manage doctor availability
- Approve and deactivate user accounts
- Manage hospital data and user access

### Doctor

- View and manage appointments
- Manage patient medical records
- Create prescriptions
- Access cardiovascular disease risk predictions for clinical decision support

### Patient

- Register and log in
- Book appointments
- View appointments
- View medical records
- View prescriptions
- Sign in using Google OAuth
- Use OTP-based two-factor authentication

## AI / Machine Learning

The system includes a cardiovascular disease risk prediction model developed using the Framingham Heart Study dataset.

The model uses 15 demographic and cardiovascular features, including:

- Age
- Gender
- Smoking status
- Cigarettes per day
- Blood pressure
- Cholesterol
- BMI
- Diabetes
- Heart rate
- Glucose
- Other cardiovascular risk factors

A balanced Logistic Regression model was selected and trained for the final implementation to identify patients at higher risk within the project's requirements.

The trained model and preprocessing scaler are integrated into the FastAPI backend and provide an estimated 10-year coronary heart disease (CHD) risk probability for clinical decision support.

> **Note:** The prediction is intended for educational and decision-support purposes and is not a medical diagnosis.

## Authentication & Security

- JWT-based authentication
- Bcrypt password hashing
- Google OAuth authentication
- OTP-based two-factor authentication
- Role-based access control for Admin, Doctor, and Patient
- Protected frontend routes
- Environment variables for sensitive configuration

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Python
- FastAPI
- REST APIs
- Uvicorn

### Database

- PostgreSQL

### Machine Learning

- Python
- Scikit-learn
- NumPy
- Pandas

### DevOps & Tools

- Docker
- Docker Compose
- Docker volumes
- Docker networks
- Git
- GitHub

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Source Control | GitHub |

## Local Docker Architecture

```text
                         Docker Compose
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
        React / Vite      FastAPI        PostgreSQL
          Frontend         Backend          Database
           :5173            :8000            :5433
                              |
                              v
                     ML Risk Prediction
```

## Project Structure

```text
AI-Powered-Hospital-Management-System/
│
├── Backend/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── Frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Docker Desktop
- Git

Docker Desktop should be running before starting the application.

## Running the Project with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/laibajamal20/AI-Powered-Hospital-Management-System.git
cd AI-Powered-Hospital-Management-System
```

### 2. Configure Environment Variables

The project uses environment variables for database credentials, email authentication, and other sensitive configuration.

Create the required `.env` files locally.

Example backend configuration:

```text
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=hms-postgres

AGENTMAIL_API_KEY=your_agentmail_api_key
```

The AgentMail inbox used by the application is configured in the backend as:

```text
hms@agentmail.to
```

Replace the placeholder values with your own configuration.

> **Important:** Do not commit `.env` files or real credentials to GitHub.

### 3. Start the Application

From the project root directory, run:

```bash
docker compose up -d --build
```

Docker Compose will start the following services:

- PostgreSQL database
- FastAPI backend
- React frontend

### 4. Access the Application

Frontend:

```text
http://localhost:5173
```

FastAPI API documentation:

```text
http://localhost:8000/docs
```

PostgreSQL:

```text
localhost:5433
```

### 5. Stop the Application

To stop the application:

```bash
docker compose down
```

The PostgreSQL database uses a persistent Docker volume, so stopping the containers does not remove the stored database data.

## Docker Configuration

### Backend

The backend is containerized using a Python 3.13 image. Its dependencies are installed from `requirements.txt`, and the FastAPI application is served using Uvicorn.

### Frontend

The frontend is containerized using Node.js. Dependencies are installed and the React/Vite application is built before the container starts.

### PostgreSQL

PostgreSQL runs in its own Docker container and uses a named Docker volume:

```text
hms_postgres_data
```

The volume provides persistent database storage independent of the PostgreSQL container.

### Docker Compose

Docker Compose manages the three application services and their communication:

```text
React Frontend
      |
      v
FastAPI Backend
      |
      v
PostgreSQL Database
```

A PostgreSQL health check is configured so that the backend waits for the database to become ready before starting.

## Database Persistence

The PostgreSQL database uses the named Docker volume:

```text
hms_postgres_data
```

This separates database storage from the PostgreSQL container itself.

The Docker setup was tested by stopping and recreating the Compose containers. Existing database data remained available after the containers were recreated.

## API

The FastAPI backend provides REST APIs for:

- Authentication
- User management
- Patients
- Doctors
- Departments
- Appointments
- Medical records
- Prescriptions
- Doctor availability
- Cardiovascular disease risk prediction

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

## Disclaimer

The machine learning prediction feature is intended for educational and clinical decision-support purposes only. It should not be used as a substitute for professional medical diagnosis or treatment.