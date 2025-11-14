-- Migration: Add notifications support
-- Date: Nov 2025
-- Description: Adds notification_logs table and notifications column to settings table

-- Add notifications column to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "expense_reminders": {"enabled": true, "time_slots": ["07:00-12:00", "12:00-17:00", "17:00-21:00"]},
  "budget_alert_70": {"enabled": true},
  "budget_alert_90": {"enabled": true},
  "weekly_summary": {"enabled": false, "day": "sunday", "time": "20:00"},
  "monthly_summary": {"enabled": false, "day": 1, "time": "09:00"}
}'::jsonb;

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('reminder','budget_70','budget_90','weekly_summary','monthly_summary')),
  time_slot text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id, sent_at DESC);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Add policies
DROP POLICY IF EXISTS "notification_logs_select" ON public.notification_logs;
CREATE POLICY "notification_logs_select" ON public.notification_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notification_logs_insert" ON public.notification_logs;
CREATE POLICY "notification_logs_insert" ON public.notification_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

