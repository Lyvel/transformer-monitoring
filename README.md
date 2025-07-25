# Transformer Monitoring

A Next.js application for monitoring electrical transformers with real-time voltage readings and statistics.

## Development

### Prerequisites

-   Node.js 18 or later
-   pnpm package manager

### Install pnpm (if you don't have it)

If you only have npm installed, you can install pnpm globally:

```bash
npm install -g pnpm
```

### Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The page will automatically reload when you make changes to the code.

## Production Deployment with Docker

### Quick Start

1. Build and run with Docker Compose:

```bash
docker-compose up -d --build
```

2. Access the application at [http://localhost:3000](http://localhost:3000)

### Docker Commands

```bash
# Build and start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild without cache
docker-compose build --no-cache
```

## Features

-   Real-time transformer monitoring
-   Voltage readings visualisation
-   Statistical analysis
-   Data source selection
-   Responsive design

## Tech Stack

-   **Framework**: Next.js 15
-   **UI**: React 19 with Tailwind CSS
-   **Charts**: Recharts
-   **Icons**: Lucide React
-   **Components**: Shadcn / Radix UI
