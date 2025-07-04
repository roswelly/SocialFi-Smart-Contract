use crate::*;
//
#[error_code]
pub enum CaterpillarError {
    #[msg("UserProfile does not exist.")]
    UserProfileNotFound,
    #[msg("Blog post creation failed.")]
    BlogPostCreationFailed,
    #[msg("The username is too long")]
    UsernameTooLong,
    #[msg("The username is empty")]
    UsernameEmpty,
    #[msg("Invalid username format")]
    InvalidUsernameFormat,
    #[msg("The bio is too long")]
    BioTooLong,
    #[msg("The title is too long")]
    TitleTooLong,
    #[msg("The title is empty")]
    TitleEmpty,
    #[msg("The content is too long")]
    ContentTooLong,
    #[msg("The content is empty")]
    ContentEmpty,
    #[msg("The URL is too long")]
    UrlTooLong,
    #[msg("Invalid URL format")]
    InvalidUrlFormat,
    #[msg("The category is too long")]
    CategoryTooLong,
    #[msg("The category is empty")]
    CategoryEmpty,
    #[msg("The keywords are too long")]
    KeywordsTooLong,
    #[msg("Rate limit exceeded")]
    RateLimitExceeded,
    #[msg("User is banned")]
    UserBanned,
    #[msg("Insufficient permissions")]
    InsufficientPermissions,
    #[msg("Post is locked")]
    PostLocked,
    #[msg("Invalid NFT collection address")]
    InvalidNFTCollectionAddress,
    #[msg("Operation not allowed")]
    OperationNotAllowed,
}
