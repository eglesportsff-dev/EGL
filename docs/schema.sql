create type role as enum ('USER','CONTROLLER','MASTER_CONTROLLER','ADMIN');
create type request_status as enum ('PENDING','APPROVED','REJECTED','FORWARDED','COMPLETED');
create type game_type as enum ('BATTLE_ROYALE','CLASH_SQUAD','LONE_WOLF');
create type match_variant as enum ('BR_SQUAD','BR_DUO','BR_SOLO','CS_SQUAD','LONE_WOLF_1V1','LONE_WOLF_2V2');
create type transaction_type as enum ('DEPOSIT','ENTRY_FEE','REFUND','REWARD','WITHDRAWAL');
create type notification_type as enum ('PAYMENT','MATCH','UPDATE');

create table users (
  id bigserial primary key,
  uid varchar(32) not null unique,
  username varchar(80) not null,
  email varchar(160) not null unique,
  password_hash varchar(255) not null,
  role varchar(32) not null default 'USER',
  email_verified boolean not null default false,
  wallet_balance numeric(12,2) not null default 0,
  winning_points numeric(12,2) not null default 0,
  otp_hash varchar(255),
  otp_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table teams (
  id bigserial primary key,
  name varchar(120) not null unique,
  total_winning_points numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table team_members (
  id bigserial primary key,
  team_id bigint not null references teams(id),
  user_id bigint not null references users(id),
  unique(team_id, user_id)
);

create table matches (
  id bigserial primary key,
  title varchar(160) not null,
  game_type varchar(32) not null,
  variant varchar(32) not null,
  entry_fee numeric(12,2) not null,
  first_reward numeric(12,2) not null,
  second_reward numeric(12,2) not null,
  third_reward numeric(12,2) not null,
  room_size integer not null,
  match_time timestamptz,
  register_before timestamptz not null,
  active boolean not null default true,
  team_only boolean not null default false,
  room_id varchar(80),
  room_password varchar(80),
  created_by_id bigint references users(id)
);

create table match_participants (
  id bigserial primary key,
  match_id bigint not null references matches(id),
  user_id bigint not null references users(id),
  team_id bigint references teams(id),
  joined_at timestamptz not null default now(),
  unique(match_id, user_id)
);

create table team_invites (
  id bigserial primary key,
  match_id bigint not null references matches(id),
  team_id bigint not null references teams(id),
  inviter_id bigint not null references users(id),
  invitee_id bigint not null references users(id),
  accepted boolean not null default false,
  rejected boolean not null default false,
  note varchar(240),
  response_note varchar(240),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  unique(match_id, invitee_id)
);

create table wallet_transactions (
  id bigserial primary key,
  user_id bigint not null references users(id),
  type varchar(32) not null,
  amount numeric(12,2) not null,
  note varchar(255) not null,
  created_at timestamptz not null default now()
);

create table deposit_requests (
  id bigserial primary key,
  user_id bigint not null references users(id),
  amount numeric(12,2) not null check (amount >= 12 and amount <= 2000),
  utr_number varchar(80) not null,
  status varchar(32) not null default 'PENDING',
  note varchar(255),
  rejection_reason varchar(255),
  created_at timestamptz not null default now()
);

create table withdraw_requests (
  id bigserial primary key,
  user_id bigint not null references users(id),
  upi_id varchar(120) not null,
  amount numeric(12,2) not null check (amount > 0),
  status varchar(32) not null default 'PENDING',
  rejection_reason varchar(255),
  transfer_reference varchar(120),
  created_at timestamptz not null default now()
);

create table tournament_updates (
  id bigserial primary key,
  title varchar(120) not null,
  message varchar(4000) not null,
  created_at timestamptz not null default now()
);

create table user_notifications (
  id bigserial primary key,
  user_id bigint not null references users(id),
  type varchar(32) not null,
  title varchar(120) not null,
  message varchar(4000) not null,
  reference_id bigint,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create table controllers (
  id bigserial primary key,
  user_id bigint not null unique references users(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table master_controllers (
  id bigserial primary key,
  user_id bigint not null unique references users(id),
  qr_code_url varchar(500),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create view leaderboard as
select row_number() over (order by total_winning_points desc) as rank, id as team_id, name as team_name, total_winning_points
from teams;

create index idx_users_email on users(email);
create index idx_users_uid on users(uid);
create index idx_users_role on users(role);
create index idx_matches_type on matches(game_type, variant);
create index idx_matches_time on matches(match_time);
create index idx_wallet_user_created on wallet_transactions(user_id, created_at desc);
create index idx_deposit_status on deposit_requests(status);
create index idx_withdraw_status on withdraw_requests(status);
create index idx_notifications_user_created on user_notifications(user_id, created_at desc);
create index idx_notifications_user_seen on user_notifications(user_id, seen);
