use crate::state::BlogPost;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditBlogDownvote<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub blog_post: Account<'info, BlogPost>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_blog_downvote(ctx: Context<EditBlogDownvote>, downvote: u32) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;

    blog_post.downvote = downvote;

    Ok(())
}
