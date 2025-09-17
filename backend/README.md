# CrossFun Backend API

A comprehensive Node.js backend API for the CrossFun token launchpad platform, built with Express.js, MongoDB, and modern web technologies.

## 🚀 Features

- **Token Management**: Create, update, and manage token information
- **Transaction Tracking**: Monitor blockchain transactions and trading activity
- **User Authentication**: JWT-based authentication with wallet support
- **Chat System**: Real-time chat functionality for token communities
- **File Uploads**: Cloudinary integration for image and media uploads
- **Analytics**: Comprehensive platform analytics and reporting
- **Moderation**: Content moderation tools for administrators
- **Rate Limiting**: API rate limiting and security measures

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Compression**: Compression middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for file uploads)
- Environment variables configured

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/crossfun
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/crossfun

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
SHIBARIUM_RPC_URL=https://rpc.shibarium.org
BONDING_CURVE_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://crossfun.xyz
```

### 3. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "walletAddress": "0x1234...",
  "chainId": 1
}
```

#### POST `/api/auth/login`
Login with username/email and password.

**Request Body:**
```json
{
  "identifier": "user123",
  "password": "password123"
}
```

#### POST `/api/auth/wallet-login`
Login using wallet signature.

**Request Body:**
```json
{
  "walletAddress": "0x1234...",
  "signature": "0x...",
  "message": "Login message",
  "chainId": 1
}
```

### Token Endpoints

#### GET `/api/tokens`
Get all tokens with pagination and filters.

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (createdAt, currentPriceUSD, marketCapUSD, volume24hUSD)
- `sortOrder`: Sort direction (asc, desc)
- `chainId`: Filter by blockchain
- `verified`: Filter by verification status
- `active`: Filter by active status
- `search`: Search in name, symbol, description

#### POST `/api/tokens`
Create a new token (requires authentication).

**Request Body:**
```json
{
  "name": "My Token",
  "symbol": "MTK",
  "address": "0x1234...",
  "creatorAddress": "0x5678...",
  "chainId": 1,
  "description": "My awesome token",
  "website": "https://example.com"
}
```

#### GET `/api/tokens/trending`
Get trending tokens based on volume and price changes.

#### GET `/api/tokens/recent`
Get recently created tokens.

### Transaction Endpoints

#### GET `/api/transactions`
Get all transactions with pagination and filters.

**Query Parameters:**
- `page`: Page number
- `pageSize`: Items per page
- `tokenAddress`: Filter by token
- `type`: Transaction type (buy, sell, add_liquidity, etc.)
- `senderAddress`: Filter by sender
- `recipientAddress`: Filter by recipient
- `chainId`: Filter by blockchain
- `startDate`: Start date for range
- `endDate`: End date for range

#### POST `/api/transactions`
Create a new transaction record (requires authentication).

### Chat Endpoints

#### GET `/api/chat/:tokenAddress`
Get chat messages for a specific token.

**Query Parameters:**
- `page`: Page number
- `pageSize`: Items per page
- `sort`: Sort option (newest, oldest, popular)

#### POST `/api/chat/:tokenAddress`
Add a new chat message (requires authentication).

**Request Body:**
```json
{
  "message": "Hello everyone!",
  "messageType": "text",
  "replyTo": "messageId" // Optional
}
```

#### POST `/api/chat/:messageId/like`
Like a chat message.

#### POST `/api/chat/:messageId/dislike`
Dislike a chat message.

### Upload Endpoints

#### POST `/api/upload/image`
Upload an image to Cloudinary (requires authentication).

**Form Data:**
- `image`: Image file
- `folder`: Optional folder name
- `public_id`: Optional public ID

#### POST `/api/upload/logo`
Upload a token logo (requires authentication).

### Analytics Endpoints

#### GET `/api/analytics/overview`
Get platform overview statistics.

#### GET `/api/analytics/tokens`
Get token analytics with period filtering.

#### GET `/api/analytics/transactions`
Get transaction analytics and statistics.

## 🔐 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚦 Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per IP (configurable)
- **Scope**: All `/api/` endpoints

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation and sanitization
- **JWT**: Secure token-based authentication
- **Rate Limiting**: API abuse prevention
- **MongoDB Injection Protection**: Mongoose schema validation

## 📊 Database Models

### Token
- Basic token information (name, symbol, address)
- Creator details and metadata
- Market data and pricing
- Social links and verification status

### Transaction
- Transaction details and blockchain data
- Token and user references
- Gas information and costs
- Status and timestamps

### User
- User account information
- Wallet addresses and verification
- Profile data and social links
- Role-based permissions

### ChatMessage
- Chat message content and metadata
- User and token references
- Engagement metrics (likes, dislikes)
- Moderation and reply support

### LiquidityEvent
- Liquidity addition/removal events
- Provider and pool information
- Transaction details and amounts

### TokenHolder
- Token holder balances and percentages
- Transaction counts and engagement
- Value calculations and tags

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/crossfun |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use production MongoDB instance
3. **Security**: Ensure JWT_SECRET is strong and unique
4. **Monitoring**: Implement logging and monitoring
5. **SSL**: Use HTTPS in production
6. **Backup**: Regular database backups

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔄 Updates

Stay updated with the latest changes:
- Monitor the repository for updates
- Check the changelog
- Review breaking changes in major versions
