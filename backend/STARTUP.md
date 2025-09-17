# 🚀 Quick Start Guide - CrossFun Backend

## ⚡ Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

**Edit `.env` with your settings:**
```env
# Required - Change these!
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb://localhost:27017/crossfun

# Optional - Set these for full functionality
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Start MongoDB
**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
- Go to [MongoDB Atlas](https://mongodb.com/atlas)
- Create free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

🎉 **Server running on http://localhost:5000**

### 5. Test the API
```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"OK","timestamp":"...","uptime":...}
```

## 🧪 Seed Sample Data (Optional)

```bash
npm run seed
```

This creates:
- Admin user: `admin@crossfun.xyz` / `admin123`
- Moderator: `mod@crossfun.xyz` / `mod123`
- Regular user: `user1@crossfun.xyz` / `user123`
- Sample tokens and transactions

## 🔗 API Endpoints

- **Health**: `GET /health`
- **Tokens**: `GET /api/tokens`
- **Users**: `GET /api/users`
- **Auth**: `POST /api/auth/login`
- **Chat**: `GET /api/chat/:tokenAddress`

## 🚨 Common Issues

**Port already in use:**
```bash
# Change port in .env
PORT=5001
```

**MongoDB connection failed:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

**JWT errors:**
- Ensure `JWT_SECRET` is set in `.env`
- Restart server after changing `.env`

## 📚 Next Steps

1. **Read the full README.md** for detailed API documentation
2. **Set up Cloudinary** for image uploads
3. **Configure production environment**
4. **Connect your frontend** to the backend

## 🆘 Need Help?

- Check the logs in your terminal
- Review the full README.md
- Ensure all environment variables are set
- Verify MongoDB is running and accessible
