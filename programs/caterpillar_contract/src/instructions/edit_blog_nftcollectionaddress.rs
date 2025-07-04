use crate::state::BlogPost;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditBlogNftCollectionAddress<'info> {
    #[account(mut)]
    pub blog_post: Account<'info, BlogPost>,
}

pub fn edit_blog_nftcollectionaddress(
    ctx: Context<EditBlogNftCollectionAddress>,
    nftcollectionaddress: String,
) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;
    require!(
        !nftcollectionaddress.trim().is_empty(),
        WordeetError::NFTCollectionAddressNull,
    );
    blog_post.nftcollectionaddress = nftcollectionaddress;

    Ok(())
}
