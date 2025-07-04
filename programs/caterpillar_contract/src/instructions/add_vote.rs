use crate::state::{BlogPost, UserProfile, VoteInfo};
use crate::*;

#[derive(Accounts)]
pub struct AddVote<'info> {
    #[account(mut)] // Reference BlogPost PDA directly
    pub post_account: Account<'info, BlogPost>,

    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 100 + 100 + 50 + 50 + 32 + 8, // Adjust space based on voteInfo size
        seeds = [b"vote", post_account.key().as_ref(), &voter.key().as_ref()],
        bump
    )]
    pub vote_info: Account<'info, VoteInfo>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn add_vote(ctx: Context<AddVote>, status: u8) -> Result<()> {
    let vote_info = &mut ctx.accounts.vote_info;
    let post_account = &mut ctx.accounts.post_account;

    vote_info.blog_post = *post_account.to_account_info().key;
    vote_info.voter = *ctx.accounts.voter.key;
    vote_info.created_at = Clock::get()?.unix_timestamp;
    vote_info.status = status;

    if (status == 1) {
        post_account.upvote += 1;
    }

    if (status == 2) {
        post_account.downvote += 1;
    }

    Ok(())
}
