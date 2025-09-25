# Music Admin Panel

A comprehensive React.js admin panel for managing a music streaming application. This admin panel provides complete CRUD operations for users, music categories, music tracks, background music, notes, and note categories.

## Features

### 🔐 Authentication

- Admin login and signup
- JWT token-based authentication
- Protected routes
- User session management

### 👥 User Management

- View all users with search and filtering
- User profile management
- User status management (active/inactive/blocked)
- User creation and editing

### 🎵 Music Management

- **Music Categories**: Create and manage music categories
- **Music Tracks**: Upload and manage music files with metadata
- **Background Music**: Manage ambient and background music
- Category-based organization
- File upload support for audio and images
- Premium content management

### 📝 Notes Management

- **Notes Categories**: Organize notes with custom categories
- **Notes**: Create, edit, and manage rich text notes
- Mood tracking with emoji support
- HTML content support
- Search and filter functionality
- Grid and list view modes

### 🎨 Modern UI/UX

- Responsive design for all devices
- Beautiful gradient themes
- Smooth animations and transitions
- Intuitive navigation
- Modern card-based layouts
- Dark mode ready

## Technology Stack

- **Frontend**: React.js (without TypeScript)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: React Icons (Feather Icons)
- **Styling**: Pure CSS with modern features
- **State Management**: React Context API

## API Integration

The admin panel is designed to work with the provided API endpoints:

### Base URLs

- **Local**: `http://localhost:6060/api/v1/`
- **Production**: `https://api.iamwithyouapp.com/api/v1/`

### Supported Endpoints

- Authentication (`/admin/login`, `/admin/signup`)
- User Management (`/admin/get-user`, `/admin/updateUser`)
- Music Categories (`/category/*`)
- Music Tracks (`/music/*`)
- Background Music (`/backgroundMusic/*`)
- Notes (`/notes/*`)
- Note Categories (`/noteCategory/*`)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   cd music-admin-panel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoints**

   - Update the base URLs in `src/config/api.js` if needed
   - The app automatically switches between local and production based on `NODE_ENV`

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Layout.js
│       ├── Layout.css
│       ├── Sidebar.js
│       └── Sidebar.css
├── config/
│   └── api.js
├── context/
│   └── AuthContext.js
├── pages/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Auth.css
│   ├── Dashboard/
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── Users/
│   │   ├── Users.js
│   │   └── Users.css
│   ├── Categories/
│   │   ├── Categories.js
│   │   └── Categories.css
│   ├── Music/
│   │   ├── Music.js
│   │   └── Music.css
│   ├── BackgroundMusic/
│   │   ├── BackgroundMusic.js
│   │   └── BackgroundMusic.css
│   ├── NotesCategories/
│   │   ├── NotesCategories.js
│   │   └── NotesCategories.css
│   └── Notes/
│       ├── Notes.js
│       └── Notes.css
├── services/
│   ├── authService.js
│   ├── categoryService.js
│   ├── musicService.js
│   ├── backgroundMusicService.js
│   ├── notesService.js
│   └── notesCategoryService.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Key Features Explained

### Authentication System

- JWT token storage in localStorage
- Automatic token refresh handling
- Protected route implementation
- Login/logout functionality

### File Upload Support

- Image upload for music covers and backgrounds
- Audio file upload for music tracks
- Drag and drop interface
- File type validation

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface
- Flexible grid layouts

### Search and Filtering

- Real-time search across all modules
- Category-based filtering
- Advanced filtering options
- Debounced search input

### Data Management

- CRUD operations for all entities
- Form validation
- Error handling
- Loading states
- Confirmation dialogs

## Customization

### Theming

The app uses CSS custom properties for easy theming. Main colors can be changed in the CSS files:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --warning-color: #ed8936;
  --error-color: #f56565;
}
```

### Adding New Modules

1. Create a new service in `src/services/`
2. Create page components in `src/pages/`
3. Add routes in `App.js`
4. Update navigation in `Sidebar.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This admin panel is designed to work with the music streaming API. Make sure your backend API is running and accessible for full functionality.
