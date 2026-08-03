import { PrismaClient } from '@prisma/client';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';

// Authentication hook to handle session management
const auth: Handle = async ({ event, resolve }) => {
  // DEMO MODE: Set this to true to automatically use user1 when no session exists
  const DEMO_MODE = true;

  // 1. Normal authentication flow (check cookie first)
  const cookies = cookie.parse(event.request.headers.get('cookie') || '');
  const token = cookies.session;

  event.locals.user = null;

  if (token) {
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
        // Fetch the user from the database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId as string }
        });

        if (user) {
          // Don't expose the password in the session
          const { password, ...userWithoutPassword } = user;
          event.locals.user = userWithoutPassword;
        }
      }
    } catch (err) {
      // Token is invalid or expired
      console.error('Session token validation failed:', err);
    }
  }

  // 2. Demo fallback (if no cookie-based user is logged in)
  if (!event.locals.user && DEMO_MODE) {
    try {
      // Find user1 in the database (Landlord)
      const demoUser = await prisma.user.findFirst({
        where: { name: 'User One' }
      });

      if (demoUser) {
        // Don't expose the password in the session
        const { password, ...userWithoutPassword } = demoUser;
        event.locals.user = userWithoutPassword;
      } else {
        console.warn('Demo user "User One" not found in database');
      }
    } catch (err) {
      console.error('Error finding demo user:', err);
    }
  }

  // Protected routes handling
  const landlordRoutes = ['/landlord'];
  const tenantRoutes = ['/tenant'];

  const pathname = event.url.pathname;

  if (landlordRoutes.some(route => pathname.startsWith(route))) {
    if (!event.locals.user) {
      throw redirect(303, '/login');
    }
    if (event.locals.user.role !== 'LANDLORD') {
      throw redirect(303, '/tenant');
    }
  }

  if (tenantRoutes.some(route => pathname.startsWith(route))) {
    if (!event.locals.user) {
      throw redirect(303, '/login');
    }
    if (event.locals.user.role !== 'TENANT') {
      throw redirect(303, '/landlord');
    }
  }

  return resolve(event);
};

// Log requests for debugging
const logger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const response = await resolve(event);
  const end = Date.now();
  console.log(`${event.request.method} ${event.url.pathname} - ${response.status} in ${end - start}ms`);
  return response;
};

// Export the combined handlers
export const handle = sequence(auth, logger);