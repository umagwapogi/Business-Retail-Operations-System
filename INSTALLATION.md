# Installation Guide

## Prerequisites

- Node.js 20.10 or higher
- PostgreSQL 16 or higher
- npm or yarn package manager
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Business Retail
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v
```

### Individual Docker Builds

**Backend:**
```bash
cd server
docker build -t retail-ops-server .
docker run -p 5000:5000 --env-file .env retail-ops-server
```

**Frontend:**
```bash
cd client
docker build -t retail-ops-client .
docker run -p 3000:80 retail-ops-client
```

## Database Setup

### PostgreSQL Setup

**Using Docker:**
```bash
docker run --name retail_ops_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=retail_ops \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Manual Installation:**
1. Install PostgreSQL 16
2. Create a database named `retail_ops`
3. Update the `DATABASE_URL` in `.env` file

### Prisma Migrations

```bash
cd server

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Default Users

After running the database seed, you can login with these credentials:

- **Admin:** admin@retailops.com / password123
- **Manager:** manager@retailops.com / password123
- **Staff:** staff@retailops.com / password123
- **Customer:** customer@example.com / password123

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Verify database credentials
4. Check if the database exists

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

### Permission Issues

```bash
# Give execute permissions on scripts (Linux/Mac)
chmod +x scripts/*.sh
```

## Development Scripts

**Backend:**
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Production Deployment

### Environment Variables

Make sure to set these in production:

**Backend (.env):**
```env
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
NODE_ENV=production
FRONTEND_URL=<production-frontend-url>
```

**Frontend (.env):**
```env
VITE_API_URL=<production-api-url>
```

### Build for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
# Serve the dist folder with nginx or any static file server
```

## Security Considerations

1. Change all default passwords
2. Use strong JWT secrets in production
3. Enable HTTPS in production
4. Set up proper CORS configuration
5. Use environment variables for sensitive data
6. Regular security updates for dependencies

## Support

For issues and questions, please refer to the main README.md or contact support.
