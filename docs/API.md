# Caterpillar Smart Contract API Documentation

## Program Instructions

### User Management

#### create_user_profile
Creates a new user profile.

```rust
pub fn create_user_profile(
    ctx: Context<CreateUserProfile>,
    walletaddres: String,
) -> Result<()>
```

**Parameters:**
- `walletaddres`: User's wallet address

**Accounts:**
- `user_profile`: New user profile account
- `author`: User's wallet (signer)
- `system_program`: System program

**Errors:**
- `UserProfileNotFound`: If user profile doesn't exist
- `UsernameTooLong`: If username exceeds maximum length

#### edit_user_profile
Updates user profile information.

```rust
pub fn edit_user_profile(
    ctx: Context<EditUserProfile>,
    avatar: String,
    username: String,
    twitterlink: String,
    externallink: String,
    bio: String,
) -> Result<()>
```

**Parameters:**
- `avatar`: Profile avatar URL
- `username`: User's display name
- `twitterlink`: Twitter profile link
- `externallink`: External website link
- `bio`: User biography

**Accounts:**
- `user_profile`: User profile account
- `owner`: Profile owner (signer)

**Errors:**
- `UsernameTooLong`: If username exceeds maximum length
- `BioTooLong`: If bio exceeds maximum length
- `InvalidUrlFormat`: If URL format is invalid

### Content Management

#### create_blog_post
Creates a new blog post.

```rust
pub fn create_blog_post(
    ctx: Context<CreateBlogPost>,
    coverimage: String,
    title: String,
    content: String,
    category: String,
    keywords: String,
    walletaddress: String,
) -> Result<()>
```

**Parameters:**
- `coverimage`: Post cover image URL
- `title`: Post title
- `content`: Post content
- `category`: Post category
- `keywords`: Post keywords
- `walletaddress`: Author's wallet address

**Accounts:**
- `blog_post`: New blog post account
- `owner`: Post author (signer)
- `user_profile`: Author's profile
- `rate_limit`: Rate limiting account
- `system_program`: System program

**Errors:**
- `TitleTooLong`: If title exceeds maximum length
- `ContentTooLong`: If content exceeds maximum length
- `RateLimitExceeded`: If rate limit is exceeded
- `UserBanned`: If user is banned

#### edit_blog_post
Updates blog post information.

```rust
pub fn edit_blog_post(
    ctx: Context<EditBlogPost>,
    nftcollectionaddress: String,
    ntotalcollecter: u8,
    upvote: u32,
    downvote: u32,
) -> Result<()>
```

**Parameters:**
- `nftcollectionaddress`: NFT collection address
- `ntotalcollecter`: Total number of collectors
- `upvote`: Number of upvotes
- `downvote`: Number of downvotes

**Accounts:**
- `blog_post`: Blog post account
- `owner`: Post owner (signer)

**Errors:**
- `PostLocked`: If post is locked
- `InsufficientPermissions`: If user lacks permission

### NFT Operations

#### add_collector
Adds an NFT collector to a blog post.

```rust
pub fn add_collector(
    ctx: Context<AddCollector>,
    username: String,
    avatar: String,
    walletaddress: String,
    nft_mint_address: String,
) -> Result<()>
```

**Parameters:**
- `username`: Collector's username
- `avatar`: Collector's avatar URL
- `walletaddress`: Collector's wallet address
- `nft_mint_address`: NFT mint address

**Accounts:**
- `collector_info`: Collector information account
- `blog_post`: Blog post account
- `collector`: Collector's wallet (signer)
- `system_program`: System program

**Errors:**
- `InvalidNFTCollectionAddress`: If NFT collection address is invalid

### Engagement

#### add_vote
Adds a vote to a blog post.

```rust
pub fn add_vote(
    ctx: Context<AddVote>,
    status: u8,
) -> Result<()>
```

**Parameters:**
- `status`: Vote status (1 for upvote, 0 for downvote)

**Accounts:**
- `vote_info`: Vote information account
- `blog_post`: Blog post account
- `voter`: Voter's wallet (signer)
- `system_program`: System program

**Errors:**
- `PostLocked`: If post is locked
- `OperationNotAllowed`: If operation is not allowed

#### edit_vote
Modifies an existing vote.

```rust
pub fn edit_vote(
    ctx: Context<EditVote>,
    status: u8,
) -> Result<()>
```

**Parameters:**
- `status`: New vote status

**Accounts:**
- `vote_info`: Vote information account
- `voter`: Voter's wallet (signer)

**Errors:**
- `PostLocked`: If post is locked
- `OperationNotAllowed`: If operation is not allowed

## Account Structures

### UserProfile
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

### BlogPost
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

### CollectorInfo
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

### VoteInfo
```rust
pub struct VoteInfo {
    pub blog_post: Pubkey,
    pub voter: Pubkey,
    pub status: u8,
    pub created_at: i64,
    pub last_updated_at: i64,
}
```

## Constants

### Content Limits
```rust
pub const MAX_USERNAME_LENGTH: usize = 50;
pub const MAX_BIO_LENGTH: usize = 500;
pub const MAX_TITLE_LENGTH: usize = 200;
pub const MAX_CONTENT_LENGTH: usize = 10000;
pub const MAX_KEYWORDS_LENGTH: usize = 200;
pub const MAX_CATEGORY_LENGTH: usize = 50;
pub const MAX_URL_LENGTH: usize = 200;
```

### Rate Limiting
```rust
pub const MAX_POSTS_PER_DAY: u32 = 10;
pub const MIN_TIME_BETWEEN_POSTS: i64 = 3600;
```

### Status Flags
```rust
pub const STATUS_ACTIVE: u8 = 1;
pub const STATUS_PENDING: u8 = 0;
pub const STATUS_REJECTED: u8 = 2;
pub const STATUS_LOCKED: u8 = 3;
```

## Error Types

```rust
pub enum CaterpillarError {
    UserProfileNotFound,
    BlogPostCreationFailed,
    UsernameTooLong,
    UsernameEmpty,
    InvalidUsernameFormat,
    BioTooLong,
    TitleTooLong,
    TitleEmpty,
    ContentTooLong,
    ContentEmpty,
    UrlTooLong,
    InvalidUrlFormat,
    CategoryTooLong,
    CategoryEmpty,
    KeywordsTooLong,
    RateLimitExceeded,
    UserBanned,
    InsufficientPermissions,
    PostLocked,
    InvalidNFTCollectionAddress,
    OperationNotAllowed,
}
``` 