"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "./supabase";
import bcrypt from "bcryptjs";



if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable. Please set it in .env.local");
}

const JWT_SECRET = process.env.JWT_SECRET;
const key = new TextEncoder().encode(JWT_SECRET);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return (await decrypt(session)) as unknown as SessionUser;
}

export async function verifyAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access. Admin role required.");
  }
  return user;
}

async function verifyCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("Missing HCAPTCHA_SECRET_KEY environment variable.");
    return false;
  }

  const payload = new URLSearchParams({ secret, response: token });
  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString()
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error("hCaptcha fetch error:", e);
    return false;
  }
}

export async function register(firstName: string, lastName: string, email: string, password: string, captchaToken: string) {
  try {
    if (!captchaToken) {
      return { error: "Please complete the captcha." };
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return { error: "Bot verification failed." };
    }
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Supabase check user error:", checkError);
      return { error: "Failed to verify existing users." };
    }

    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        role: "student",
      }])
      .select()
      .maybeSingle();

    if (error || !newUser) {
      console.error("Supabase insert error:", error);
      return { error: error?.message || "Failed to create user account or fetch created user." };
    }

    const sessionData = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
    };

    const token = await encrypt(sessionData);
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return sessionData;
  } catch (err: any) {
    console.error("Register catch error:", err);
    return { error: "Internal server error during registration." };
  }
}

export async function login(email: string, password: string, captchaToken: string) {
  try {
    if (!captchaToken) {
      return { error: "Please complete the captcha." };
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return { error: "Bot verification failed." };
    }

    console.log(`Attempting login for email: ${email}`);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", error);
      return { error: "Database error occurred." };
    }

    if (!user) {
      console.log(`User object is completely null for ${email}`);
      return { error: "Invalid email or password." };
    }

    if (!user.password_hash) {
      console.error("The matched user document does not contain a password_hash property. Make sure table columns map correctly.");
      return { error: "Internal database configuration error." };
    }

    try {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        console.log("Password hash comparison failed.");
        return { error: "Invalid email or password." };
      }
    } catch (bcryptError) {
      console.error("Bcrypt compare exception. Likely invalid hash format:", bcryptError);
      return { error: "Internal system error validating credentials." };
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    const token = await encrypt(sessionData);
    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    console.log(`User ${email} login successful. Returning session data.`);
    return sessionData;
  } catch (err: any) {
    console.error("Unhandled exception in login flow:", err);
    return { error: "Internal server error processing login." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
