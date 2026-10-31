-- SOMENTE para o projeto de EXERCÍCIO do curso (dados fictícios). Nunca execute no projeto de produção.
-- Esquema dos planos no Supabase (exercício). Cole inteiro no SQL Editor do projeto e execute uma vez.

create table public.planos (
  id bigint generated always as identity primary key,
  nome text not null,
  preco numeric(10,2) not null,
  duracao_meses integer not null default 1,
  descricao text,
  criado_em timestamptz not null default now()
);

alter table public.planos enable row level security;

create policy "leitura anonima" on public.planos for select to anon using (true);
create policy "inclusao anonima" on public.planos for insert to anon with check (true);

grant usage on schema public to anon;
grant select, insert on public.planos to anon;
grant usage, select on sequence public.planos_id_seq to anon;

insert into public.planos (nome, preco, duracao_meses, descricao) values
  ('Mensal Básico', 99.90, 1, 'Acesso à musculação e área cardio em horário livre.'),
  ('Trimestral Fit', 269.70, 3, 'Musculação, cardio e avaliação física trimestral inclusa.'),
  ('Anual VIP MisterFit', 899.00, 12, 'Acesso total irrestrito, musculação, aulas coletivas e armário exclusivo.');

-- Endurecimento de segurança do módulo 8: impede alteração e remoção pela chave anônima
revoke update, delete on public.planos from anon;
