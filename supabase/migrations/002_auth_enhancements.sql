-- Auth enhancements: link consumers, staff helpers

create or replace function public.link_consumer_by_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is not null then
    update public.consumers
    set profile_id = new.id, updated_at = now()
    where lower(email) = lower(new.email) and profile_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists link_consumer_on_profile on public.profiles;
create trigger link_consumer_on_profile
  after insert on public.profiles
  for each row execute function public.link_consumer_by_email();

-- Allow users to read their own profile (already exists) and update role during onboarding
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Staff can read all profiles for admin user management
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.get_my_role() = 'admin');

-- Consumers can update own record
drop policy if exists "consumers_update_own" on public.consumers;
create policy "consumers_update_own" on public.consumers
  for update using (profile_id = auth.uid());

-- Anon cannot read data
revoke select on all tables in schema public from anon;
