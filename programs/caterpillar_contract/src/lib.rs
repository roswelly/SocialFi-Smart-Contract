use anchor_lang::prelude::*;

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
pub mod validation;

use constant::*;
use error::*;
use instructions::*;
use validation::*;

declare_id!("EMh2kNfPQVMvJ4JA5Exzrz55FSHXnZmrxGAJyr8WWan");
//
#[program]
pub mod caterpillar_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        walletaddres: String,
    ) -> Result<()> {
        instructions::create_user_profile::create_user_profile(ctx, walletaddres)
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
        instructions::create_blog_post::create_blog_post(
            ctx,
            coverimage,
            title,
            content,
            category,
            keywords,
            walletaddress,
        )
    }

    pub fn edit_user_profile(
        ctx: Context<EditUserProfile>,
        avatar: String,
        username: String,
        twitterlink: String,
        externallink: String,
        bio: String,
    ) -> Result<()> {
        instructions::edit_user_profile::edit_user_profile(
            ctx,
            avatar,
            username,
            twitterlink,
            externallink,
            bio,
        )
    }

    pub fn edit_blog_post(
        ctx: Context<EditBlogPost>,
        nftcollectionaddress: String,
        ntotalcollecter: u8,
        upvote: u32,
        downvote: u32,
    ) -> Result<()> {
        instructions::edit_blog_post::edit_blog_post(
            ctx,
            nftcollectionaddress,
            ntotalcollecter,
            upvote,
            downvote,
        )
    }

    pub fn add_collector(
        ctx: Context<AddCollector>,
        username: String,
        avatar: String,
        walletaddress: String,
        nft_mint_address: String,
    ) -> Result<()> {
        instructions::add_collector::add_collector(
            ctx,
            username,
            avatar,
            walletaddress,
            nft_mint_address,
        )
    }

    pub fn edit_blog_nftcollectionaddress(
        ctx: Context<EditBlogNftCollectionAddress>,
        nftcollectionaddress: String,
    ) -> Result<()> {
        instructions::edit_blog_nftcollectionaddress::edit_blog_nftcollectionaddress(
            ctx,
            nftcollectionaddress,
        )
    }

    pub fn edit_blog_ntotalcollecter(
        ctx: Context<EditBlogNTotalCollecter>,
        ntotalcollecter: u8,
    ) -> Result<()> {
        instructions::edit_blog_ntotalcollecter::edit_blog_ntotalcollecter(
            ctx,
            ntotalcollecter,
        )
    }

    pub fn edit_blog_upvote(ctx: Context<EditBlogUpvote>, upvote: u32) -> Result<()> {
        instructions::edit_blog_upvote::edit_blog_upvote(ctx, upvote)
    }

    pub fn edit_blog_downvote(ctx: Context<EditBlogDownvote>, downvote: u32) -> Result<()> {
        instructions::edit_blog_downvote::edit_blog_downvote(ctx, downvote)
    }

    pub fn add_vote(ctx: Context<AddVote>, status: u8) -> Result<()> {
        instructions::add_vote::add_vote(ctx, status)
    }

    pub fn edit_vote(ctx: Context<EditVote>, status: u8) -> Result<()> {
        instructions::edit_vote::edit_vote(ctx, status)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
