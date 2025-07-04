use crate::state::BlogPost;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditBlogNTotalCollecter<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub blog_post: Account<'info, BlogPost>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_blog_ntotalcollecter(
    ctx: Context<EditBlogNTotalCollecter>,
    ntotalcollecter: u8,
) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;

    blog_post.ntotalcollecter = ntotalcollecter;

    Ok(())
}
