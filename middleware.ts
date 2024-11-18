import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { generateUserPlayer } from '@/lib/db';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (!session?.user) {
    return NextResponse.redirect('/api/auth/login');
  }

  const playerIdCookie = req.cookies.get('player_id');
  if (playerIdCookie && Number(playerIdCookie.value) > 0) {
    return res;
  }

  const user = session!.user;

  // Check if the player exists, if not, add them
  const playerId = await generateUserPlayer(user['sub'], user['name']);
  
  res.cookies.set('player_id', playerId.toString(), { path: '/' });
  req.cookies.set('player_id', playerId.toString());
  res.cookies.set('player_configured', 'false', { path: '/' });
  req.cookies.set('player_configured', 'false');
  
  return res;
});
