import { QuotationsScreen } from '@/components/os/screens/Quotations';
import { QuotesLive } from '@/components/os/screens/LiveWork';
import { getQuotes } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

import { SalesTabs } from '@/components/os/SalesTabs';

export default async function Page() {
  const data = backendConfigured ? await getQuotes() : null;
  return <><SalesTabs />{data ? <QuotesLive {...data} /> : <QuotationsScreen />}</>;
}
