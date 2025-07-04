use anchor_lang::prelude::*;

#[constant]
pub const USER_SEED: &str = "user";

#[constant]
pub const POST_SEED: &str = "post";
//
// Content limits
pub const MAX_USERNAME_LENGTH: usize = 50;
pub const MAX_BIO_LENGTH: usize = 500;
pub const MAX_TITLE_LENGTH: usize = 200;
pub const MAX_CONTENT_LENGTH: usize = 10000;
pub const MAX_KEYWORDS_LENGTH: usize = 200;
pub const MAX_CATEGORY_LENGTH: usize = 50;
pub const MAX_URL_LENGTH: usize = 200;

// Rate limiting
pub const MAX_POSTS_PER_DAY: u32 = 10;
pub const MIN_TIME_BETWEEN_POSTS: i64 = 3600; // 1 hour in seconds

// Reputation
pub const INITIAL_REPUTATION_SCORE: i32 = 0;
pub const REPUTATION_THRESHOLD_FOR_MODERATION: i32 = 100;

// Status flags
pub const STATUS_ACTIVE: u8 = 1;
pub const STATUS_PENDING: u8 = 0;
pub const STATUS_REJECTED: u8 = 2;
pub const STATUS_LOCKED: u8 = 3;
