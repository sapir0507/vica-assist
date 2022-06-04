import { EntityState, ActiveState } from '@datorama/akita';

export interface RegisterRequest extends EntityState<Register, number>, ActiveState<number> {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
}

export interface Register extends EntityState<Register, number>, ActiveState<number> {
  id?: number | string;
  username?: string;
  password?: string;
  email?: string;
  role?: string;
}

export function createRegister(params: Partial<Register>) {
  return {
    id: params.id,
    username: params.username,
    password: params.password,
    email: params.email,
    role: params.role
  } as Register;
}
