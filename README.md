# [Gym Pro](https://gym-pro-dun.vercel.app/)


### a Gym Class Scheduling and Membership Management System

## Project Overview

The Gym Class Scheduling and Membership Management System is a robust backend solution designed to streamline gym operations. It effectively manages user roles (Admin, Trainer, Trainee), class scheduling, and membership bookings. The system enforces specific business rules to ensure efficient management, including daily class limits, trainee capacity per class, and robust authentication and authorization controls.
- **Admin:** Admins manage creating and managing trainers, scheduling classes, and assigning trainers to these schedules
- **Trainer:** Trainers conduct the classes and can view their assigned class schedules but cannot create new schedules or manage trainee profiles.
- **Trainee:** Trainees maintain their own profiles, class bookings are subject to availability and the system-enforced limit of 10 trainees per schedule.

---

**[Click Here to View the Live Server](https://gym-pro-dun.vercel.app/)**

## Technology Stack

- **Programming Language:** TypeScript
- **Web Framework:** Express.js
- **ODM:** Mongoose
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Architectural Pattern:** Modular Pattern

---

## Relational Diagram

![ER Diagram](https://i.ibb.co/3YRqBYvc/Gym-Pro.jpg)

---

## API Endpoints

The API is versioned at `/api/v1`. All requests use JSON.

### Authentication (`/api/v1/auth`)

- `POST /api/v1/auth/login`
  - **Description:** Authenticates a user and provides access and refresh tokens.
  - **Access:** Public
- `POST /api/v1/auth/signup`
  - **Description:** Registers a new member (Admin, Trainer, or Trainee). This is the primary endpoint for new user creation.
  - **Access:** Public (typically, for initial setup and admin, trainer, trainee signups), or specific roles if defined in your controller.

### Member Management (`/api/v1/members`)

- `POST /api/v1/members`
  - **Description:** Creates a new member (Admin, Trainer, or Trainee).
  - **Access:** Admin (after initial setup) or Public (for initial trainee signup)
- `GET /api/v1/members`
  - **Description:** Retrieves a list of all members.
  - **Access:** Admin
- `GET /api/v1/members/:id`
  - **Description:** Retrieves a single member by ID.
  - **Access:** Admin
- `PATCH /api/v1/members/:id`
  - **Description:** Updates an existing member's information.
  - **Access:** Admin
- `DELETE /api/v1/members/:id`
  - **Description:** Soft deletes a member (sets `isDeleted` to true).
  - **Access:** Admin

### Class Management (`/api/v1/classes`)

- `POST /api/v1/classes/create-class`
  - **Description:** Creates a new class schedule and assigns a trainer.
  - **Access:** Admin
  - **Business Rules:** Max 5 schedules per day, each 2 hours long.
- `GET /api/v1/classes`
  - **Description:** Retrieves all class schedules. Trainers can view their assigned schedules.
  - **Access:** Admin, Trainer (filtered)
- `GET /api/v1/classes/:id`
  - **Description:** Retrieves a single class schedule by ID.
  - **Access:** Admin, Trainer
- `PATCH /api/v1/classes/:id`
  - **Description:** Updates a class schedule.
  - **Access:** Admin
- `DELETE /api/v1/classes/:id`
  - **Description:** Deletes a class schedule.
  - **Access:** Admin

### Booking Management (`/api/v1/bookings`)

- `POST /api/v1/bookings`
  - **Description:** Trainee books a class schedule.
  - **Access:** Trainee
  - **Business Rules:** Max 10 trainees per schedule. Trainee cannot book multiple classes in the same time slot.
- `PATCH /api/v1/bookings/:id/cancel`
  - **Description:** Trainee cancels their booking.
  - **Access:** Trainee
- `GET /api/v1/bookings`
  - **Description:** Trainees can view their own bookings. Admins can view all bookings.
  - **Access:** Admin, Trainee
- `GET /api/v1/bookings/my-bookings`
  - **Description:** Trainees can view their own bookings.
  - **Access:** Trainee
---

## Database Schema (Model Definitions)

### `IMember`

```typescript
export type IMember = {
  _id?: Types.ObjectId;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressCountry: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  membershipType: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  isActive: boolean;
  role: 'admin' | 'trainer' | 'trainee';
  profilePicture?: string;
  lastLogin?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
```

### `IClass`

```typescript
export type IClass = {
  classId: string;
  name: string;
  description?: string;
  trainer: Types.ObjectId | IMember;
  durationMinutes: number;
  maxCapacity: number;
  currentBookings: number;
  scheduledTime: Date;
  location: string;
  difficultyLevel: DifficultyLevel;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
```

### `IBooking`

```typescript
export type IBooking = {
  member: Types.ObjectId | IMember;
  class: Types.ObjectId | IClass;
  bookingDate: Date;
  status: BookingStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
```

## Admin Credentials for Testing:

- **Admin email:** admin@gmail.com
- **Admin password:** StrongPassword123!

- **Trainer email:** trainer.pro@gmail.com
- **Admin password:** SecureTrainerPass!

## Instructions to Run Locally:

- **Clone the Repository** git clone https://github.com/mazharul90007/gym-pro-server.git
- **Go to the folder:** cd gym-pro
- **Install Dependencies:** npm install
- **Set up Environment Variable:** create a .env file in the root directory of the project.

```
NODE_ENV=development
PORT=3000
DB_URI=mongodb+srv://*******:*******@cluster0.*******/gym-pro?retryWrites=true&w=majority&appName=***** (your mongodb database uri)
BCRYPT_SALT_ROUNDS=12
ADMIN_MAX_SCHEDULES_PER_DAY=5

JWT_SECRET= create a secret token
JWT_REFRESH_SECRET= create a random secret token
JWT_ACCESS_TOKEN_EXPIRES_IN=432000
JWT_REFRESH_TOKEN_EXPIRES_IN=864000
```

- **Build the Project:** npm run build
- **Start the Server:** npm run start:dev

- ## Live Hosting Link:

### [Gym Pro](https://gym-pro-dun.vercel.app/)

- https://gym-pro-dun.vercel.app/

### Postman Documentation Link:

- https://documenter.getpostman.com/view/40157327/2sB2qfAzEs
