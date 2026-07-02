export const NOMBA_HTTP_CLIENT = Symbol('NOMBA_HTTP_CLIENT');
export const NOMBA_CONFIG = Symbol('NOMBA_CONFIG');

export interface NombaConfig {
  baseUrl: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
}
