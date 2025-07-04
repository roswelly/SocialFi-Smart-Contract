use crate::*;
use crate::constant::*;
use crate::error::CaterpillarError;

pub fn validate_username(username: &str) -> Result<()> {
    if username.len() > MAX_USERNAME_LENGTH {
        return Err(CaterpillarError::UsernameTooLong.into());
    }
    if username.is_empty() {
        return Err(CaterpillarError::UsernameEmpty.into());
    }
    // Check for valid characters (alphanumeric and some special chars)
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-') {
        return Err(CaterpillarError::InvalidUsernameFormat.into());
    }
    Ok(())
}
//
pub fn validate_bio(bio: &str) -> Result<()> {
    if bio.len() > MAX_BIO_LENGTH {
        return Err(CaterpillarError::BioTooLong.into());
    }
    Ok(())
}

pub fn validate_title(title: &str) -> Result<()> {
    if title.len() > MAX_TITLE_LENGTH {
        return Err(CaterpillarError::TitleTooLong.into());
    }
    if title.is_empty() {
        return Err(CaterpillarError::TitleEmpty.into());
    }
    Ok(())
}

pub fn validate_content(content: &str) -> Result<()> {
    if content.len() > MAX_CONTENT_LENGTH {
        return Err(CaterpillarError::ContentTooLong.into());
    }
    if content.is_empty() {
        return Err(CaterpillarError::ContentEmpty.into());
    }
    Ok(())
}

pub fn validate_url(url: &str) -> Result<()> {
    if url.is_empty() {
        return Ok(());
    }
    if url.len() > MAX_URL_LENGTH {
        return Err(CaterpillarError::UrlTooLong.into());
    }
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(CaterpillarError::InvalidUrlFormat.into());
    }
    Ok(())
}

pub fn validate_category(category: &str) -> Result<()> {
    if category.len() > MAX_CATEGORY_LENGTH {
        return Err(CaterpillarError::CategoryTooLong.into());
    }
    if category.is_empty() {
        return Err(CaterpillarError::CategoryEmpty.into());
    }
    Ok(())
}

pub fn validate_keywords(keywords: &str) -> Result<()> {
    if keywords.len() > MAX_KEYWORDS_LENGTH {
        return Err(CaterpillarError::KeywordsTooLong.into());
    }
    Ok(())
} 