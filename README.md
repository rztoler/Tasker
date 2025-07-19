# Tasker - Secure Client Management System

A secure, intelligent task management and calendar system for managing multiple clients with smart scheduling capabilities.

## Security Features

- **Input Validation & Sanitization**: Comprehensive validation using Joi and HTML sanitization
- **Prompt Injection Protection**: Built-in detection and prevention of malicious prompts
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured for production security
- **Content Security Policy**: Helmet.js implementation
- **Data Encryption**: Secure handling of sensitive data

## Features

- **Client Management**: Track multiple clients with projects and tasks
- **Smart Scheduling**: Automatic task scheduling based on priority and availability
- **Calendar Integration**: View tasks and events in unified calendar
- **Workload Analysis**: Understand capacity and availability
- **Dashboard Views**: Both admin and client-specific dashboards
- **Time Zone Support**: Multi-timezone client support

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:

   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - Other configuration as needed

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Soft delete client
- `GET /api/clients/:id/dashboard` - Client dashboard data

### Projects

- `GET /api/projects` - List projects (with optional client filter)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Soft delete project
- `GET /api/projects/:id/stats` - Project statistics

### Tasks

- `GET /api/tasks` - List tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Soft delete task
- `PATCH /api/tasks/:id/schedule` - Schedule task
- `PATCH /api/tasks/:id/complete` - Mark task complete
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/scheduled` - Get scheduled tasks

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Soft delete event
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/conflicts` - Check for time conflicts

### Calendar

- `GET /api/calendar/view` - Get calendar view (day/week/month)
- `GET /api/calendar/workload` - Get workload analysis
- `GET /api/calendar/dashboard` - Get dashboard summary

## Data Models

### Client

- Company Name, Contact Name, Color, Time Zone
- Email, Phone (optional)
- Soft delete support

### Project

- Name, Description, Status
- Associated with Client
- Progress tracking

### Task

- Name, Description, Priority (1-5), Duration
- Due Date, Status, Scheduling info
- Smart locking for completed past-due tasks

### Event

- Name, Description, Start/End DateTime
- Type, Location, Attendees
- Recurrence support

## Smart Scheduling

The system includes an intelligent scheduling algorithm that:

- Considers task priority, due dates, and duration
- Finds optimal time slots in working hours
- Handles timezone conversions
- Detects and resolves conflicts
- Provides rescheduling suggestions
- Batch scheduling for multiple tasks

## Security Considerations

1. **Input Sanitization**: All user inputs are sanitized to prevent XSS
2. **Prompt Injection Detection**: Advanced pattern matching to detect malicious prompts
3. **Data Validation**: Comprehensive schema validation using Joi
4. **Rate Limiting**: Prevents API abuse
5. **CORS Configuration**: Restricted to allowed origins
6. **Helmet Security**: Security headers and CSP
7. **Soft Deletes**: Data preservation with isActive flags

## Development

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

## Environment Variables

See `.env.example` for complete list of required environment variables.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure secure JWT secret
3. Set up proper CORS origins
4. Configure rate limiting
5. Set up MongoDB with proper authentication
6. Configure SSL/TLS termination

## License

This project includes security measures to prevent misuse and protect against various attack vectors.
