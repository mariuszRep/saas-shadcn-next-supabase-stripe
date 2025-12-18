-- Add org_id column to invitations table
-- This links invitations directly to organizations, making queries more efficient

-- First, add the column as nullable
ALTER TABLE "public"."invitations"
ADD COLUMN "org_id" uuid;

-- Backfill existing invitations with org_id from their permissions
-- This finds the org_id for each invitation by looking at the user's organization permission
UPDATE "public"."invitations" i
SET org_id = p.org_id
FROM "public"."permissions" p
WHERE i.user_id = p.principal_id
  AND p.object_type = 'organization'
  AND i.org_id IS NULL;

-- Delete any invitations that couldn't be matched to an organization
-- (These are orphaned invitations with no corresponding permission)
DELETE FROM "public"."invitations"
WHERE org_id IS NULL;

-- Now make it NOT NULL since all existing rows have been updated
ALTER TABLE "public"."invitations"
ALTER COLUMN "org_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "public"."invitations"
ADD CONSTRAINT "invitations_org_id_fkey"
FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_invitations_org_id ON public.invitations USING btree (org_id);

-- Create composite index for common query pattern (user + status + org)
CREATE INDEX idx_invitations_user_org_status ON public.invitations USING btree (user_id, org_id, status);
