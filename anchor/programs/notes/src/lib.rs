use anchor_lang::prelude::*;

declare_id!("Fkswxi1MmPoHJMnG1AiYubb8WpMDBSLZ1o88aZhjJW5v");

#[program]
pub mod notes {
    use super::*;
    pub fn create_note(ctx: Context<CreateNote>, title: String, content: String) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        require!(title.len() <= 100, ErrorCode::TitleTooLong);
        require!(content.len() <= 1090, ErrorCode::ContentTooLong);
        require!(!title.trim().is_empty(), ErrorCode::TitleEmpty);
        require!(!content.trim().is_empty(), ErrorCode::ContentEmpty);

        note.author = ctx.accounts.author.key();
        note.title = title.clone();
        note.content = content.clone();
        note.created_at = clock.unix_timestamp;
        note.last_updated = clock.unix_timestamp;

        msg!(
            "Note created! Author: {}, Title: {}, Created At: {}",
            note.author,
            note.title,
            note.created_at
        );

        Ok(())
    }

    pub fn update_note(ctx: Context<UpdateNote>, content: String) -> Result<()> {
        let note = &mut ctx.accounts.note;
        let clock = Clock::get()?;

        require!(
            note.author == ctx.accounts.author.key(),
            ErrorCode::Unauthorized
        );
        require!(content.len() <= 1090, ErrorCode::ContentTooLong);
        require!(!content.trim().is_empty(), ErrorCode::ContentEmpty);

        note.content = content.clone();
        note.last_updated = clock.unix_timestamp;

        msg!("Note {} updated!", note.title);

        Ok(())
    }

    pub fn delete_note(ctx: Context<DeleteNote>) -> Result<()> {
        let note = &ctx.accounts.note; // we are deleting so no need to have mutable reference
        require!(
            note.author == ctx.accounts.author.key(),
            ErrorCode::Unauthorized
        );

        msg!("Note {} deleted.", note.title);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateNote<'info> {
    #[account(init,
        payer = author,
        space = 8 + Note::INIT_SPACE,
        seeds = [b"note", author.key().as_ref(), title.as_bytes()],
        bump,
        )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]

pub struct UpdateNote<'info> {
    #[account(
    mut,
    seeds = [b"note", author.key().as_ref(), note.title.as_bytes()],
    bump
    )]
    pub note: Account<'info, Note>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteNote<'info> {
    #[account(
        mut,
        seeds = [b"note", author.key().as_ref(), note.title.as_bytes()],
        bump,
        close = author
    )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub author: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(6000)]
    pub content: String,
    pub created_at: i64,
    pub last_updated: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title cannot be more than 100 characters.")]
    TitleTooLong,

    #[msg("Content cannot be more than 1000 characters.")]
    ContentTooLong,

    #[msg("Title cannot be empty.")]
    TitleEmpty,

    #[msg("Content cannot be empty.")]
    ContentEmpty,

    #[msg("Unauthorized")]
    Unauthorized,
}
