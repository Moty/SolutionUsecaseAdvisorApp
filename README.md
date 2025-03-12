# SAP Solution Advisor Webapp

A web-based, mobile-friendly application to help SAP consultants and external partners identify the best SAP solutions for specific business challenges. This tool uses PDF matching technology to map business requirements to appropriate SAP solutions and use cases.

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
- **Similarity Visualization**: Advanced visualizations for similarity scores including bar charts, radar charts, and treemaps
- **Alternative Candidates**: View alternative matching candidates with detailed similarity metrics
- **About Screen**: Information about the development team and application

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Material-UI
- **Database**: MongoDB with Mongoose ORM
- **PDF Processing**: 
  - pdf-lib for form field extraction
  - Tesseract OCR integration for text extraction from image-based PDFs
- **Charts**: Recharts for interactive visualizations
- **State Management**: React Hooks for state management
- **API**: RESTful API for data communication
- **PDF Viewer**: React-PDF for document preview

## Architecture

The application follows a modern client-server architecture:

### Backend Architecture
- **Repository Pattern**: Clean separation of data access logic
- **Service Layer**: Business logic encapsulation
- **REST API**: Stateless communication with the frontend
- **Models**: Mongoose schemas for data validation
- **Interfaces**: Well-defined contracts between components

### Frontend Architecture
- **Component-Based**: Modular UI components with clear responsibilities
- **Custom Hooks**: Reusable logic for data fetching and state management
- **Responsive Design**: Mobile-first approach using Material-UI
- **Visualization Components**: Advanced charts and graphs for data representation

## Project Structure

```
├── backend/                # Node.js backend
│   ├── config/             # Configuration files
│   │   └── database.js     # Database configuration
│   ├── data/               # Data files
│   │   ├── useCases.json   # SAP use cases data
│   │   ├── newUseCases.json # User-created use cases
│   │   └── userData.json   # User preferences and data
│   │   └── SampleData/     # Sample PDF files for testing
│   ├── models/             # Mongoose models
│   │   ├── useCase.js      # Use case schema
│   │   ├── newUseCase.js   # New use case schema
│   │   └── userData.js     # User data schema
│   ├── repositories/       # Data access layer
│   │   ├── interfaces/     # Repository interfaces
│   │   └── mongodb/        # MongoDB implementations
│   ├── routes/             # API routes
│   │   ├── solutions.js    # Solutions API endpoints
│   │   └── status.js       # Health check endpoints
│   ├── scripts/            # Utility scripts
│   │   └── importData.js   # Data import script
│   ├── services/           # Business logic layer
│   │   └── solutionsService.js # Solution business logic
│   ├── uploads/            # Temporary upload directory
│   ├── utils/              # Utility functions
│   │   └── dbStatus.js     # Database status check
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
│   │   │   ├── About.js                 # About screen with developer info
│   │   │   ├── ComparisonView.js        # Side-by-side comparison of solutions
│   │   │   ├── DashboardSettings.js     # Dashboard customization dialog
│   │   │   ├── ExportButton.js          # CSV export functionality
│   │   │   ├── ExtractedFieldsDisplay.js # Display extracted PDF fields
│   │   │   ├── FavoritesPanel.js        # Favorites management view
│   │   │   ├── FilterHistoryPanel.js    # Filter history sidebar
│   │   │   ├── FilterPanel.js           # Filtering controls
│   │   │   ├── Header.js                # Application header with navigation
│   │   │   ├── InteractiveDashboard.js  # Dashboard with charts and metrics
│   │   │   ├── MatrixView.js            # Grid layout view of solutions
│   │   │   ├── NewUseCasesList.js       # List of user-created use cases
│   │   │   ├── PdfMatcher.js            # PDF upload and matching component
│   │   │   ├── PdfViewer.js             # PDF preview component
│   │   │   ├── RecommendationList.js    # List view of solutions
│   │   │   ├── SaveNewUseCaseForm.js    # Form to save new use cases
│   │   │   ├── SimilarityVisualization.js # Visualizations for similarity scores
│   │   │   ├── SimilarityWeightSettings.js # Settings for similarity weighting
│   │   │   ├── SolutionDetailModal.js   # Modal for solution details in matrix view
│   │   │   ├── SolutionTile.js          # Compact card for matrix view
│   │   │   └── ViewToggle.js            # Toggle between list and matrix views
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
- MongoDB (local or cloud instance)
- Tesseract (optional, for OCR functionality)

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
4. Configure MongoDB connection in `backend/config/database.js`

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

### Building for Production

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```
2. Deploy the backend and frontend build directory to your production server

## API Endpoints

### Core Endpoints
- `GET /api/solutions`: Get filtered solutions
  - Query parameters: `role`, `module`, `keyword`
