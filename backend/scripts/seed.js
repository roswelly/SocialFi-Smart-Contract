const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Token = require('../models/Token');
const Transaction = require('../models/Transaction');
const ChatMessage = require('../models/ChatMessage');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@crossfun.xyz',
    password: 'admin123',
    role: 'admin',
    walletAddresses: [{
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      isPrimary: true
    }],
    isVerified: true
  },
  {
    username: 'moderator',
    email: 'mod@crossfun.xyz',
    password: 'mod123',
    role: 'moderator',
    walletAddresses: [{
      address: '0x2345678901234567890123456789012345678901',
      chainId: 1,
      isPrimary: true
    }],
    isVerified: true
  },
  {
    username: 'user1',
    email: 'user1@crossfun.xyz',
    password: 'user123',
    role: 'user',
    walletAddresses: [{
      address: '0x3456789012345678901234567890123456789012',
      chainId: 1,
      isPrimary: true
    }],
    isVerified: true
  }
];

const sampleTokens = [
  {
    name: 'CrossFun Token',
    symbol: 'CFT',
    address: '0x4567890123456789012345678901234567890123',
    creatorAddress: '0x3456789012345678901234567890123456789012',
    chainId: 1,
    description: 'The official CrossFun platform token',
    website: 'https://crossfun.xyz',
    twitter: 'https://twitter.com/crossfunxyz',
    telegram: 'https://t.me/crossfun_xyz',
    isVerified: true,
    isActive: true,
    totalSupply: '1000000000000000000000000',
    currentPrice: '0.0001',
    currentPriceUSD: '0.0001',
    marketCap: '100000',
    marketCapUSD: '100000',
    volume24h: '5000',
    volume24hUSD: '5000'
  },
  {
    name: 'Sample Memecoin',
    symbol: 'SMC',
    address: '0x5678901234567890123456789012345678901234',
    creatorAddress: '0x3456789012345678901234567890123456789012',
    chainId: 1,
    description: 'A sample memecoin for testing',
    isVerified: false,
    isActive: true,
    totalSupply: '1000000000000000000000000',
    currentPrice: '0.00001',
    currentPriceUSD: '0.00001',
    marketCap: '10000',
    marketCapUSD: '10000',
    volume24h: '1000',
    volume24hUSD: '1000'
  }
];

const sampleTransactions = [
  {
    txHash: '0x6789012345678901234567890123456789012345678901234567890123456789',
    tokenAddress: '0x4567890123456789012345678901234567890123',
    type: 'buy',
    senderAddress: '0x3456789012345678901234567890123456789012',
    recipientAddress: '0x4567890123456789012345678901234567890123',
    ethAmount: '1000000000000000000',
    tokenAmount: '10000000000000000000000',
    tokenPrice: '0.0001',
    blockNumber: 18000000,
    blockTimestamp: new Date(),
    chainId: 1
  }
];

const sampleChatMessages = [
  {
    message: 'Welcome to CrossFun! 🚀',
    messageType: 'text',
    userAddress: '0x3456789012345678901234567890123456789012',
    username: 'user1',
    tokenAddress: '0x4567890123456789012345678901234567890123',
    chainId: 1
  },
  {
    message: 'This is going to be amazing! 💎',
    messageType: 'text',
    userAddress: '0x3456789012345678901234567890123456789012',
    username: 'user1',
    tokenAddress: '0x4567890123456789012345678901234567890123',
    chainId: 1
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crossfun';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Token.deleteMany({}),
      Transaction.deleteMany({}),
      ChatMessage.deleteMany({})
    ]);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.username}`);
    }

    // Create tokens
    console.log('🪙 Creating tokens...');
    const createdTokens = [];
    for (const tokenData of sampleTokens) {
      // Find the creator user
      const creator = createdUsers.find(u => 
        u.walletAddresses.some(w => w.address === tokenData.creatorAddress)
      );
      
      if (creator) {
        const token = new Token({
          ...tokenData,
          creatorAddress: creator.walletAddresses[0].address
        });
        const savedToken = await token.save();
        createdTokens.push(savedToken);
        console.log(`✅ Created token: ${savedToken.name} (${savedToken.symbol})`);
      }
    }

    // Create transactions
    console.log('💸 Creating transactions...');
    for (const txData of sampleTransactions) {
      // Find the token
      const token = createdTokens.find(t => t.address === txData.tokenAddress);
      if (token) {
        const transaction = new Transaction({
          ...txData,
          tokenId: token._id
        });
        await transaction.save();
        console.log(`✅ Created transaction: ${txData.txHash.substring(0, 10)}...`);
      }
    }

    // Create chat messages
    console.log('💬 Creating chat messages...');
    for (const msgData of sampleChatMessages) {
      // Find the token and user
      const token = createdTokens.find(t => t.address === msgData.tokenAddress);
      const user = createdUsers.find(u => 
        u.walletAddresses.some(w => w.address === msgData.userAddress)
      );
      
      if (token && user) {
        const chatMessage = new ChatMessage({
          ...msgData,
          tokenId: token._id,
          userId: user._id
        });
        await chatMessage.save();
        console.log(`✅ Created chat message: ${msgData.message.substring(0, 30)}...`);
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdUsers.length} users`);
    console.log(`🪙 Created ${createdTokens.length} tokens`);
    console.log(`💸 Created ${sampleTransactions.length} transactions`);
    console.log(`💬 Created ${sampleChatMessages.length} chat messages`);

    // Display sample data
    console.log('\n📋 Sample Data Summary:');
    console.log('Users:', createdUsers.map(u => u.username).join(', '));
    console.log('Tokens:', createdTokens.map(t => `${t.name} (${t.symbol})`).join(', '));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
