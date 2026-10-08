export type ApiUser = {
  id: string;
  displayName: string;
  email: string;
};

export type ApiAuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: ApiUser;
};

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
