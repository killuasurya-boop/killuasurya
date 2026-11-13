import { CrmScreen } from '@/components/os/screens/Crm';
import { LeadsLive } from '@/components/os/screens/Live';
import { getLeads } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

import { SalesTabs } from '@/components/os/SalesTabs';

export default async function Page() {
  const data = backendConfigured ? await getLeads() : null;
  return <><SalesTabs />{data ? <LeadsLive {...data} /> : <CrmScreen />}</>;
}
