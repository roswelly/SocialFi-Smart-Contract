use crate::state::{BlogPost, CollectorInfo};
use crate::*;

#[derive(Accounts)]
pub struct AddCollector<'info> {
    #[account(mut)] // Reference BlogPost PDA directly
    pub post_account: Account<'info, BlogPost>,

    #[account(
        init,
        payer = collector,
        space = 8 + 32 + 32 + 100 + 100 + 50 + 50 + 32 + 8, // Adjust space based on CollectorInfo size
        seeds = [b"collector", post_account.key().as_ref(), &[post_account.ntotalcollecter as u8].as_ref()],
        bump
    )]
    pub collector_info: Account<'info, CollectorInfo>,

    #[account(mut)]
    pub collector: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn add_collector(
    ctx: Context<AddCollector>,
    username: String,
    avatar: String,
    walletaddress: String,
    nft_mint_address: String,
) -> Result<()> {
    let collector_info = &mut ctx.accounts.collector_info;
    let post_account = &mut ctx.accounts.post_account;

    collector_info.blog_post = *post_account.to_account_info().key;
    collector_info.collector = *ctx.accounts.collector.key;
    collector_info.username = username;
    collector_info.avatar = avatar;
    collector_info.walletaddress = walletaddress;
    collector_info.nft_mint_address = nft_mint_address;
    collector_info.created_at = Clock::get()?.unix_timestamp;

    post_account.ntotalcollecter += 1; // Update the total collector counter

    Ok(())
}
