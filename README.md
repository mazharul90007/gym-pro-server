# Gym Class Scheduling and Membership Management System

## Project Overview

The Gym Class Scheduling and Membership Management System is a robust backend solution designed to streamline gym operations. It effectively manages user roles (Admin, Trainer, Trainee), class scheduling, and membership bookings. The system enforces specific business rules to ensure efficient management, including daily class limits, trainee capacity per class, and robust authentication and authorization controls.

---

## Technology Stack

- **Programming Language:** TypeScript
- **Web Framework:** Express.js
- **ODM:** Mongoose
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Architectural Pattern:** Modular Pattern

---

## Relational Diagram

Here's the conceptual relational diagram for the backend. This diagram illustrates how the `MEMBER`, `CLASS_SCHEDULE`, and `BOOKING` models relate to each other in the MongoDB database.

**[Link to your Hosted Relational Diagram Image (e.g., on Imgur, GitHub Gist, or cloud storage)]**

_(Replace the placeholder above with a direct link to an image of your diagram. You can generate this diagram using tools that support Mermaid.js, save it as an image, and then host it.)_

---

## API Endpoints

The API is versioned at `/api/v1`. All requests use JSON.

### Authentication (`/api/v1/auth`)

- **`POST /api/v1/auth/login`**
  - **Description:** Authenticates a user and provides access and refresh tokens.
  - **Access:** Public
  - **Request Body:** `TLoginPayload`
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response:** `TLoginResponse`
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User logged in successfully",
      "data": {
        "accessToken": "string",
        "refreshToken": "string"
      }
    }
    ```

### Member Management (`/api/v1/members`)

- **`POST /api/v1/members`**
  - **Description:** Creates a new member (Admin, Trainer, or Trainee).
  - **Access:** Admin (after initial setup) or Public (for initial trainee signup)
  - **Request Body:** `TMemberCreateInput` (see schema below)
  - **Response:** `Partial<IMember>`
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Member created successfully",
      "data": {
        // ... partial IMember data (e.g., memberId, email, role)
      }
    }
    ```
- **`GET /api/v1/members`**
  - **Description:** Retrieves a list of all members.
  - **Access:** Admin
  - **Query Parameters:** `role` (e.g., `?role=trainer`), `isActive` (e.g., `?isActive=true`), `search` (full-text search)
  - **Response:** Array of `IMember`
- **`GET /api/v1/members/:id`**
  - **Description:** Retrieves a single member by ID.
  - **Access:** Admin
  - **Response:** `IMember`
- **`PATCH /api/v1/members/:id`**
  - **Description:** Updates an existing member's information.
  - **Access:** Admin
  - **Request Body:** `TMemberUpdateInput` (partial `IMember`)
  - **Response:** Updated `IMember`
- **`DELETE /api/v1/members/:id`**
  - **Description:** Soft deletes a member (sets `isDeleted` to true).
  - **Access:** Admin
  - **Response:** Deleted `IMember`

### Class Scheduling (`/api/v1/class-schedules`)

- **`POST /api/v1/class-schedules`**
  - **Description:** Creates a new class schedule and assigns a trainer.
  - **Access:** Admin
  - **Business Rules:** Max 5 schedules per day, each 2 hours long.
  - **Request Body:**
    ```json
    {
      "title": "Morning Yoga",
      "trainerId": "ObjectId of a trainer member",
      "date": "2025-06-01T00:00:00.000Z",
      "startTime": "08:00",
      "endTime": "10:00"
    }
    ```
  - **Response:** Created `IClassSchedule` object.
- **`GET /api/v1/class-schedules`**
  - **Description:** Retrieves all class schedules. Trainers can view their assigned schedules.
  - **Access:** Admin, Trainer (filtered)
- **`GET /api/v1/class-schedules/:id`**
  - **Description:** Retrieves a single class schedule by ID.
  - **Access:** Admin, Trainer
- **`PATCH /api/v1/class-schedules/:id`**
  - **Description:** Updates a class schedule.
  - **Access:** Admin
- **`DELETE /api/v1/class-schedules/:id`**
  - **Description:** Deletes a class schedule.
  - **Access:** Admin

### Booking Management (`/api/v1/bookings`)

- **`POST /api/v1/bookings`**
  - **Description:** Trainee books a class schedule.
  - **Access:** Trainee
  - **Business Rules:** Max 10 trainees per schedule. Trainee cannot book multiple classes in the same time slot.
  - **Request Body:**
    ```json
    {
      "scheduleId": "ObjectId of a class schedule"
    }
    ```
  - **Response:** Created `IBooking` object.
- **`GET /api/v1/bookings`**
  - **Description:** Trainees can view their own bookings. Admins can view all bookings.
  - **Access:** Admin, Trainee
- **`GET /api/v1/bookings/:id`**
  - **Description:** Retrieves a single booking by ID.
  - **Access:** Admin, Trainee (if their own booking)
- **`DELETE /api/v1/bookings/:id`**
  - **Description:** Trainee cancels their booking.
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
