import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession } from "@/lib/auth";
import { mergeGuestCartToUser } from "@/lib/cart-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle user cancellation or errors
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=google_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/auth?error=missing_params`);
  }

  // Verify state
  const cookieStore = await cookies();
  const storedData = cookieStore.get("google_oauth_state")?.value;
  if (!storedData) {
    return NextResponse.redirect(`${origin}/auth?error=invalid_state`);
  }

  const { state: storedState, redirectTo } = JSON.parse(storedData);
  if (state !== storedState) {
    return NextResponse.redirect(`${origin}/auth?error=invalid_state`);
  }

  // Clean up the state cookie
  cookieStore.delete("google_oauth_state");

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Google token error:", await tokenRes.text());
      return NextResponse.redirect(`${origin}/auth?error=token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/auth?error=userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    const email = googleUser.email?.toLowerCase();
    const name = googleUser.name || email;
    const avatarUrl = googleUser.picture || null;

    if (!email) {
      return NextResponse.redirect(`${origin}/auth?error=no_email`);
    }

    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Create new user (no password for Google users)
      [user] = await db
        .insert(users)
        .values({
          email,
          name,
          avatarUrl,
          passwordHash: "__google_oauth__",
          role: "customer",
          loyaltyPoints: 0,
          memberSince: new Date().toISOString(),
        })
        .returning();
    } else {
      // Update avatar if user exists but doesn't have one
      if (!user.avatarUrl && avatarUrl) {
        await db
          .update(users)
          .set({ avatarUrl })
          .where(eq(users.id, user.id));
      }
    }

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Merge guest cart if exists
    const cartSessionId = cookieStore.get("cart_session")?.value;
    if (cartSessionId) {
      await mergeGuestCartToUser(user.id, cartSessionId);
    }

    // Redirect based on role
    if (user.role === "admin") {
      return NextResponse.redirect(`${origin}/admin`);
    }

    return NextResponse.redirect(`${origin}${redirectTo || "/"}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/auth?error=server_error`);
  }
}
