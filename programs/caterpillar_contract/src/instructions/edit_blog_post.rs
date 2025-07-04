use crate::state::BlogPost;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditBlogPost<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub blog_post: Account<'info, BlogPost>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_blog_post(
    ctx: Context<EditBlogPost>,
    nftcollectionaddress: String,
    ntotalcollecter: u8,
    upvote: u32,
    downvote: u32,
) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;
    require!(
        !nftcollectionaddress.trim().is_empty(),
        WordeetError::NFTCollectionAddressNull,
    );
    blog_post.nftcollectionaddress = nftcollectionaddress;
    blog_post.ntotalcollecter = ntotalcollecter;
    blog_post.upvote = upvote;
    blog_post.downvote = downvote;

    Ok(())
}
