import type { User } from '@prisma/client';

declare global {
    namespace App {
        interface Locals {
            user: Omit<User, 'password'> | null;
        }

        interface PageData {
            user?: Omit<User, 'password'> | null;
        }

        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
