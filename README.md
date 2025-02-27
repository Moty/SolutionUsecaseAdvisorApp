# SAP Solution Advisor Webapp

A web-based, mobile-friendly application to help SAP consultants and external partners identify the best SAP solutions for specific business challenges.

## Features

### Core Features
- **Faceted Filters**: Filter solutions by SAP Module, User Role, and keyword search
- **Interactive Dashboard**: Visual insights showing distribution of solutions by category
- **Recommendation List**: Expandable solution cards with detailed information
- **CSV Export**: Download filtered results as a CSV file
- **Responsive Design**: Mobile-friendly interface

### Enhanced Features
- **Favorites Management**: Mark solutions as favorites and access them in a dedicated view
- **Side-by-Side Comparison**: Select multiple solutions to compare them in a detailed table view
- **Annotations and Notes**: Add personal notes to solutions for future reference
- **User Ratings**: Rate solutions and provide feedback
- **Customizable Dashboard**: Configure which charts and metrics are displayed
- **Filter History**: Access and reapply previous filter combinations
- **Alternative Views**: Toggle between list view and matrix/tile view for different ways to browse solutions

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Material-UI
- **Data**: JSON file as the data source

## Project Structure

```
├── backend/                # Node.js backend
│   ├── data/               # Data files
│   │   └── useCases.json   # SAP use cases data
│   ├── routes/             # API routes
│   │   └── solutions.js    # Solutions API endpoints
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   │   ├── index.html      # HTML template
│   │   └── manifest.json   # Web app manifest
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── ComparisonView.js      # Side-by-side comparison of solutions
│   │   │   ├── DashboardSettings.js   # Dashboard customization dialog
│   │   │   ├── ExportButton.js        # CSV export functionality
│   │   │   ├── FavoritesPanel.js      # Favorites management view
│   │   │   ├── FilterHistoryPanel.js  # Filter history sidebar
│   │   │   ├── FilterPanel.js         # Filtering controls
│   │   │   ├── Header.js              # Application header with navigation
│   │   │   ├── InteractiveDashboard.js # Dashboard with charts and metrics
│   │   │   ├── MatrixView.js          # Grid layout view of solutions
│   │   │   ├── RecommendationList.js  # List view of solutions
│   │   │   ├── SolutionDetailModal.js # Modal for solution details in matrix view
│   │   │   ├── SolutionTile.js        # Compact card for matrix view
│   │   │   └── ViewToggle.js          # Toggle between list and matrix views
│   │   ├── utils/          # Utility functions
│   │   │   └── api.js      # API service
│   │   ├── App.js          # Main App component
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Core Endpoints
- `GET /api/solutions`: Get filtered solutions
  - Query parameters: `role`, `module`, `keyword`
- `GET /api/metrics`: Get metrics for dashboard
- `GET /api/export`: Export filtered solutions as CSV
  - Query parameters: `role`, `module`, `keyword`

### Enhanced Feature Endpoints
- `GET /api/favorites`: Get user's favorite solutions
- `POST /api/favorites`: Add a solution to favorites
- `DELETE /api/favorites/:id`: Remove a solution from favorites
- `GET /api/annotations`: Get user's annotations
- `POST /api/annotations`: Add or update an annotation
- `DELETE /api/annotations/:id`: Remove an annotation
- `GET /api/ratings`: Get user's ratings
- `POST /api/ratings`: Add or update a rating
- `GET /api/ratings/summary`: Get aggregated ratings
- `GET /api/filter-history`: Get filter history
- `POST /api/filter-history`: Add a filter to history
