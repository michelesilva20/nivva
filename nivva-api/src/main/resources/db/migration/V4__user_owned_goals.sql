CREATE TABLE goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    title VARCHAR(120) NOT NULL,
    target_amount_cents BIGINT NOT NULL,
    deadline DATE NULL,
    note VARCHAR(500) NULL,
    icon_key VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT goals_title_length CHECK (
        char_length(title) >= 1
        AND char_length(title) <= 120
    ),
    CONSTRAINT goals_target_positive CHECK (target_amount_cents > 0),
    CONSTRAINT goals_icon_key_known CHECK (
        icon_key IN ('home', 'travel', 'emergency', 'education', 'purchase', 'other')
    )
);

CREATE INDEX idx_goals_user_created_at ON goals (user_id, created_at);

CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    note VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT goal_contributions_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX idx_goal_contributions_goal_occurred_at
    ON goal_contributions (goal_id, occurred_at DESC);
