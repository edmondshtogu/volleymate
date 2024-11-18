import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { generateUserPlayer } from '@/lib/db';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (!session?.user) {
    return NextResponse.redirect('/api/auth/login');
  }

  const playerIdCookie = req.cookies.get('id');
  if (playerIdCookie && Number(playerIdCookie.value) > 0) {
    return res;
  }

  const user = session!.user;

  // Check if the player exists, if not, add them
  const playerId = await generateUserPlayer(user['sub'], user['name']);
  
  res.cookies.set('id', playerId.toString(), { path: '/' });
  req.cookies.set('id', playerId.toString());
  res.cookies.set('configured', 'false', { path: '/' });
  req.cookies.set('configured', 'false');
  
  return res;
});
