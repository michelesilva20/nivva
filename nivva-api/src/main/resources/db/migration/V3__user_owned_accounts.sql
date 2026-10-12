DO $$
DECLARE
    user_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO transaction_count FROM transactions;
    IF user_count > 0 OR transaction_count > 0 THEN
        RAISE EXCEPTION
            'Cannot rewrite accounts as user-owned: % user(s) and % transaction(s) exist. Reset the local development database with `docker compose down -v` instead of remapping legacy data.',
            user_count,
            transaction_count;
    END IF;
END $$;

ALTER TABLE transactions DROP CONSTRAINT transactions_account_id_fkey;

DROP TABLE accounts;

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    name VARCHAR(80) NOT NULL,
    type VARCHAR(20) NOT NULL,
    opening_balance_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT accounts_user_id_id_unique UNIQUE (user_id, id),
    CONSTRAINT accounts_name_length CHECK (
        char_length(name) >= 1
        AND char_length(name) <= 80
    ),
    CONSTRAINT accounts_opening_non_negative CHECK (opening_balance_cents >= 0),
    CONSTRAINT accounts_type_known CHECK (
        type IN ('CHECKING', 'SAVINGS', 'DIGITAL', 'CASH', 'OTHER')
    )
);

CREATE INDEX idx_accounts_user_created_at ON accounts (user_id, created_at);

ALTER TABLE transactions DROP COLUMN account_id;
ALTER TABLE transactions ADD COLUMN account_id UUID NOT NULL;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_user_account_fkey
    FOREIGN KEY (user_id, account_id)
    REFERENCES accounts (user_id, id)
    ON DELETE RESTRICT;
