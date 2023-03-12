export class AuthenticationError extends Error {
  constructor(message: string, public readonly code: number) {
    super(message);
    this.name = 'AuthenticationError';
  }
}