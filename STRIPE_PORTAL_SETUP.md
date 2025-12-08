# Stripe Customer Portal Configuration & Testing Guide

## Quick Start

Task 1399 implementation is complete. Follow this guide to configure Stripe Dashboard and test the Customer Portal integration.

## Step 1: Configure Stripe Customer Portal

1. Go to https://dashboard.stripe.com/test/settings/billing/portal
2. Enable these features:
   - ✅ **Customers can cancel subscriptions** → "At the end of billing period"
   - ✅ **Customers can update payment methods** → All card types
   - ✅ **Customers can view invoices**

3. Click **Save**

## Step 2: Start Stripe CLI (Webhook Forwarding)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and update `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Restart dev server: `npm run dev`

## Step 3: Test Complete Flow

### 3.1 Create Subscription
1. Go to http://localhost:3000/subscription/test
2. Click "Create Subscription Checkout"
3. Use test card: **4242 4242 4242 4242**
4. Complete checkout

### 3.2 Access Customer Portal
1. Click "Manage Subscription (Customer Portal)"
2. Verify redirect to Stripe Portal

### 3.3 Update Payment Method
1. Click "Update payment method"
2. Enter test card: **4000 0025 0000 3155**
3. Complete update

### 3.4 Cancel Subscription
1. Click "Cancel subscription"
2. Confirm cancellation
3. Check webhook logs for:
   ```
   ⚠️  SUBSCRIPTION SCHEDULED FOR CANCELLATION
   cancel_at_period_end: true
   ```

### 3.5 Verify Database
```bash
npx supabase db execute "SELECT stripe_subscription_id, status, cancel_at_period_end FROM subscriptions;"
```

Expected: `cancel_at_period_end = true`, `status = 'active'`

## Success Criteria

✅ Portal accessible
✅ Payment method updates work
✅ Cancellation sets cancel_at_period_end flag
✅ Webhooks update database
✅ Subscription stays active until period ends

## Troubleshooting

**"No active subscription found"**
- Check subscription exists: `SELECT * FROM subscriptions;`
- Verify org_id matches your organization

**Portal redirect fails**
- Check STRIPE_SECRET_KEY in .env.local
- Verify customer exists in Stripe Dashboard

**Webhooks not received**
- Ensure Stripe CLI is running
- Check STRIPE_WEBHOOK_SECRET matches CLI output

## Next Steps

After testing:
1. Mark Task 1399 as completed ✅
2. Move to Task 1400: Build Pricing Page
3. Move to Task 1405: Create Billing Settings Page

See full documentation for production deployment and advanced testing scenarios.