- `GET /api/metrics`: Get metrics for dashboard
- `GET /api/export`: Export filtered solutions as CSV
  - Query parameters: `role`, `module`, `keyword`
- `POST /api/match-pdf`: Match PDF content to existing use cases
  - Form data: `pdf` (file), `threshold` (similarity threshold), `useAI` (boolean), `customWeights` (optional)

### Enhanced Feature Endpoints
- `GET /api/favorites`: Get user's favorite solutions
  - Query parameters: `userId` (optional)
- `POST /api/favorites`: Add a solution to favorites
  - Body: `useCaseId`, `userId` (optional)
- `DELETE /api/favorites/:id`: Remove a solution from favorites
  - Query parameters: `userId` (optional)
- `GET /api/annotations`: Get user's annotations
  - Query parameters: `userId` (optional)
- `POST /api/annotations`: Add or update an annotation
  - Body: `useCaseId`, `text`, `userId` (optional)
- `DELETE /api/annotations/:id`: Remove an annotation
  - Query parameters: `userId` (optional)
- `GET /api/ratings`: Get user's ratings
  - Query parameters: `userId` (optional)
- `POST /api/ratings`: Add or update a rating
  - Body: `useCaseId`, `rating`, `feedback` (optional), `userId` (optional)
- `GET /api/ratings/summary`: Get aggregated ratings
- `GET /api/filter-history`: Get filter history
  - Query parameters: `userId` (optional)
- `POST /api/filter-history`: Add a filter to history
  - Body: `filters`, `name` (optional), `userId` (optional)
- `GET /api/new-use-cases`: Get user-created use cases
  - Query parameters: `userId` (optional), `status`
- `POST /api/new-use-cases`: Save a new use case
  - Body: `extractedFields`, `mappedFields`, `pdfFileName`, `userId` (optional)
- `PUT /api/new-use-cases/:id/status`: Update status of a use case
  - Body: `status`
- `PUT /api/new-use-cases/:id/notes`: Add notes to a use case
  - Body: `notes`
- `GET /api/new-use-cases/export`: Export new use cases as CSV
  - Query parameters: `userId` (optional), `status`
- `DELETE /api/new-use-cases/:id`: Delete a user-created use case
- `POST /api/similarity-weights`: Save custom similarity weights
  - Body: `weights` object with field weights

## PDF Matching Feature

The application includes a PDF matching feature that allows users to upload PDF forms and find the best matching SAP solution based on the content. The matching process works as follows:

1. **Form Field Extraction**: The system extracts form fields from the uploaded PDF using the pdf-lib library or OCR technology for image-based PDFs.
2. **Field Mapping**: Extracted fields are mapped to a standardized structure for comparison:
   - `focusArea` → maps to "Mapped Solution" field
   - `process` → maps to "Challenge" field
   - `affected` → maps to "User Role" field
   - `improvement` → maps to "Enablers" field
   - `howToImprove` → maps to "Key Benefits" field

3. **Similarity Calculation**: The system calculates similarity scores between the extracted fields and existing use cases using advanced text matching algorithms.
   - Optional AI-enhanced matching can be enabled for better semantic understanding
   - Customizable field weights allow users to prioritize certain aspects of the match

4. **Result Display**: The best matching use case is displayed alongside the extracted fields with:
   - Overall similarity score
   - Field-by-field similarity breakdown
   - Detailed matching matrix visualization
   - Alternative candidates with their own similarity scores

5. **Similarity Visualizations**:
   - Bar charts showing field-by-field similarity scores
   - Radar charts comparing score distribution
   - Treemap visualizations of weighted similarity
   - Detailed matching matrix for in-depth analysis

6. **Save as New Use Case**: If no satisfactory match is found, users can save the extracted content as a new use case for future reference.

Users can download an empty form template to ensure their PDFs have the correct structure for optimal matching results.

## User Data Management

The application maintains several types of user data:

- **Favorites**: Solutions marked as favorites by users
- **Annotations**: Personal notes added to solutions
- **Ratings**: Numerical ratings and feedback for solutions
- **Filter History**: Saved filter combinations for quick access
- **New Use Cases**: User-created use cases from PDF extraction

All user data is stored in MongoDB and can be associated with specific user IDs for multi-user environments.

## Development Information

### Testing

Several test scripts are available in the backend directory:
- PDF extraction tests
- Field service quotes tests
- Similarity calculation tests
- PDF matcher tests

### Documentation

In-code documentation follows JSDoc standards with detailed descriptions of:
- Component props
- Function parameters
- Return values
- Interface contracts

### Contributing

1. Follow the existing code structure and patterns
2. Maintain clear separation of concerns
3. Document all new features and API endpoints
4. Write tests for new functionality
