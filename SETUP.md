# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` (if it doesn't exist, create it)
   - Add your MongoDB Atlas connection string
   - Set a strong JWT secret
   - Optionally configure Cloudinary for image uploads

3. **Seed Database**
   ```bash
   npm run seed
   ```
   This creates demo accounts:
   - Admin: `admin@demo.test` / `Admin@123`
   - Trainers: `trainer1@demo.test` through `trainer3@demo.test` / `Trainer@123`
   - Members: `member1@demo.test` through `member10@demo.test` / `Member@123`

4. **Start Server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open Frontend**
   - Open `public/index.html` in your browser
   - Or use a local server (VS Code Live Server extension)
   - The API runs on `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym-app?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# JWT Expiration (optional, defaults to 7d)
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Cloudinary (optional - for image uploads)
# If not using Cloudinary, images will be stored locally
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload Settings
MAX_FILE_SIZE=3145728
UPLOAD_PATH=./uploads

# CORS Origin (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
```

## MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env` as `MONGO_URI`

## Cloudinary Setup (Optional)

1. Create a free account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add to `.env` file
4. If not configured, images will be stored locally in the `uploads/` directory

## Directory Structure

```
/
├── server/
│   ├── config/          # Database, JWT, Cloudinary config
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, error handling, upload
│   ├── seed/            # Database seeding script
│   ├── utils/           # Helper functions
│   └── server.js        # Express app entry point
├── public/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   ├── pages/           # HTML pages
│   └── index.html       # Landing page
├── uploads/             # Local file uploads (created automatically)
├── .env                 # Environment variables (create this)
├── package.json
└── README.md
```

## Troubleshooting

### Server won't start
- Check MongoDB connection string is correct
- Ensure MongoDB Atlas allows your IP address
- Verify PORT is not already in use

### Database seeding fails
- Verify MongoDB connection string
- Check network connectivity
- Ensure database user has write permissions

### File uploads fail
- Check `uploads/` directory exists and is writable
- If using Cloudinary, verify credentials are correct
- Check file size doesn't exceed `MAX_FILE_SIZE`

### CORS errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Restart server after changing `.env`

### Authentication issues
- Verify JWT_SECRET is set
- Check token is being sent in Authorization header
- Ensure token hasn't expired

## Development Tips

- Use `npm run dev` for auto-reload during development
- Check server console for error messages
- Use browser DevTools Network tab to debug API calls
- Check browser console for JavaScript errors

## Production Deployment

See README.md for deployment instructions to Render/Heroku (backend) and Netlify/Vercel (frontend).

