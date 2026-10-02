-- Cartas da Raposa: quem assina pelo site.
-- O visitante só pode se inscrever (inserir); não lê, não altera, não apaga.
-- A lista se vê no painel da Supabase (Table Editor), com a conta do dono.

create table if not exists public.cartas_inscritos (
  id bigint generated always as identity primary key,
  email text not null
    check (length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  consentimento text not null check (length(consentimento) between 10 and 500),
  origem text check (length(origem) <= 40),
  pagina text check (length(pagina) <= 300),
  criado_em timestamptz not null default now()
);

-- o mesmo e-mail não entra duas vezes (o site mostra «você já está na lista»)
create unique index if not exists cartas_inscritos_email_unico
  on public.cartas_inscritos (lower(email));

alter table public.cartas_inscritos enable row level security;

drop policy if exists "visitante se inscreve" on public.cartas_inscritos;
create policy "visitante se inscreve" on public.cartas_inscritos
  for insert to anon
  with check (true);

-- só a inserção, e só destas colunas
revoke all on public.cartas_inscritos from anon, authenticated;
grant insert (email, consentimento, origem, pagina) on public.cartas_inscritos to anon;

comment on table public.cartas_inscritos is
  'Cartas da Raposa: e-mails de quem assinou pelo site, com o texto do consentimento. Inserção pública; leitura só pelo painel da Supabase.';
