# EduTrack: Higher Studies Tracking Platform

## Overview

EduTrack is a web-based Higher Studies Tracking Platform designed to streamline the process of collecting, managing, and analyzing student academic progression, competitive exam participation, and admission outcomes.

The platform provides students with a secure digital portal to submit academic details, upload admission documents, and track higher education applications, while enabling institutions to efficiently monitor student progression through analytics and reporting.

## Objectives

* Provide a centralized platform for higher studies tracking
* Reduce repetitive manual data collection
* Enable secure document storage and management
* Generate institutional reports and analytics
* Improve transparency and administrative efficiency

## Features

### Student Features

* User Registration and Authentication
* Profile Management
* Admission Type Selection
* University Information Submission
* Multiple Document Upload Support
* Application Tracking

### Admin Features

* Dashboard for Monitoring Student Applications
* Search and Filtering Functionality
* Analytics and Reports Generation
* CSV Export Functionality
* Alumni Tracking
* Real-Time Dashboard Updates

### System Features

* Secure Authentication
* Role-Based Access Control
* Real-Time Synchronization
* Cloud Document Storage
* CRUD Operations
* Analytics and Visualization

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js

### Database & Cloud Services

* Supabase PostgreSQL
* Supabase Storage
* Supabase Authentication
* Supabase Realtime

### Tools and Libraries

* Multer
* JWT Authentication
* @supabase/supabase-js
* Git & GitHub
* Visual Studio Code

## System Architecture

Frontend → Backend APIs → Database & Storage → Analytics Dashboard

### Components

* Frontend handles user interaction
* Backend processes requests and business logic
* Supabase stores structured data
* Storage manages uploaded documents
* Realtime services synchronize updates

## Database Structure

### Users Table

Stores:

* Name
* Email
* Password (Hashed)
* Role
* Roll Number
* Branch
* Year

### Applications Table

Stores:

* Admission Type
* University Details
* Country
* Score
* Status
* User Reference

### Documents Table

Stores:

* Hall Ticket
* Rank Card
* Seat Allotment Letter
* Admission Letter
* Document URLs

## Installation

### Clone Repository

git clone repository-url

cd EduTrack

### Install Dependencies

npm install

### Configure Environment Variables

Create a `.env` file:

SUPABASE_URL=your_url

SUPABASE_KEY=your_key

JWT_SECRET=your_secret

### Run Backend

npm run dev

### Run Frontend

Open index.html in browser

## Project Workflow

1. Student Registration/Login
2. Profile Creation
3. Admission Details Submission
4. Document Upload
5. Data Storage in Supabase
6. Admin Dashboard Monitoring
7. Analytics and Report Generation

## Testing

* Unit Testing
* Integration Testing
* Functional Testing
* Authentication Testing
* File Upload Testing
* API Testing

## Future Enhancements

* AI-Based Higher Education Recommendations
* Real-Time Notifications
* Multi-Level Administration
* Mobile Application Support
* Advanced Predictive Analytics

## Contributors

* Akshaya Chundi
* Akshitha Reddy
* Divya Teku
* Gandala Ganesh

## License

This project is developed for academic and educational purposes.

## Conclusion

EduTrack provides a secure, scalable, and efficient solution for educational institutions to manage higher studies applications, monitor student progression, and generate valuable institutional insights.
alable, and efficient solution for educational institutions to manage higher studies applications, monitor student progression, and generate valuable institutional insights.
