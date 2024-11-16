import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { db, players } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (!session?.user) {
    return NextResponse.redirect('/api/auth/login');
  }

  const playerId = req.cookies.get('id');
  if (playerId && Number(playerId.value) > 0) {
    return res;
  }

  const user = session!.user;

  // Check if the player exists, if not, add them
  let player = await db
    .select()
    .from(players)
    .where(eq(players.userId, user['sub']))
    .limit(1);

  if (player.length === 0) {
    const newPlayer = {
      userId: user['sub'],
      name: user['name'],
      configured: false
    };
    const result = await db.insert(players).values(newPlayer).returning();
    player = result;
  }
  res.cookies.set('id', player[0].id.toString(), { path: '/' });
  req.cookies.set('id', player[0].id.toString());
  res.cookies.set('configured', player[0].configured.toString(), { path: '/' });
  req.cookies.set('configured', player[0].configured.toString());
  
  return res;
});
