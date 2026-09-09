export const ACCESS_TOKEN = 'Access';

export const ROLES = {
    ROOT: 'ROOT',
    ADMIN: 'ADMIN',
    WRITE: 'WRITE',
    READ: 'READ',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALLOWED_ROLES: string[] = [
    ROLES.ROOT,
    ROLES.ADMIN,
    ROLES.WRITE,
    ROLES.READ,
];
