# SAP Solution Advisor Webapp

A web-based, mobile-friendly application to help SAP consultants and external partners identify the best SAP solutions for specific business challenges.

## Features

### Core Features
- **Faceted Filters**: Filter solutions by SAP Module, User Role, and keyword search
- **Interactive Dashboard**: Visual insights showing distribution of solutions by category
- **Recommendation List**: Expandable solution cards with detailed information
- **CSV Export**: Download filtered results as a CSV file
- **Responsive Design**: Mobile-friendly interface
- **PDF Matching**: Upload PDF forms to find matching SAP solutions based on content similarity
- **Form Template**: Download empty form templates for standardized input
- **Side-by-Side Comparison**: View extracted PDF fields alongside matched solutions

### Enhanced Features
- **Favorites Management**: Mark solutions as favorites and access them in a dedicated view
- **Side-by-Side Comparison**: Select multiple solutions to compare them in a detailed table view
- **Annotations and Notes**: Add personal notes to solutions for future reference
- **User Ratings**: Rate solutions and provide feedback
- **Customizable Dashboard**: Configure which charts and metrics are displayed
- **Filter History**: Access and reapply previous filter combinations
- **Alternative Views**: Toggle between list view and matrix/tile view for different ways to browse solutions
- **New Use Cases**: Save extracted PDF data as new use cases for future matching

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Material-UI
- **Data**: JSON file as the data source
- **PDF Processing**: PDF-lib for form field extraction

## Project Structure

```
├── backend/                # Node.js backend
│   ├── data/               # Data files
│   │   ├── useCases.json   # SAP use cases data
│   │   ├── newUseCases.json # User-created use cases
│   │   └── SampleData/     # Sample PDF files for testing
│   ├── routes/             # API routes
│   │   └── solutions.js    # Solutions API endpoints
│   ├── pdfMatcher.js       # PDF matching and form field extraction
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   │   ├── index.html      # HTML template
│   │   ├── manifest.json   # Web app manifest
│   │   └── AreaOfImprovement_Empty_Form.pdf # Downloadable form template
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── ComparisonView.js      # Side-by-side comparison of solutions
│   │   │   ├── DashboardSettings.js   # Dashboard customization dialog
│   │   │   ├── ExportButton.js        # CSV export functionality
│   │   │   ├── ExtractedFieldsDisplay.js # Display extracted PDF fields
│   │   │   ├── FavoritesPanel.js      # Favorites management view
│   │   │   ├── FilterHistoryPanel.js  # Filter history sidebar
│   │   │   ├── FilterPanel.js         # Filtering controls
│   │   │   ├── Header.js              # Application header with navigation
│   │   │   ├── InteractiveDashboard.js # Dashboard with charts and metrics
│   │   │   ├── MatrixView.js          # Grid layout view of solutions
│   │   │   ├── NewUseCasesList.js     # List of user-created use cases
│   │   │   ├── PdfMatcher.js          # PDF upload and matching component
│   │   │   ├── PdfViewer.js           # PDF preview component
│   │   │   ├── RecommendationList.js  # List view of solutions
│   │   │   ├── SaveNewUseCaseForm.js  # Form to save new use cases
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
- `POST /api/match-pdf`: Match PDF content to existing use cases
  - Form data: `pdf` (file), `threshold` (similarity threshold)

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
- `GET /api/new-use-cases`: Get user-created use cases
- `POST /api/new-use-cases`: Save a new use case
- `DELETE /api/new-use-cases/:id`: Delete a user-created use case

## PDF Matching Feature

The application includes a PDF matching feature that allows users to upload PDF forms and find the best matching SAP solution based on the content. The matching process works as follows:

1. **Form Field Extraction**: The system extracts form fields from the uploaded PDF using the pdf-lib library.
2. **Field Mapping**: Extracted fields are mapped to a standardized structure for comparison.
3. **Similarity Calculation**: The system calculates similarity scores between the extracted fields and existing use cases.
4. **Result Display**: The best matching use case is displayed alongside the extracted fields in a side-by-side comparison.

Users can also download an empty form template to ensure their PDFs have the correct structure for optimal matching results.
