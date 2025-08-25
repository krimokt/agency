-- Create table to store individual mobile QR scan uploads (one row per uploaded document)
-- Run this in your Supabase SQL editor or via migration.

-- Enable required extension (Supabase usually has this enabled)
-- create extension if not exists pgcrypto;

create table if not exists public.client_qrscan (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  qr_token_id uuid,
  document_type text not null check (document_type in ('id_front','id_back','license_front','license_back')),
  storage_path text not null,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  constraint fk_client_qrscan_client
    foreign key (client_id) references public.clients(id) on delete cascade,
  constraint fk_client_qrscan_qr_token
    foreign key (qr_token_id) references public.qr_tokens(id) on delete set null
);

create index if not exists idx_client_qrscan_client_id on public.client_qrscan(client_id);
create index if not exists idx_client_qrscan_qr_token_id on public.client_qrscan(qr_token_id);
create index if not exists idx_client_qrscan_document_type on public.client_qrscan(document_type);

 

