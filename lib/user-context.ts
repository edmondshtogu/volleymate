import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {UserContext} from "@/lib/models";

// Base64 encoding/decoding utility
function base64Encode(value: any): string {
    return Buffer.from(JSON.stringify(value)).toString('base64');
}

function base64Decode<T = any>(value: string): T | null {
    try {
        return JSON.parse(Buffer.from(value, 'base64').toString());
    } catch {
        return null;
    }
}

// Read state from cookies
export async function getUserContextFromCookies(): Promise<UserContext | null> {
    const cookieStore = await cookies();
    const stateCookie = cookieStore.get('_uc');
    if (!stateCookie) return null;
    return base64Decode<UserContext>(stateCookie.value);
}

export function getUserContextFromRequest(req: NextRequest): UserContext | null {
    const stateCookie = req.cookies.get('_uc');
    if (!stateCookie) return null;
    return base64Decode<UserContext>(stateCookie.value);
}

// Set state cookie
export function setUserContextInRequest(
    req: NextRequest,
    state: UserContext
): void {
    const encodedState = base64Encode(state);
    req.cookies.set('_uc', encodedState);
}

export function setUserContextInResponse(
    res: NextResponse,
    state: UserContext
): void {
    const encodedState = base64Encode(state);
    res.cookies.set('_uc', encodedState, { path: '/', httpOnly: true, maxAge: 7 * 24 * 60 * 60 });
}

export async function userHasAdminRole(userId: string): Promise<boolean> {
    const tokenResponse = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
                grant_type: "client_credentials",
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
            }),
        }
    );

    const { access_token } = await tokenResponse.json();

    const adminUsersResponse = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/roles/rol_wXoAaU8cPWt3tfyl/users`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    const adminUsers: Array<{
        user_id: string
    }> = await adminUsersResponse.json();
    
    const filtered = adminUsers.filter(user => user.user_id === userId);

    return filtered.length === 1;
}

