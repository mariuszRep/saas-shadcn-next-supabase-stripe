# Stripe Products & Pricing Setup Guide

This guide walks through creating products and prices in Stripe Dashboard for the pricing page.

## Overview

The pricing page displays three subscription tiers:
- **Starter**: $29/month
- **Professional**: $99/month (highlighted)
- **Enterprise**: $299/month

Each tier needs a Product and Price configured in Stripe Dashboard.

---

## Step 1: Access Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Ensure you're in **Test Mode** (toggle in top right)
3. Navigate to: **Products** → **Product catalog**
4. Or go directly to: https://dashboard.stripe.com/test/products

---

## Step 2: Create Starter Plan

### 2.1 Create Product

1. Click **"+ Add product"**
2. Fill in product details:
   - **Name:** Starter
   - **Description:** Perfect for individuals and small teams
   - **Image:** (optional) Upload product image

### 2.2 Add Pricing

1. **Pricing model:** Standard pricing
2. **Price:** $29.00
3. **Billing period:** Monthly
4. **Currency:** USD

### 2.3 Configure Settings

1. Click **"Additional options"** (optional)
   - **Statement descriptor:** Your company name (appears on credit card statements)
   - **Unit label:** seats (optional, for per-seat pricing)

2. Click **"Save product"**

### 2.4 Copy Price ID

1. After saving, you'll see the product page
2. Under **Pricing**, find the price you just created
3. Click on the price to see details
4. Copy the **Price ID** (starts with `price_`)
5. Example: `price_1OzH8XFVRukTbXHPQFj4KLmN`

### 2.5 Update Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
```

---

## Step 3: Create Professional Plan

### 3.1 Create Product

1. Click **"+ Add product"**
2. Fill in product details:
   - **Name:** Professional
   - **Description:** For growing teams that need more power
   - **Image:** (optional)

### 3.2 Add Pricing

1. **Pricing model:** Standard pricing
2. **Price:** $99.00
3. **Billing period:** Monthly
4. **Currency:** USD

### 3.3 Save & Copy Price ID

1. Click **"Save product"**
2. Copy the **Price ID** from the pricing section
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
```

---

## Step 4: Create Enterprise Plan

### 4.1 Create Product

1. Click **"+ Add product"**
2. Fill in product details:
   - **Name:** Enterprise
   - **Description:** For large organizations with custom needs
   - **Image:** (optional)

### 4.2 Add Pricing

1. **Pricing model:** Standard pricing
2. **Price:** $299.00
3. **Billing period:** Monthly
4. **Currency:** USD

### 4.3 Save & Copy Price ID

1. Click **"Save product"**
2. Copy the **Price ID**
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
```

---

## Step 5: Complete Environment Configuration

Your `.env.local` should now include:

```bash
# Existing Stripe configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Test price (for testing)
STRIPE_TEST_PRICE_ID=price_1Sb2BRFVRukTbXHPXcXkYDcx

# Production pricing (for pricing page)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
```

**Important:** Use `NEXT_PUBLIC_` prefix so these are available in the browser for the pricing page.

---

## Step 6: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The pricing page will now load the configured price IDs.

---

## Step 7: Test Pricing Page

### 7.1 View Pricing Page

1. Navigate to: http://localhost:3000/pricing
2. Verify all three plans display correctly
3. Check that prices show $29, $99, and $299
4. Verify "Professional" plan has "Most Popular" badge

### 7.2 Test Subscription Flow

1. **Without login:**
   - Click any "Start Free Trial" button
   - Should redirect to login page

2. **With login:**
   - Log in to your account
   - Return to pricing page
   - Click "Start Free Trial" on Starter plan
   - Should redirect to Stripe Checkout
   - Use test card: **4242 4242 4242 4242**
   - Complete checkout
   - Verify redirect to success page

3. **Verify in Database:**
```bash
npx supabase db execute "SELECT stripe_price_id, status FROM subscriptions;"
```

Expected: `stripe_price_id` matches the Starter price ID

---

## Step 8: Optional Enhancements

### 8.1 Add Product Metadata (Advanced)

You can add metadata to products for additional features:

1. In Stripe Dashboard, click on a product
2. Scroll to **"Metadata"** section
3. Add key-value pairs:
   - `tier`: `1` (for Starter), `2` (for Pro), `3` (for Enterprise)
   - `max_workspaces`: `5`, `unlimited`, `unlimited`
   - `max_storage_gb`: `10`, `100`, `unlimited`

This metadata can be retrieved via Stripe API for dynamic feature enforcement.

### 8.2 Add Free Trial Period

To add a 14-day free trial:

1. Edit the price in Stripe Dashboard
2. Scroll to **"Trial period"**
3. Enter **14 days**
4. Click **"Save"**

Now subscriptions will start with a 14-day trial automatically.

### 8.3 Add Setup Fee (One-time)

For one-time setup fees:

1. When creating/editing a price
2. Click **"Add another price"**
3. Select **"One time"**
4. Enter setup fee amount
5. This will be charged at subscription start

---

## Troubleshooting

### Issue: "Invalid price ID" error

**Possible causes:**
1. Price ID not set in .env.local
2. Environment variable has wrong name
3. Development server not restarted

**Fix:**
```bash
# Check .env.local has NEXT_PUBLIC_ prefix
echo $NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID

# Restart dev server
npm run dev
```

### Issue: Pricing page shows $0

**Possible causes:**
1. Price ID is empty string
2. Using STRIPE_TEST_PRICE_ID as fallback

**Fix:**
- Verify price IDs are configured in .env.local
- Check config/stripe.ts is reading correct env variables

### Issue: All plans have same price ID

**Possible causes:**
1. All environment variables point to same price
2. STRIPE_TEST_PRICE_ID used as fallback

**Fix:**
- Ensure each plan has unique price ID in .env.local
- Remove STRIPE_TEST_PRICE_ID from plan configuration

---

## Production Deployment

Before deploying to production:

### 1. Create Live Mode Products

1. Switch to **Live Mode** in Stripe Dashboard
2. Repeat Steps 2-4 to create products in Live Mode
3. Copy Live Mode price IDs

### 2. Update Production Environment Variables

In Vercel Dashboard (or your hosting provider):

```bash
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_LIVE_STARTER_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_LIVE_PRO_ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_LIVE_ENTERPRISE_ID
```

### 3. Update Stripe Keys

Ensure production uses Live Mode keys:

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### 4. Test in Production

1. Visit production pricing page
2. Complete a real subscription (will charge real money)
3. Verify subscription in Live Mode dashboard

---

## Success Criteria

✅ Three products created in Stripe Dashboard
✅ Each product has monthly pricing configured
✅ Price IDs copied and added to .env.local
✅ Pricing page displays all plans correctly
✅ Subscribe buttons create checkout sessions
✅ Checkout redirects to Stripe with correct price
✅ Subscriptions sync to database with correct price_id

---

## Next Steps

After completing setup:
1. Test complete subscription flow
2. Configure trial periods (optional)
3. Add annual billing options (future enhancement)
4. Implement plan comparison table (optional)
5. Add testimonials or social proof (optional)

---

## Useful Links

- [Stripe Products Docs](https://stripe.com/docs/products-prices/overview)
- [Stripe Pricing Models](https://stripe.com/docs/products-prices/pricing-models)
- [Managing Products](https://stripe.com/docs/products-prices/manage-products)
- [Testing Prices](https://stripe.com/docs/testing)
