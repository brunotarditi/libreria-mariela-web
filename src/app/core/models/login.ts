export interface Login {
  email: string | null
  password: string | null
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}