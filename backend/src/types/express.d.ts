import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      name: string;
    }
    interface Request {
      user?: User;
    }
  }
}
