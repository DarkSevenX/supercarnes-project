import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;

  // Generate a random state to prevent CSRF
  const state = crypto.randomUUID();
  
  // Store state and redirect in a cookie
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", JSON.stringify({ state, redirectTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authUrl.toString());
}
