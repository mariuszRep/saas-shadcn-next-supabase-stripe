import { createServiceRoleClient } from './lib/supabase/server'

async function checkSubscriptions() {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error querying subscriptions:', error)
    return
  }

  console.log('Recent subscriptions:')
  console.table(data)
}

checkSubscriptions()
