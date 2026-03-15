create table if not exists public.gist_submissions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gist_submissions enable row level security;

create policy "Users can insert their own gist submissions"
on public.gist_submissions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own gist submissions"
on public.gist_submissions for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins and MoM can view all gist submissions"
on public.gist_submissions for select
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
    and ur.role in ('admin', 'mom_team', 'scrutiny_team')
  )
);