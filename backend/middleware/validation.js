// Validation middleware for common validation functions

// Validate Ethereum address format
const validateAddress = (value) => {
  if (!value) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

// Validate transaction hash format
const validateTxHash = (value) => {
  if (!value) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(value);
};

// Validate chain ID
const validateChainId = (value) => {
  const chainId = parseInt(value);
  return !isNaN(chainId) && chainId > 0;
};

// Validate amount (positive number string)
const validateAmount = (value) => {
  if (!value) return false;
  const amount = parseFloat(value);
  return !isNaN(amount) && amount >= 0;
};

// Validate URL format
const validateURL = (value) => {
  if (!value) return true; // Optional
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Validate email format
const validateEmail = (value) => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

// Validate username format
const validateUsername = (value) => {
  if (!value) return false;
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(value);
};

// Validate password strength
const validatePassword = (value) => {
  if (!value) return false;
  // At least 6 characters, can contain letters, numbers, and special characters
  return value.length >= 6;
};

// Validate pagination parameters
const validatePagination = (page, pageSize) => {
  const pageNum = parseInt(page);
  const sizeNum = parseInt(pageSize);
  
  if (isNaN(pageNum) || pageNum < 1) return false;
  if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 100) return false;
  
  return true;
};

// Validate sort parameters
const validateSort = (sortBy, sortOrder) => {
  const validSortFields = [
    'createdAt', 'updatedAt', 'name', 'symbol', 'currentPriceUSD',
    'marketCapUSD', 'volume24hUSD', 'priceChange24hPercent',
    'totalLiquidityUSD', 'blockNumber', 'blockTimestamp'
  ];
  
  const validSortOrders = ['asc', 'desc'];
  
  if (sortBy && !validSortFields.includes(sortBy)) return false;
  if (sortOrder && !validSortOrders.includes(sortOrder)) return false;
  
  return true;
};

// Validate date range
const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  if (start >= end) return false;
  
  return true;
};

// Validate token metadata
const validateTokenMetadata = (metadata) => {
  const { name, symbol, description } = metadata;
  
  if (!name || name.length < 1 || name.length > 100) return false;
  if (!symbol || symbol.length < 1 || symbol.length > 10) return false;
  if (description && description.length > 1000) return false;
  
  return true;
};

// Validate social links
const validateSocialLinks = (links) => {
  const validPlatforms = ['website', 'youtube', 'discord', 'twitter', 'telegram', 'github'];
  
  for (const [platform, url] of Object.entries(links)) {
    if (validPlatforms.includes(platform) && url && !validateURL(url)) {
      return false;
    }
  }
  
  return true;
};

// Sanitize input data
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

// Validate and sanitize address
const validateAndSanitizeAddress = (address) => {
  if (!address) return null;
  
  const sanitized = address.trim().toLowerCase();
  return validateAddress(sanitized) ? sanitized : null;
};

// Validate numeric string
const validateNumericString = (value) => {
  if (!value) return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Validate boolean string
const validateBooleanString = (value) => {
  if (!value) return false;
  return value === 'true' || value === 'false';
};

// Validate array of strings
const validateStringArray = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every(item => typeof item === 'string' && item.trim().length > 0);
};

module.exports = {
  validateAddress,
  validateTxHash,
  validateChainId,
  validateAmount,
  validateURL,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePagination,
  validateSort,
  validateDateRange,
  validateTokenMetadata,
  validateSocialLinks,
  sanitizeInput,
  validateAndSanitizeAddress,
  validateNumericString,
  validateBooleanString,
  validateStringArray
};
