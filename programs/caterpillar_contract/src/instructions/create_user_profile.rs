use crate::*;

use crate::state::UserProfile;

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        seeds = [b"user",author.key().as_ref()],
        bump,
        payer = author,
        space = 8 + 32 + 64 + 1024 // Adjust space for the account as needed
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_user_profile(ctx: Context<CreateUserProfile>, walletaddress: String) -> Result<()> {
    let user_profile = &mut ctx.accounts.user_profile;
    let author = &mut ctx.accounts.author;

    user_profile.avatar = "".to_string();
    user_profile.username = "".to_string();
    user_profile.walletaddress = walletaddress;
    user_profile.twitterlink = "".to_string();
    user_profile.externallink = "".to_string();
    user_profile.bio = "".to_string();
    user_profile.owner = author.key();
    user_profile.post_count = 0;
    user_profile.created_at = Clock::get()?.unix_timestamp;

    Ok(())
}
