export const ACCESS_TOKEN = 'Access';

export const ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALLOWED_ROLES: string[] = [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.USER,
];
