CREATE TABLE accounts (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    type VARCHAR(20) NOT NULL
);

CREATE TABLE categories (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    kind VARCHAR(20) NOT NULL
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(120) NOT NULL,
    category_id VARCHAR(32) NOT NULL REFERENCES categories (id),
    account_id VARCHAR(32) NOT NULL REFERENCES accounts (id),
    amount_cents BIGINT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT transactions_amount_not_zero CHECK (amount_cents <> 0),
    CONSTRAINT transactions_amount_sign CHECK (
        (type = 'INCOME' AND amount_cents > 0)
        OR (type = 'EXPENSE' AND amount_cents < 0)
    )
);

CREATE INDEX idx_transactions_occurred_at ON transactions (occurred_at DESC);

INSERT INTO accounts (id, name, type) VALUES
    ('main', 'Conta principal', 'CHECKING'),
    ('reserve', 'Reserva', 'DIGITAL');

INSERT INTO categories (id, name, kind) VALUES
    ('home', 'Moradia', 'EXPENSE'),
    ('food', 'Alimentação', 'EXPENSE'),
    ('transport', 'Transporte', 'EXPENSE'),
    ('leisure', 'Lazer', 'EXPENSE'),
    ('subscription', 'Assinaturas', 'EXPENSE'),
    ('other', 'Outros', 'EXPENSE'),
    ('income', 'Receita', 'INCOME');
