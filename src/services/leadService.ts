import { leadsService } from './leads';
import type { LeadCreate } from './leads';

export async function sendLead(formData: LeadCreate) {
  try {
    const result = await leadsService.submitLead(formData);
    return result;
  } catch (error) {
    console.error('Lead service error:', error);
    throw new Error('Failed to send lead');
  }
}
