import { UserRole } from '../session/session.store';

export interface RegisterRequest {
  username?: string;
  password?: string;
  email?: string;
  role?: UserRole;
}
