import { fetchAuthSession } from 'aws-amplify/auth';

export async function getAuthHeaders() {
  const { tokens } = await fetchAuthSession();
  if (!tokens) throw new Error('No authentication tokens found');
  return {
    Authorization: `Bearer ${tokens.idToken?.toString()}`,
    'Content-Type': 'application/json'
  }
}