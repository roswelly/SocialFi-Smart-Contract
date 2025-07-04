# Caterpillar SocialFi- Decentralized Blogging Platform

A Solana decentralized blogging platform with NFT integration, built using the Anchor framework.

## Contact

  - [Telegram](https://t.me/caterpillardev)
  - [Twitter](https://x.com/caterpillardev)

## Features

- **Content Management**
  - Create and edit blog posts
  - Support for cover images
  - Category and keyword tagging
  - Content moderation system

- **User System**
  - User profile management
  - Reputation scoring
  - Rate limiting
  - Ban system

- **NFT Integration**
  - Associate blog posts with NFT collections
  - Track collectors
  - Manage mint addresses

- **Engagement Features**
  - Upvote/downvote system
  - Vote tracking
  - Post locking mechanism

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/caterpillardev/caterpillar-socialfi-contract.git
cd caterpillar-socialfi-contract
```

2. Install dependencies:
```bash
yarn install
```

3. Build the program:
```bash
anchor build
```

## Development

### Local Development

1. Start a local Solana validator:
```bash
solana-test-validator
```

2. Deploy the program:
```bash
anchor deploy
```

3. Run tests:
```bash
anchor test
```

### Program Structure

```
caterpillar_contract/
├── src/
│   ├── instructions/     # Individual instruction handlers
│   ├── lib.rs           # Main program entry point
│   ├── state.rs         # Data structures
│   ├── error.rs         # Error definitions
│   ├── constant.rs      # Constants
│   └── validation.rs    # Input validation
├── tests/               # Test suite
└── migrations/          # Database migrations
```

## Smart Contract Architecture

### State Accounts

- `UserProfile`: User information and statistics
- `BlogPost`: Content storage and engagement metrics
- `CollectorInfo`: NFT collection tracking
- `VoteInfo`: Voting system data
- `RateLimit`: Rate limiting mechanism
- `ModerationStatus`: Content moderation tracking

### Key Instructions

- `create_user_profile`: Create a new user profile
- `create_blog_post`: Create a new blog post
- `edit_user_profile`: Update user profile information
- `edit_blog_post`: Modify blog post content
- `add_collector`: Add an NFT collector
- `add_vote`: Add a vote to a blog post
- `edit_vote`: Modify an existing vote

## Security Features

- Input validation for all user inputs
- Rate limiting for post creation
- Content moderation system
- User ban mechanism
- Vote tracking and validation

## Testing

Run the test suite:
```bash
anchor test
```

## Deployment

### Devnet Deployment

1. Configure for devnet:
```bash
solana config set --url devnet
```

2. Deploy the program:
```bash
anchor deploy
```

### Mainnet Deployment

1. Configure for mainnet:
```bash
solana config set --url mainnet-beta
```

2. Deploy the program:
```bash
anchor deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Telegram - [@caterpillardev](https://t.me/caterpillardev)
Twitter - [@caterpillardev](https://twitter.com/caterpillardev)

