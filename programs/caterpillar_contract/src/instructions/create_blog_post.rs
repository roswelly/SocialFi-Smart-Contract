use crate::*;
use crate::state::{UserProfile, BlogPost, RateLimit};
use crate::validation::*;
use crate::constant::*;

#[derive(Accounts)]
pub struct CreateBlogPost<'info> {
    #[account(
        init, 
        seeds = [b"post", owner.key().as_ref(), &[user_profile.post_count as u8].as_ref()], 
        bump, 
        payer = owner, 
        space = 8 + 32 + 512 + 100 + 8
    )]
    pub blog_post: Account<'info, BlogPost>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"rate_limit", owner.key().as_ref()],
        bump
    )]
    pub rate_limit: Account<'info, RateLimit>,

    pub system_program: Program<'info, System>,
}

pub fn create_blog_post(
    ctx: Context<CreateBlogPost>,
    coverimage: String,
    title: String,
    content: String,
    category: String,
    keywords: String,
    walletaddress: String,
) -> Result<()> {
    // Check if user is banned
    if ctx.accounts.user_profile.is_banned {
        return Err(WordeetError::UserBanned.into());
    }

    // Validate inputs
    validate_title(&title)?;
    validate_content(&content)?;
    validate_category(&category)?;
    validate_keywords(&keywords)?;
    validate_url(&coverimage)?;

    // Check rate limit
    let current_time = Clock::get()?.unix_timestamp;
    let rate_limit = &mut ctx.accounts.rate_limit;

    // Reset counter if 24 hours have passed
    if current_time - rate_limit.last_reset_time >= 86400 {
        rate_limit.post_count_24h = 0;
        rate_limit.last_reset_time = current_time;
    }

    // Check if user has exceeded rate limit
    if rate_limit.post_count_24h >= MAX_POSTS_PER_DAY {
        return Err(WordeetError::RateLimitExceeded.into());
    }

    // Check minimum time between posts
    if current_time - rate_limit.last_post_time < MIN_TIME_BETWEEN_POSTS {
        return Err(WordeetError::RateLimitExceeded.into());
    }

    // Update rate limit
    rate_limit.last_post_time = current_time;
    rate_limit.post_count_24h += 1;

    // Create blog post
    let blog_post = &mut ctx.accounts.blog_post;
    blog_post.owner = *ctx.accounts.owner.key;
    blog_post.title = title;
    blog_post.content = content;
    blog_post.category = category;
    blog_post.created_at = current_time;
    blog_post.last_edited_at = current_time;
    blog_post.coverimage = coverimage;
    blog_post.keywords = keywords;
    blog_post.walletaddress = walletaddress;
    blog_post.status = STATUS_PENDING;
    blog_post.nftcollectionaddress = "".to_string();
    blog_post.ntotalcollecter = 0;
    blog_post.upvote = 0;
    blog_post.downvote = 0;
    blog_post.is_locked = false;

    // Update user profile
    let user_profile = &mut ctx.accounts.user_profile;
    user_profile.post_count += 1;

    // Emit event
    emit!(BlogPostCreated {
        owner: *ctx.accounts.owner.key,
        post_id: blog_post.key(),
        title: blog_post.title.clone(),
        timestamp: current_time,
    });

    Ok(())
}

#[event]
pub struct BlogPostCreated {
    pub owner: Pubkey,
    pub post_id: Pubkey,
    pub title: String,
    pub timestamp: i64,
}
