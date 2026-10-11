# MediCare Smart — Hospital Management System

A full-stack hospital management application built with **Java, Spring Boot, Spring Security, PostgreSQL, Next.js, React, and TypeScript**. MediCare Smart brings patient booking, doctor schedules, and hospital administration into a role-based web platform.

> **Project status:** Active development. Features and API routes described below reflect the current project modules; verify individual routes and integrations against your local configuration before deploying.

## Features

### Patient Portal
- Patient registration, login, and profile management
- Browse doctors and search by specialization
- Book doctor appointments with available time slots
- View appointment details and booking history
- Reschedule appointments and track appointment status
- Password recovery and reset screens

### Doctor Portal
- Doctor dashboard with appointment overview
- View and manage assigned appointments
- Configure doctor availability and consultation slots
- Maintain doctor profile information

### Admin Portal
- Admin dashboard with hospital management overview
- Manage patient records and doctor profiles
- Onboard new doctors
- Review and manage appointments

### Appointment & Scheduling
- Dedicated appointment slot entities and services
- Slot-based booking and doctor availability management
- Appointment rescheduling and status updates
- Booking conflict handling
- Appointment workflow features including check-in (under development/testing)

### Core Hospital Modules
- **Patient management:** Personal and medical profile details
- **Doctor management:** Specializations, profiles, and departments
- **Department management:** Organize hospital departments
- **Insurance management:** Associate insurance information with patients
- **Security:** JWT authentication, Spring Security, role-based access control, and permission mappings
- **OAuth2:** Google/GitHub integration support in the backend; configure providers before use

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript, CSS |
| Backend | Java 21, Spring Boot 3.3.5, Spring Web |
| Security | Spring Security, JWT, OAuth2, role-based authorization |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Backend utilities | Lombok, ModelMapper |
| Build & tooling | Maven Wrapper, npm, Git, Qodana |

## Project Structure

```text
MediCare-Smart/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/              # Admin dashboard, doctors, patients, appointments
│   │   │   ├── doctor/             # Doctor dashboard, availability, profile, appointments
│   │   │   ├── patient/            # Patient dashboard, doctors, booking, profile, appointments
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── components/             # Shared and role-specific UI components
│   │   ├── context/                # Authentication context
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/               # API and domain services
│   │   └── types/                  # TypeScript types
│   ├── package.json
│   └── next.config.ts
├── src/
│   ├── main/
│   │   ├── java/com/codingshuttle/youtube/hospitalManagement/
│   │   │   ├── config/
│   │   │   ├── controller/          # REST endpoints
│   │   │   ├── dto/                 # Request/response models
│   │   │   ├── entity/              # Domain entities and enums
│   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   ├── security/            # JWT, OAuth2, permissions, auth services
│   │   │   ├── service/             # Business logic, scheduling, photos
│   │   │   └── error/               # Exception handling
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql
│   └── test/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── qodana.yaml
└── LICENSE
```

## Prerequisites

- **JDK 21** or compatible JDK configured for the backend
- **PostgreSQL 12+**
- **Node.js and npm** compatible with the frontend's `package.json`
- Git

Maven does not need to be installed globally when using the included Maven Wrapper.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Monuyadav18/MediCare-Smart.git
cd MediCare-Smart
```

### 2. Create the database

Run in PostgreSQL:

```sql
CREATE DATABASE "hospitalDB";
```

Check the exact database name in `src/main/resources/application.properties`; PostgreSQL database names are case-sensitive when quoted.

### 3. Configure backend environment variables

The backend uses environment variables for sensitive configuration. **Do not commit real passwords, tokens, or private keys.**

PowerShell example (replace placeholders with your own values):

```powershell
$env:DB_PASSWORD = "your_postgresql_password"
$env:JWT_SECRET = "your_secure_random_jwt_secret"
$env:MAIL_USERNAME = "your_mail_username"
$env:MAIL_PASSWORD = "your_mail_app_password"
```

Review `src/main/resources/application.properties` for the database URL, database username, mail settings, JWT settings, and any additional required environment variables. OAuth2 login requires provider credentials if enabled.

### 4. Start the Spring Boot backend

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

By default, the backend is available at `http://localhost:8080`; the API routes use the `/api/v1` prefix.

### 5. Start the Next.js frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser. If needed, set the frontend API base URL in `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

`frontend/.env.local` is ignored by Git.

## Application Roles

| Role | Main capabilities |
| --- | --- |
| **PATIENT** | Manage profile, find doctors, book and reschedule appointments |
| **DOCTOR** | Manage profile and availability, review appointments |
| **ADMIN** | Manage doctors, patients, and hospital appointments |

The backend uses role and permission mappings, including patient, appointment, user-management, and reporting permissions.

## API Overview

The following routes are examples from the project's API. Check the corresponding controllers for the complete and current endpoint list.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | Register a user |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/v1/public/doctors` | List public doctor information |
| `GET` | `/api/v1/patients/profile` | View current patient profile |
| `POST` | `/api/v1/patients/appointments` | Create an appointment |
| `GET` | `/api/v1/doctors/appointments` | View doctor's appointments |
| `GET` | `/api/v1/admin/patients` | List patients (admin) |
| `POST` | `/api/v1/admin/onBoardNewDoctor` | Onboard doctor (admin) |

Authenticated endpoints typically require:

```http
Authorization: Bearer <your_jwt_token>
```

## Main Data Models

- **User:** Authentication identity, roles, and provider information
- **Patient:** Personal information, blood group, insurance, and appointments
- **Doctor:** Professional profile, specialization, and availability
- **Appointment:** Patient, doctor, consultation time, reason, and status
- **AppointmentSlot:** Scheduling and slot availability
- **Department:** Hospital department relationships
- **Insurance:** Insurance policy information
- **PasswordResetToken:** Password recovery workflow

## Testing and Quality

Run backend tests:

```powershell
.\mvnw.cmd test
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

The repository also includes `qodana.yaml` for code-quality tooling. Test and lint commands should be run locally before deploying; passing results are not claimed here.

## Security Notes

- Never commit `.env` files, database credentials, OAuth2 secrets, or JWT signing keys.
- Set a strong, unique JWT secret in the runtime environment.
- Review CORS, authentication, authorization, and error handling before production deployment.
- Use production-ready database migration, email, HTTPS, and secrets management before serving real patient information.

## Roadmap

- [ ] Complete and validate the appointment check-in workflow
- [ ] Add comprehensive integration and security tests
- [ ] Document all API routes and request/response examples
- [ ] Prepare production deployment for frontend, backend, and PostgreSQL
- [ ] Add verified application screenshots and demo link

## Development & Attribution

This repository extends an existing MIT-licensed hospital management backend with a **MediCare Smart** full-stack frontend and additional workflows such as role-specific dashboards, doctor availability, appointment slots, rescheduling, and profile management.

Original copyright and license terms are retained in [LICENSE](LICENSE). The original license notice credits **EternalKnight002 (2025)**. New contributions and enhancements should be distinguished from the original codebase.

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for the complete license text and original copyright notice.
