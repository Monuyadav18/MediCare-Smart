<div align="center">

# 🏥 MediCare Smart
### Full-Stack Hospital Management & Smart Appointment System

**Java · Spring Boot · Spring Security · PostgreSQL · Next.js · React · TypeScript**

[![Live Website](https://img.shields.io/badge/Live_Website-Vercel-000000?style=for-the-badge&logo=vercel)](https://medi-care-smart.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://medicare-smart.onrender.com)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A role-based healthcare platform connecting patients, doctors, and hospital administrators through one integrated web application.**

[**🌐 Open Live Application**](https://medi-care-smart.vercel.app/) · [**⚙️ Backend Server**](https://medicare-smart.onrender.com) · [**💻 Source Code**](https://github.com/Monuyadav18/MediCare-Smart)

</div>

---

## 📌 Project Overview

**MediCare Smart** is a full-stack hospital management system designed to simplify appointment booking, doctor scheduling, patient records, and administrative operations. The application has separate **Patient**, **Doctor**, and **Admin** portals, secured by JWT authentication and role-based access control.

The frontend is deployed on **Vercel**, and the Spring Boot backend is deployed on **Render**. The doctor appointments and queue page has been tested successfully in both local and deployed environments after resolving a Hibernate lazy-loading issue.

> **Status:** Actively developed and deployed. A working deployment does not imply every workflow or security scenario has completed end-to-end testing. Do not enter real sensitive patient data into a demo without appropriate safeguards.

## 🔗 Live Deployment

| Component | Platform | URL |
| --- | --- | --- |
| **Frontend / Web App** | Vercel | https://medi-care-smart.vercel.app/ |
| **Spring Boot Backend** | Render | https://medicare-smart.onrender.com |
| **REST API Base URL** | Render | `https://medicare-smart.onrender.com/api/v1` |
| **Source Repository** | GitHub | https://github.com/Monuyadav18/MediCare-Smart |

> The backend root URL is a service address, **not necessarily a public API documentation page**. Protected API endpoints require authentication. Free or sleeping hosting instances may take extra time to respond to the first request.

## ✨ Features

### 👤 Patient Portal

- Patient sign-up, login, and JWT-authenticated access
- Dashboard and personal profile management
- Discover doctors and search by specialization
- Book appointments using doctor availability and appointment slots
- View upcoming appointments and appointment history
- Reschedule appointments and follow appointment statuses
- Appointment check-in workflow
- Password recovery and reset functionality

### 🩺 Doctor Portal

- Role-specific dashboard and appointment summary
- Doctor profile management
- Manage availability and consultation slots
- View assigned appointments and appointment details
- **Appointments & Queue** page with appointment status filters
- Queue and consultation workflow support
- Doctor appointment listing tested locally and on the live deployment

### 🛡️ Admin Portal

- Hospital administration dashboard
- Manage patients and doctors
- Onboard new doctors
- Manage and review hospital appointments
- Organize hospital data and operational workflows

### 📅 Smart Appointment & Queue Management

- Slot-based scheduling and appointment booking
- Doctor availability management
- Booking conflict checks
- Appointment rescheduling
- Status-based appointment tracking, including **Booked, Confirmed, Checked In, In Queue, In Consultation, Completed, Cancelled, No Show, and Rescheduled**
- Check-in and queue-related workflows; continue validating full end-to-end transitions

### 🔐 Authentication & Security

- Spring Security with JWT authentication
- Role-based access for **PATIENT**, **DOCTOR**, and **ADMIN**
- Permission-based authorization in backend services
- Password-reset support through configured email service
- OAuth2 provider integration support (requires provider configuration)

### 🗂️ Additional Hospital Modules

- Patient and doctor management
- Department management
- Insurance-related data models
- Appointment slots and availability
- Password-reset tokens and authentication providers

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js (App Router), React, TypeScript, CSS |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Web |
| **Security** | Spring Security, JWT, OAuth2 support, role-based access control |
| **ORM / Persistence** | Spring Data JPA, Hibernate |
| **Database** | PostgreSQL |
| **Backend Utilities** | Lombok, ModelMapper |
| **Build & Tools** | Maven / Maven Wrapper, npm, Git, Qodana |
| **Deployment** | Vercel (frontend), Render (backend) |

## 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │    Patient / Doctor /   │
                         │      Admin Browser      │
                         └────────────┬────────────┘
                                      │ HTTPS
                         ┌────────────▼────────────┐
                         │  Next.js + React + TS   │
                         │        Vercel           │
                         └────────────┬────────────┘
                                      │ REST / JSON + JWT
                         ┌────────────▼────────────┐
                         │ Java + Spring Boot API  │
                         │         Render          │
                         ├─────────────────────────┤
                         │ Controllers / Services  │
                         │ Spring Security / JPA   │
                         └────────────┬────────────┘
                                      │ JDBC / Hibernate
                         ┌────────────▼────────────┐
                         │       PostgreSQL        │
                         └─────────────────────────┘
```

## 📁 Project Structure

> This tree summarizes the structure provided for the project. Specific filenames or additional subfolders may vary as development continues.

```text
MediCare-Smart/
├── frontend/
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                # Admin dashboard and management
│   │   │   ├── doctor/               # Dashboard, profile, availability, queue
│   │   │   ├── patient/              # Dashboard, doctors, bookings, profile
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # Authentication state
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Helpers and configuration
│   │   ├── services/                 # API integration
│   │   └── types/                    # TypeScript definitions
│   ├── package.json
│   └── next.config.ts
├── src/
│   ├── main/
│   │   ├── java/com/codingshuttle/youtube/hospitalManagement/
│   │   │   ├── config/               # Application configuration
│   │   │   ├── controller/           # REST API controllers
│   │   │   ├── dto/                  # Request / response DTOs
│   │   │   ├── entity/               # JPA entities and enums
│   │   │   ├── repository/           # Spring Data repositories
│   │   │   ├── security/             # JWT / OAuth2 / permissions
│   │   │   ├── service/              # Business logic
│   │   │   └── error/                # Error handling
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

## 🚀 Run Locally

### Prerequisites

- **JDK 21** (or a version compatible with the project's Maven configuration)
- **PostgreSQL**
- **Node.js and npm** compatible with `frontend/package.json`
- **Git**
- Maven is optional if you use the included Maven Wrapper

### 1. Clone the Repository

```bash
git clone https://github.com/Monuyadav18/MediCare-Smart.git
cd MediCare-Smart
```

### 2. Prepare PostgreSQL

Create a development database in PostgreSQL, for example:

```sql
CREATE DATABASE "hospitalDB";
```

Use your **actual** database name in the JDBC connection URL. Avoid pointing local development at your production database.

### 3. Set Backend Environment Variables

The Spring Boot application reads sensitive configuration from environment variables. Check `src/main/resources/application.properties` for the full list of required settings.

**Windows PowerShell:**

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/hospitalDB"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_local_postgresql_password"
$env:JWT_SECRET="your_long_random_jwt_secret"
$env:MAIL_USERNAME="your_email_address"
$env:MAIL_PASSWORD="your_email_app_password"
```

These are **example values**, not production credentials. Configure any additional required variables (such as OAuth2 credentials or other security settings) according to `application.properties`. Set them in the **same terminal session** where you start Spring Boot.

> **Important:** `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `MAIL_USERNAME` must resolve correctly. Missing placeholders can prevent Spring Boot from starting. Never commit real secrets.

### 4. Start the Backend

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**

```bash
./mvnw spring-boot:run
```

Backend (default): `http://localhost:8080`  
API prefix: `http://localhost:8080/api/v1`

### 5. Start the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Then run:

```bash
npm run dev
```

Open **http://localhost:3000**.

## 👥 User Roles

| Role | Main Capabilities |
| --- | --- |
| **PATIENT** | Profile, doctor search, booking, appointment history, rescheduling, check-in |
| **DOCTOR** | Profile, availability, assigned appointments, queue and consultation management |
| **ADMIN** | Hospital overview, patient/doctor management, onboarding, appointments |

## 🔌 REST API Overview

Base path: `/api/v1`

The following are representative routes from the project's documented modules. Check the controller mappings for the complete endpoint list and method-level authorization.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | User registration |
| `POST` | `/auth/login` | Login and JWT issuance |
| `GET` | `/public/doctors` | Browse public doctor information |
| `GET` | `/patients/profile` | Retrieve patient profile |
| `POST` | `/patients/appointments` | Book appointment |
| `GET` | `/doctors/appointments` | Retrieve doctor's appointments (confirm exact mapping in controller) |
| `GET` | `/admin/patients` | Admin patient list |
| `POST` | `/admin/onBoardNewDoctor` | Admin doctor onboarding |

Authenticated requests use:

```http
Authorization: Bearer <your_jwt_token>
```

**Production API base:** `https://medicare-smart.onrender.com/api/v1`

## 🗃️ Core Data Models

| Model | Responsibility |
| --- | --- |
| `User` | Authentication identity, roles and provider information |
| `Patient` | Patient profile and appointment relationships |
| `Doctor` | Doctor profile, specialization and availability |
| `Appointment` | Booking, patient/doctor, timing, reason and status |
| `AppointmentSlot` | Time-slot scheduling and availability |
| `Department` | Hospital departments |
| `Insurance` | Insurance-related information |
| `PasswordResetToken` | Password recovery flow |

## ☁️ Deployment

### Frontend — Vercel

- **Project:** `medi-care-smart`
- **Root directory:** `frontend`
- **Live URL:** https://medi-care-smart.vercel.app/
- Configure the frontend environment variable:

```dotenv
NEXT_PUBLIC_API_URL=https://medicare-smart.onrender.com/api/v1
```

### Backend — Render

- **Service:** `medicare-smart`
- **Live URL:** https://medicare-smart.onrender.com
- Configure production PostgreSQL, JWT, mail and other required environment variables in Render's **Environment** settings.
- Ensure frontend production origin is permitted by the backend's CORS configuration.
- Deploy new backend commits and verify the service is **Live** before testing the web app.

> Keep production credentials in the hosting provider's environment settings—not in the repository or frontend code.

## 🧪 Testing & Quality

**Backend tests:**

```powershell
.\mvnw.cmd test
```

**Frontend lint (if configured in `frontend/package.json`):**

```bash
cd frontend
npm run lint
```

The repository also includes `qodana.yaml` for code-quality tooling. No automated test coverage or CI pass rate is claimed here.

### Recently Verified

- [x] Backend starts with correctly configured PostgreSQL and mail environment variables
- [x] Doctor **Appointments & Queue** page works on `localhost:3000`
- [x] Doctor **Appointments & Queue** page works on the live Vercel deployment
- [x] Hibernate lazy-loading failure in the doctor appointment listing resolved
- [ ] Complete end-to-end regression tests for every appointment status transition
- [ ] Expand integration and authorization test coverage

## 🛣️ Roadmap

- [ ] Complete end-to-end validation of booking → check-in → queue → consultation → completion
- [ ] Add comprehensive integration, authorization and security tests
- [ ] Document all REST endpoints with request/response examples
- [ ] Add verified screenshots of the patient, doctor and admin portals
- [ ] Improve monitoring, error reporting and deployment reliability
- [ ] Harden production privacy, audit logging and sensitive-data handling

## 🔒 Security & Privacy

- Never commit `.env` files, database credentials, email passwords, OAuth2 secrets or JWT signing keys.
- Use HTTPS and restrict CORS to trusted origins.
- Protect patient and doctor endpoints with appropriate authorization.
- Use a separate development database for local testing.
- Review privacy, access logging, backup, migrations and data retention before handling real patient information.

## 👨‍💻 Development & Attribution

**MediCare Smart** includes a full-stack frontend and extended hospital workflows developed and integrated as part of this project, including role-specific dashboards, scheduling, appointment management, queue workflows and deployment.

This repository builds on an existing **MIT-licensed hospital management backend**. The original copyright and license terms are preserved in [`LICENSE`](LICENSE), including attribution to **EternalKnight002 (2025)**. The original upstream code and later enhancements should not be represented as having the same authorship.

**Maintained by:** [Monu Yadav](https://github.com/Monuyadav18)

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details and original copyright notices.

---

<div align="center">

**Built with Java, Spring Boot, PostgreSQL, Next.js & React.**

[Live Demo](https://medi-care-smart.vercel.app/) · [Backend](https://medicare-smart.onrender.com) · [GitHub](https://github.com/Monuyadav18/MediCare-Smart)

</div>
