use crate::state::UserProfile;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditUserProfile<'info> {
    #[account(
        mut,
        seeds =[b"user", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_user_profile(
    ctx: Context<EditUserProfile>,
    avatar: String,
    username: String,
    twitterlink: String,
    externallink: String,
    bio: String,
) -> Result<()> {
    let user_profile = &mut ctx.accounts.user_profile;
    let owner = &ctx.accounts.owner;

    // Length checks
    if username.len() > 0 {
        require!(username.len() <= 256, WordeetError::UserNameTooLong);
    }

    if bio.len() > 0 {
        require!(bio.len() <= 1024, WordeetError::UserBioTooLong);
    }

    user_profile.avatar = avatar;
    user_profile.username = username;
    user_profile.twitterlink = twitterlink;
    user_profile.externallink = externallink;
    user_profile.bio = bio;

    Ok(())
}
