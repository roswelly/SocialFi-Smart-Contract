use crate::state::{BlogPost, VoteInfo};
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditVote<'info> {
    #[account(mut)] // Reference BlogPost PDA directly
    pub post_account: Account<'info, BlogPost>,
    #[account(
        mut,
        has_one = voter
    )]
    pub vote_info: Account<'info, VoteInfo>,

    #[account(mut)]
    pub voter: Signer<'info>,
}

pub fn edit_vote(ctx: Context<EditVote>, status: u8) -> Result<()> {
    let vote_info = &mut ctx.accounts.vote_info;
    let post_account = &mut ctx.accounts.post_account;

    vote_info.status = status;
    if (status == 1) {
        post_account.downvote -= 1;
        post_account.upvote += 1;
    }
    if (status == 2) {
        post_account.downvote += 1;
        post_account.upvote -= 1;
    }

    Ok(())
}
