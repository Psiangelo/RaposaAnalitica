-- Ajuste depois dos avisos de segurança da Supabase (01/10/2026):
-- a função que diz «é administrador?» sai do esquema público (a API não a
-- expõe mais) e vai para o esquema `privado`. O painel confere o próprio
-- cadastro lendo a linha dele em `administradores`.

create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

create or replace function privado.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where user_id = (select auth.uid()));
$$;
revoke all on function privado.eh_admin() from public, anon;
grant execute on function privado.eh_admin() to authenticated;

-- as regras passam a usar a função privada
alter policy "admin cria" on public.conteudo with check ((select privado.eh_admin()));
alter policy "admin altera" on public.conteudo using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
alter policy "admin apaga" on public.conteudo using ((select privado.eh_admin()));
alter policy "admin vê o histórico" on public.conteudo_historico using ((select privado.eh_admin()));
alter policy "admin lê os inscritos" on public.cartas_inscritos using ((select privado.eh_admin()));
alter policy "admin apaga inscrito" on public.cartas_inscritos using ((select privado.eh_admin()));
alter policy "admin envia imagens" on storage.objects with check (bucket_id = 'imagens' and (select privado.eh_admin()));
alter policy "admin troca imagens" on storage.objects using (bucket_id = 'imagens' and (select privado.eh_admin()));
alter policy "admin apaga imagens" on storage.objects using (bucket_id = 'imagens' and (select privado.eh_admin()));

drop function if exists public.eh_admin();

-- substituir uma imagem (upsert) também exige poder ver o arquivo
drop policy if exists "admin vê imagens" on storage.objects;
create policy "admin vê imagens" on storage.objects
  for select to authenticated using (bucket_id = 'imagens' and (select privado.eh_admin()));
