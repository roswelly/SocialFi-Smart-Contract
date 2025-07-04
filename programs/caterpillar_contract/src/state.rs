use crate::*;
use crate::constant::*;

#[account]
#[derive(Default)]
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
// /
#[account]
#[derive(Default)]
pub struct RateLimit {
    pub user: Pubkey,
    pub last_post_time: i64,
    pub post_count_24h: u32,
    pub last_reset_time: i64,
}

#[account]
#[derive(Default)]
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

#[account]
#[derive(Default)]
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

#[account]
#[derive(Default)]
pub struct VoteInfo {
    pub blog_post: Pubkey,
    pub voter: Pubkey,
    pub status: u8,
    pub created_at: i64,
    pub last_updated_at: i64,
}

#[account]
#[derive(Default)]
pub struct ModerationStatus {
    pub post: Pubkey,
    pub status: u8,
    pub moderator: Option<Pubkey>,
    pub reason: String,
    pub timestamp: i64,
}
