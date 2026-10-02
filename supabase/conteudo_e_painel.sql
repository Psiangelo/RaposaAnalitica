-- Raposa Analítica: o conteúdo do site e o painel de administração.
--
-- O conteúdo que o painel edita (ensaios, verbetes, trilhas, home, textos,
-- configurações…) mora na tabela `conteudo`, uma linha por chave do painel.
-- Qualquer visitante LÊ (é o conteúdo público do site); só administrador
-- escreve. Cada versão anterior vai para `conteudo_historico`, para desfazer.
-- As imagens enviadas pelo painel ficam no balde público `imagens`.

-- ------------------------------------------------------------ administradores
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  criado_em timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;
grant select on public.administradores to authenticated;
drop policy if exists "cada um vê a própria linha" on public.administradores;
create policy "cada um vê a própria linha" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where user_id = (select auth.uid()));
$$;
revoke all on function public.eh_admin() from public;
grant execute on function public.eh_admin() to authenticated;

-- ------------------------------------------------------------ conteúdo
create table if not exists public.conteudo (
  chave text primary key check (chave ~ '^raposa_admin_[a-z_]+$'),
  valor jsonb not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references auth.users (id) on delete set null
);
alter table public.conteudo enable row level security;
revoke all on public.conteudo from anon, authenticated;
grant select on public.conteudo to anon, authenticated;
grant insert, update, delete on public.conteudo to authenticated;

drop policy if exists "todos leem o conteúdo" on public.conteudo;
create policy "todos leem o conteúdo" on public.conteudo
  for select to anon, authenticated using (true);
drop policy if exists "admin cria" on public.conteudo;
create policy "admin cria" on public.conteudo
  for insert to authenticated with check ((select public.eh_admin()));
drop policy if exists "admin altera" on public.conteudo;
create policy "admin altera" on public.conteudo
  for update to authenticated using ((select public.eh_admin())) with check ((select public.eh_admin()));
drop policy if exists "admin apaga" on public.conteudo;
create policy "admin apaga" on public.conteudo
  for delete to authenticated using ((select public.eh_admin()));

-- carimbo de quando e quem
create or replace function public.conteudo_carimbo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := (select auth.uid());
  return new;
end;
$$;
drop trigger if exists conteudo_carimbo on public.conteudo;
create trigger conteudo_carimbo
  before insert or update on public.conteudo
  for each row execute function public.conteudo_carimbo();

-- ------------------------------------------------------------ histórico
create table if not exists public.conteudo_historico (
  id bigint generated always as identity primary key,
  chave text not null,
  valor jsonb not null,
  versao_de timestamptz not null,
  guardado_em timestamptz not null default now(),
  guardado_por uuid
);
create index if not exists conteudo_historico_chave on public.conteudo_historico (chave, guardado_em desc);
alter table public.conteudo_historico enable row level security;
revoke all on public.conteudo_historico from anon, authenticated;
grant select on public.conteudo_historico to authenticated;
drop policy if exists "admin vê o histórico" on public.conteudo_historico;
create policy "admin vê o histórico" on public.conteudo_historico
  for select to authenticated using ((select public.eh_admin()));

create or replace function public.conteudo_guarda_historico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' or old.valor is distinct from new.valor then
    insert into public.conteudo_historico (chave, valor, versao_de, guardado_por)
    values (old.chave, old.valor, old.atualizado_em, (select auth.uid()));
  end if;
  return coalesce(new, old);
end;
$$;
revoke all on function public.conteudo_guarda_historico() from public, anon, authenticated;
drop trigger if exists conteudo_guarda_historico on public.conteudo;
create trigger conteudo_guarda_historico
  after update or delete on public.conteudo
  for each row execute function public.conteudo_guarda_historico();

-- ------------------------------------------------------------ as Cartas no painel
grant select, delete on public.cartas_inscritos to authenticated;
drop policy if exists "admin lê os inscritos" on public.cartas_inscritos;
create policy "admin lê os inscritos" on public.cartas_inscritos
  for select to authenticated using ((select public.eh_admin()));
drop policy if exists "admin apaga inscrito" on public.cartas_inscritos;
create policy "admin apaga inscrito" on public.cartas_inscritos
  for delete to authenticated using ((select public.eh_admin()));

-- ------------------------------------------------------------ imagens
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagens', 'imagens', true, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin envia imagens" on storage.objects;
create policy "admin envia imagens" on storage.objects
  for insert to authenticated with check (bucket_id = 'imagens' and (select public.eh_admin()));
drop policy if exists "admin troca imagens" on storage.objects;
create policy "admin troca imagens" on storage.objects
  for update to authenticated using (bucket_id = 'imagens' and (select public.eh_admin()));
drop policy if exists "admin apaga imagens" on storage.objects;
create policy "admin apaga imagens" on storage.objects
  for delete to authenticated using (bucket_id = 'imagens' and (select public.eh_admin()));
