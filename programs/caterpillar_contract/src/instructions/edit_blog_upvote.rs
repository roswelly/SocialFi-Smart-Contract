use crate::state::BlogPost;
use crate::WordeetError;
use crate::*;

#[derive(Accounts)]
pub struct EditBlogUpvote<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub blog_post: Account<'info, BlogPost>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_blog_upvote(ctx: Context<EditBlogUpvote>, upvote: u32) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;

    blog_post.upvote = upvote;

    Ok(())
}
