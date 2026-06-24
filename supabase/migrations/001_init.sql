-- Products synced from merchant platform
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  title         text not null,
  sku           text,
  price         numeric(10, 2),
  inventory     integer default 0,
  synced_at     timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Incoming webhook events (stored before processing for idempotency)
create table if not exists webhook_events (
  id            uuid primary key default gen_random_uuid(),
  topic         text not null,
  external_id   text not null,
  payload       jsonb not null,
  processed     boolean default false,
  processed_at  timestamptz,
  created_at    timestamptz default now(),
  unique (topic, external_id)  -- prevent duplicate processing
);

-- OAuth tokens for connected merchant stores
create table if not exists oauth_tokens (
  id            uuid primary key default gen_random_uuid(),
  shop          text not null unique,
  access_token  text not null,
  scopes        text,
  created_at    timestamptz default now()
);

create index on webhook_events (topic, processed);
create index on products (external_id);
