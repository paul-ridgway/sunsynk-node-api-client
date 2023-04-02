export interface RefreshTokenProvider {
  getRefreshToken(): string;
  setRefreshToken(refreshToken: string): void;
}

export class DefaultRefreshTokenProvider implements RefreshTokenProvider {
  private _refreshToken: string | undefined;

  getRefreshToken(): string {
    return this._refreshToken || '';
  }

  setRefreshToken(refreshToken: string): void {
    this._refreshToken = refreshToken;
  }
}