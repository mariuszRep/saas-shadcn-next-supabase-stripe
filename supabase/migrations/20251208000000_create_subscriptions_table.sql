-- Create subscriptions table for Stripe subscription management
-- This table stores subscription data synced from Stripe webhooks

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
  'paused'
);

-- Subscriptions table
CREATE TABLE subscriptions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization relationship
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Subscription details
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SELECT: Users can view subscriptions for organizations they have access to
CREATE POLICY subscriptions_select_policy ON subscriptions
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id
      FROM permissions
      WHERE principal_id = auth.uid()
        AND principal_type = 'user'
        AND deleted_at IS NULL
    )
  );

-- INSERT: Users with admin/owner role can create subscriptions (typically via webhooks with service role)
CREATE POLICY subscriptions_insert_policy ON subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM permissions p
      JOIN roles r ON p.role_id = r.id
      WHERE p.org_id = subscriptions.org_id
        AND p.principal_id = auth.uid()
        AND p.principal_type = 'user'
        AND p.deleted_at IS NULL
        AND r.name IN ('owner', 'admin')
    )
  );

-- UPDATE: Users with admin/owner role can update subscriptions (typically via webhooks with service role)
CREATE POLICY subscriptions_update_policy ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM permissions p
      JOIN roles r ON p.role_id = r.id
      WHERE p.org_id = subscriptions.org_id
        AND p.principal_id = auth.uid()
        AND p.principal_type = 'user'
        AND p.deleted_at IS NULL
        AND r.name IN ('owner', 'admin')
    )
  );

-- DELETE: Only owners can delete subscriptions
CREATE POLICY subscriptions_delete_policy ON subscriptions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM permissions p
      JOIN roles r ON p.role_id = r.id
      WHERE p.org_id = subscriptions.org_id
        AND p.principal_id = auth.uid()
        AND p.principal_type = 'user'
        AND p.deleted_at IS NULL
        AND r.name = 'owner'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();
