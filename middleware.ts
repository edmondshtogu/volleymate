import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { generateUserPlayer } from '@/lib/db';
import {
  getUserContextFromRequest,
  setUserContextInRequest,
  setUserContextInResponse,
  userHasAdminRole
} from "@/lib/user-context";

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (!session?.user) {
    return NextResponse.redirect('/api/auth/login');
  }

  const user = session!.user;

  // Read the state from the request
  let contextFromRequest = getUserContextFromRequest(req);

  if (contextFromRequest && contextFromRequest.playerId > 0) {
    return res; // State already exists, proceed
  }

  // Generate new player_id and check admin roles
  const [playerId, isConfigured] = await generateUserPlayer(user['sub'], user['name']);
  const isAdmin = await userHasAdminRole(user['sub']);

  // Create new state
  contextFromRequest = {
    playerId,
    isConfigured,
    isAdmin,
  };

  // Save the state in cookies
  setUserContextInResponse(res, contextFromRequest);
  setUserContextInRequest(req, contextFromRequest);
  
  return res;
});
