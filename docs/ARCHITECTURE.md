# Caterpillar Smart Contract Architecture

## Overview

Caterpillar is a decentralized blogging platform built on Solana that combines content creation with NFT functionality. This document details the technical architecture and implementation of the smart contract.

## Core Components

### 1. State Management

#### UserProfile Account
```rust
pub struct UserProfile {
    pub owner: Pubkey,
    pub avatar: String,
    pub username: String,
    pub walletaddress: String,
    pub twitterlink: String,
    pub externallink: String,
    pub bio: String,
    pub post_count: u32,
    pub reputation_score: i32,
    pub is_banned: bool,
    pub created_at: i64,
}
```
- Stores user information and statistics
- Tracks post count and reputation
- Manages user ban status
- Uses PDA for deterministic address generation

#### BlogPost Account
```rust
pub struct BlogPost {
    pub owner: Pubkey,
    pub coverimage: String,
    pub title: String,
    pub content: String,
    pub category: String,
    pub upvote: u32,
    pub downvote: u32,
    pub keywords: String,
    pub walletaddress: String,
    pub status: u8,
    pub nftcollectionaddress: String,
    pub ntotalcollecter: u8,
    pub created_at: i64,
    pub last_edited_at: i64,
    pub is_locked: bool,
}
```
- Stores blog post content and metadata
- Tracks engagement metrics
- Manages NFT collection association
- Implements post locking mechanism

### 2. Security Features

#### Input Validation
```rust
pub fn validate_username(username: &str) -> Result<()> {
    if username.len() > MAX_USERNAME_LENGTH {
        return Err(CaterpillarError::UsernameTooLong.into());
    }
    // Additional validation...
}
```
- Length checks for all string inputs
- Format validation for URLs
- Username format validation
- Category and keyword validation

#### Rate Limiting
```rust
pub struct RateLimit {
    pub user: Pubkey,
    pub last_post_time: i64,
    pub post_count_24h: u32,
    pub last_reset_time: i64,
}
```
- Maximum posts per day limit
- Minimum time between posts
- Automatic counter reset after 24 hours

### 3. NFT Integration

#### CollectorInfo Account
```rust
pub struct CollectorInfo {
    pub blog_post: Pubkey,
    pub collector: Pubkey,
    pub avatar: String,
    pub username: String,
    pub _id: String,
    pub walletaddress: String,
    pub nft_mint_address: String,
    pub created_at: i64,
}
```
- Tracks NFT collectors
- Stores collector information
- Links to mint addresses

### 4. Voting System

#### VoteInfo Account
```rust
pub struct VoteInfo {
    pub blog_post: Pubkey,
    pub voter: Pubkey,
    pub status: u8,
    pub created_at: i64,
    pub last_updated_at: i64,
}
```
- Manages upvotes and downvotes
- Tracks vote history
- Prevents duplicate voting

### 5. Moderation System

#### ModerationStatus Account
```rust
pub struct ModerationStatus {
    pub post: Pubkey,
    pub status: u8,
    pub moderator: Option<Pubkey>,
    pub reason: String,
    pub timestamp: i64,
}
```
- Tracks content moderation status
- Records moderation actions
- Stores moderation reasons

## Program Instructions

### 1. User Management

#### create_user_profile
- Creates a new user profile
- Initializes user statistics
- Sets up rate limiting

#### edit_user_profile
- Updates user information
- Validates input changes
- Updates timestamps

### 2. Content Management

#### create_blog_post
- Creates new blog post
- Validates content
- Checks rate limits
- Initializes engagement metrics

#### edit_blog_post
- Updates post content
- Validates changes
- Updates timestamps
- Checks permissions

### 3. NFT Operations

#### add_collector
- Records NFT collector
- Updates collection stats
- Validates mint address

### 4. Engagement

#### add_vote
- Records user vote
- Updates post metrics
- Prevents duplicate votes

#### edit_vote
- Modifies existing vote
- Updates metrics
- Validates changes

## Error Handling

### Error Types
```rust
pub enum CaterpillarError {
    UserProfileNotFound,
    BlogPostCreationFailed,
    UsernameTooLong,
    // Additional error types...
}
```
- Comprehensive error coverage
- Clear error messages
- Proper error propagation

## Constants and Configuration

### Content Limits
```rust
pub const MAX_USERNAME_LENGTH: usize = 50;
pub const MAX_BIO_LENGTH: usize = 500;
pub const MAX_TITLE_LENGTH: usize = 200;
// Additional constants...
```
- Configurable limits
- Centralized constants
- Easy maintenance

## Security Considerations

### 1. Access Control
- Owner checks for all operations
- Permission validation
- Ban system implementation

### 2. Input Validation
- String length limits
- Format validation
- Empty field checks

### 3. Rate Limiting
- Post frequency limits
- Time-based restrictions
- Counter management

### 4. State Management
- Proper account initialization
- PDA usage
- Timestamp tracking

## Testing Strategy

### 1. Unit Tests
- Instruction validation
- State management
- Error handling

### 2. Integration Tests
- End-to-end workflows
- Cross-instruction testing
- State transitions

### 3. Security Tests
- Access control
- Rate limiting
- Input validation

## Deployment

### 1. Local Development
- Local validator setup
- Program deployment
- Testing environment

### 2. Devnet Deployment
- Devnet configuration
- Program deployment
- Testing on devnet

### 3. Mainnet Deployment
- Mainnet configuration
- Security audit
- Production deployment

## Future Improvements

### 1. Performance
- String storage optimization
- Account space allocation
- Batch operations

### 2. Features
- Search functionality
- Pagination
- Content versioning
- Draft system

### 3. Security
- Additional input sanitization
- More granular permissions
- Enhanced rate limiting

### 4. Testing
- More comprehensive coverage
- Edge case testing
- Security testing 