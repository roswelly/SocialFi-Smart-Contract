use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod match_three {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.player = ctx.accounts.player.key();
        game.score = 0;
        game.level = 1;
        game.is_active = true;
        Ok(())
    }

    pub fn update_score(ctx: Context<UpdateScore>, new_score: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.is_active, GameError::GameNotActive);
        require!(game.player == ctx.accounts.player.key(), GameError::NotAuthorized);
        
        game.score = new_score;
        if new_score > game.high_score {
            game.high_score = new_score;
        }
        Ok(())
    }

    pub fn complete_level(ctx: Context<CompleteLevel>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.is_active, GameError::GameNotActive);
        require!(game.player == ctx.accounts.player.key(), GameError::NotAuthorized);
        
        game.level += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(init, payer = player, space = 8 + Game::LEN)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteLevel<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[account]
pub struct Game {
    pub player: Pubkey,
    pub score: u64,
    pub high_score: u64,
    pub level: u8,
    pub is_active: bool,
}

impl Game {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 1;
}

#[error_code]
pub enum GameError {
    #[msg("Game is not active")]
    GameNotActive,
    #[msg("Not authorized")]
    NotAuthorized,
} 