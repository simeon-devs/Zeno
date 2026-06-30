-- Enable pgvector for semantic search
create extension if not exists vector;

-- ============================================================
-- COMPANIES
-- One row per account. Stores business profile + AI settings.
-- ============================================================
create table companies (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null default '',
  description           text not null default '',
  tone                  text not null default 'professional_friendly'
                          check (tone in ('professional_friendly', 'formal', 'casual', 'sales_focused')),
  response_length       text not null default 'medium'
                          check (response_length in ('short', 'medium', 'detailed')),
  language              text not null default 'auto'
                          check (language in ('auto', 'en', 'ar', 'en_ar')),
  fallback_message      text not null default 'Thank you for your message. A team member will get back to you shortly.',
  auto_reply_enabled    boolean not null default true,
  use_demo_data         boolean not null default true,
  whatsapp_phone_id     text,
  whatsapp_token        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- FAQS
-- Company knowledge base. Each FAQ is embedded for vector search.
-- ============================================================
create table faqs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  question    text not null,
  answer      text not null,
  embedding   vector(768),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CONVERSATIONS
-- One row per unique WhatsApp contact per company.
-- ============================================================
create table conversations (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id) on delete cascade,
  contact_phone         text not null,
  contact_name          text,
  contact_language      text,
  contact_preferences   jsonb not null default '{}',
  summary               text,
  summary_updated_at    timestamptz,
  status                text not null default 'active'
                          check (status in ('active', 'resolved', 'escalated')),
  last_message_at       timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  unique (company_id, contact_phone)
);

-- ============================================================
-- MESSAGES
-- Every individual message in a conversation thread.
-- ============================================================
create table messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references conversations(id) on delete cascade,
  direction         text not null check (direction in ('inbound', 'outbound')),
  body              text not null,
  sent_by           text not null check (sent_by in ('customer', 'ai', 'human')),
  wa_message_id     text,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on faqs using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on conversations (company_id, last_message_at desc);
create index on messages (conversation_id, created_at asc);

-- ============================================================
-- SEMANTIC SEARCH FUNCTION
-- Called by the agent's search-faqs tool.
-- ============================================================
create or replace function match_faqs(
  query_embedding   vector(768),
  filter_company_id uuid,
  match_count       int default 3
)
returns table (
  id          uuid,
  question    text,
  answer      text,
  similarity  float
)
language sql stable
as $$
  select
    id,
    question,
    answer,
    1 - (embedding <=> query_embedding) as similarity
  from faqs
  where company_id = filter_company_id
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
  before update on companies
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Users can only access their own company's data.
-- ============================================================
alter table companies     enable row level security;
alter table faqs          enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;

-- Companies: owner only
create policy "owner can manage company"
  on companies for all
  using (user_id = auth.uid());

-- FAQs: scoped through company ownership
create policy "owner can manage faqs"
  on faqs for all
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- Conversations: scoped through company ownership
create policy "owner can manage conversations"
  on conversations for all
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- Messages: scoped through conversation → company ownership
create policy "owner can manage messages"
  on messages for all
  using (
    conversation_id in (
      select c.id from conversations c
      join companies co on co.id = c.company_id
      where co.user_id = auth.uid()
    )
  );
