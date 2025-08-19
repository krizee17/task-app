# ToDo Task Manager

A full-stack task management application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Create, read, update, and delete tasks
- Category management
- Search and filter tasks
- Task statistics and analytics
- Due date management
- Priority levels and tags
- Responsive design
- User authentication (frontend)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (frontend implementation)

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ToDo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/todo_app
PORT=3000
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if using MongoDB Community Server
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using brew (macOS)
brew services start mongodb-community
```

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

##  API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /api/health
```

### Tasks API

#### Get All Tasks
```
GET /api/tasks
```

**Response:**
```json
[
  {
    "id": "task_id",
    "name": "Task Name",
    "description": "Task Description",
    "status": "to-do",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "category": "General",
    "completed": false,
    "priority": "medium",
    "tags": ["tag1", "tag2"],
    "notes": "Additional notes",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

#### Create New Task
```
POST /api/tasks
```

**Request Body:**
```json
{
  "name": "Task Name",
  "description": "Task Description",
  "dueDate": "2024-01-15",
  "category": "Work",
  "priority": "high",
  "tags": ["urgent", "project"],
  "notes": "Additional notes"
}
```

#### Get Task by ID
```
GET /api/tasks/:id
```

#### Update Task
```
PUT /api/tasks/:id
```

**Request Body:**
```json
{
  "name": "Updated Task Name",
  "status": "in-progress",
  "completed": true
}
```

#### Delete Task
```
DELETE /api/tasks/:id
```

#### Get Task Statistics
```
GET /api/tasks/stats
```

**Response:**
```json
{
  "total": 10,
  "completed": 5,
  "inProgress": 3,
  "todo": 2,
  "completionRate": 50,
  "categoryStats": [
    {
      "_id": "Work",
      "count": 5
    }
  ]
}
```

#### Search Tasks
```
GET /api/tasks/search?q=search_term&status=completed&category=Work
```

**Query Parameters:**
- `q`: Search term (searches in name and description)
- `status`: Filter by status (to-do, in-progress, completed)
- `category`: Filter by category
- `dueDate`: Filter by due date (YYYY-MM-DD)

#### Get Today's Tasks
```
GET /api/tasks/today
```

#### Get Tasks by Status
```
GET /api/tasks/status/:status
```

#### Get Tasks by Category
```
GET /api/tasks/category/:category
```

#### Bulk Update Tasks
```
PUT /api/tasks/bulk/update
```

**Request Body:**
```json
{
  "taskIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "completed",
    "category": "Done"
  }
}
```

#### Bulk Delete Tasks
```
DELETE /api/tasks/bulk/delete
```

**Request Body:**
```json
{
  "taskIds": ["id1", "id2", "id3"]
}
```

### Categories API

#### Get All Categories
```
GET /api/categories
```

#### Create Category
```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category Description",
  "color": "#007bff",
  "icon": "📁"
}
```

#### Update Category
```
PUT /api/categories/:id
```

#### Delete Category
```
DELETE /api/categories/:id
```

## 🗄️ Database Schema

### Task Schema
```javascript
{
  name: String (required, max 100 chars),
  description: String (required, max 500 chars),
  status: String (enum: ['to-do', 'in-progress', 'completed']),
  dueDate: Date,
  category: String (default: 'General'),
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high']),
  tags: [String],
  notes: String (max 1000 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Schema
```javascript
{
  name: String (required, unique),
  description: String,
  color: String (hex color),
  icon: String,
  isActive: Boolean (default: true),
  taskCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Testing with Postman

### 1. Import Collection
Create a new collection in Postman and add the following requests:

### 2. Environment Variables
Set up environment variables in Postman:
- `base_url`: `http://localhost:3000/api`

### 3. Sample Requests

#### Create a Task
```
POST {{base_url}}/tasks
Content-Type: application/json

{
  "name": "Complete Project Documentation",
  "description": "Write comprehensive documentation for the ToDo application",
  "dueDate": "2024-01-20",
  "category": "Work",
  "priority": "high",
  "tags": ["documentation", "important"],
  "notes": "Include API documentation and setup instructions"
}
```

#### Get All Tasks
```
GET {{base_url}}/tasks
```

#### Update Task Status
```
PUT {{base_url}}/tasks/{{task_id}}
Content-Type: application/json

{
  "status": "in-progress"
}
```

#### Get Task Statistics
```
GET {{base_url}}/tasks/stats
```

## Troubleshooting

### MongoDB Connection Issues

1. **MongoDB not running:**
   ```bash
   # Check if MongoDB is running
   mongo --eval "db.runCommand('ping')"
   ```

2. **Connection refused:**
   - Make sure MongoDB is installed and running
   - Check if the port 27017 is available
   - Verify the connection string in `.env`

3. **Authentication issues:**
   - For local development, MongoDB typically doesn't require authentication
   - If using MongoDB Atlas, update the connection string with credentials

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000
   
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Module not found errors:**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## Project Structure

```
ToDo/
├── controllers/          # Route controllers
│   ├── taskController.js
│   └── categoryController.js
├── models/              # Database models
│   ├── Task.js
│   └── Category.js
├── routes/              # API routes
│   ├── taskRoutes.js
│   └── categoryRoutes.js
├── middleware/          # Custom middleware
│   └── errorHandler.js
├── LOGIN/              # Frontend files
│   ├── dashboard.html
│   ├── dashboard.js
│   └── ...
├── server.js           # Main server file
├── package.json        # Dependencies
└── .env               # Environment variables
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Happy Task Managing! ** 