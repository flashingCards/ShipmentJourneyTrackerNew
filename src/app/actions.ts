'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function refreshData() {
  revalidateTag('shipments');
}
