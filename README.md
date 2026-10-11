# Hospital Management System

A comprehensive Spring Boot application demonstrating Spring Data JPA with a real-world hospital management system implementation.

## Features

- **Patient Management**: Register and manage patient records with complete medical information
- **Doctor Management**: Onboard doctors and manage their profiles and specializations
- **Appointment System**: Schedule and manage appointments between patients and doctors
- **Insurance Integration**: Associate insurance policies with patient records
- **Department Management**: Organize doctors into departments with department heads
- **Authentication & Authorization**:
    - JWT-based authentication
    - OAuth2 integration (Google, GitHub)
    - Role-based access control (ADMIN, DOCTOR, PATIENT)
    - Fine-grained permission system

## Tech Stack

- **Java**: 21
- **Spring Boot**: 3.3.5
- **Spring Data JPA**: Database operations and repository pattern
- **Spring Security**: Authentication and authorization
- **PostgreSQL**: Primary database
- **JWT**: Token-based authentication
- **OAuth2**: Social login integration
- **Lombok**: Reduce boilerplate code
- **ModelMapper**: Object mapping
- **Maven**: Dependency management

## Prerequisites

- JDK 21 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE hospitalDB;
```

2. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hospitalDB
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spring-boot-data-jpa-hospital-management-system.git
cd spring-boot-data-jpa-hospital-management-system
```

2. Build the project:
```bash
./mvnw clean install
```

3. Run the application:
```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080/api/v1`

## API Endpoints

### Public Endpoints

- `GET /api/v1/public/doctors` - Get all doctors

### Authentication

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user

### Patient Endpoints (Requires PATIENT role)

- `POST /api/v1/patients/appointments` - Create new appointment
- `GET /api/v1/patients/profile` - Get patient profile

### Doctor Endpoints (Requires DOCTOR role)

- `GET /api/v1/doctors/appointments` - Get all appointments for logged-in doctor

### Admin Endpoints (Requires ADMIN role)

- `GET /api/v1/admin/patients` - Get all patients (paginated)
- `POST /api/v1/admin/onBoardNewDoctor` - Onboard a new doctor

## Security Configuration

The application uses a multi-layered security approach:

### Roles
- **ADMIN**: Full system access
- **DOCTOR**: Access to appointments and patient information
- **PATIENT**: Access to own profile and appointment booking

### Permissions
- `patient:read` - Read patient information
- `patient:write` - Modify patient information
- `appointment:read` - View appointments
- `appointment:write` - Create/modify appointments
- `appointment:delete` - Delete appointments
- `user:manage` - Manage users (admin only)
- `report:view` - View reports

## Data Models

### Patient
- Personal information (name, email, gender, birth date)
- Blood group type
- Insurance details
- Appointment history

### Doctor
- Personal information
- Specialization
- Department associations
- Appointment schedule

### Appointment
- Appointment time
- Reason for visit
- Associated patient and doctor

### Insurance
- Policy number
- Provider
- Validity period

## Authentication Flow

1. **Email/Password**: Register via `/auth/signup` and login via `/auth/login`
2. **OAuth2**: Login using Google or GitHub through OAuth2 endpoints
3. **JWT Token**: All authenticated requests require Bearer token in Authorization header

## Development

### Running Tests
```bash
./mvnw test
```

### Code Quality
The project includes Qodana configuration for code quality analysis:
```bash
# Configuration available in qodana.yaml
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/codingshuttle/youtube/hospitalManagement/
│   │       ├── config/          # Application configuration
│   │       ├── controller/      # REST controllers
│   │       ├── dto/             # Data transfer objects
│   │       ├── entity/          # JPA entities
│   │       ├── repository/      # Spring Data repositories
│   │       ├── security/        # Security configuration
│   │       ├── service/         # Business logic
│   │       └── error/           # Exception handling
│   └── resources/
│       ├── application.properties
│       └── data.sql             # Sample data
└── test/                        # Unit and integration tests
```

## Key Features Demonstrated

- **Spring Data JPA**: Custom queries, pagination, sorting
- **Relationships**: OneToOne, OneToMany, ManyToMany mappings
- **Cascade Operations**: Proper cascade and orphan removal
- **Fetch Strategies**: Lazy and eager loading optimization
- **Transactions**: Declarative transaction management
- **Security**: Method-level security with SpEL expressions
- **OAuth2**: Social login integration
- **Error Handling**: Global exception handler

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.