CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_lowercase CHECK (email = lower(email)),
    CONSTRAINT users_display_name_length CHECK (
        char_length(display_name) >= 2
        AND char_length(display_name) <= 80
    )
);

DO $$
DECLARE
    legacy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO legacy_count FROM transactions;
    IF legacy_count > 0 THEN
        RAISE EXCEPTION
            'Cannot apply transaction ownership: % legacy transaction(s) exist without an owner. Reset the local development database with `docker compose down -v` instead of backfilling or creating a fake user.',
            legacy_count;
    END IF;
END $$;

ALTER TABLE transactions
    ADD COLUMN user_id UUID NOT NULL REFERENCES users (id);

CREATE INDEX idx_transactions_user_occurred_at ON transactions (user_id, occurred_at DESC);

DROP INDEX idx_transactions_occurred_at;
