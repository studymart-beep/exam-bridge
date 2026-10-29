"use server";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRpConfig } from "@/lib/passkeys/rp";
import { revalidatePath } from "next/cache";

type ActionOk = { success: true };
type ActionErr = { success: false; error: string };

async function storeChallenge(id: string, challenge: string) {
  const admin = createAdminClient();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await admin.from("passkey_challenges").upsert({
    id,
    challenge,
    expires_at: expires,
  });
}

async function consumeChallenge(id: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("passkey_challenges")
    .select("challenge, expires_at")
    .eq("id", id)
    .maybeSingle();
  await admin.from("passkey_challenges").delete().eq("id", id);
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
  return data.challenge as string;
}

function uint8ToBase64Url(buf: Uint8Array): string {
  let binary = "";
  buf.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8(s: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export async function listMyPasskeys(): Promise<
  { id: string; device_name: string | null; created_at: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_passkeys")
    .select("id, device_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data || []) as {
    id: string;
    device_name: string | null;
    created_at: string;
  }[];
}

export async function startPasskeyRegistration(): Promise<
  | { success: true; options: Awaited<ReturnType<typeof generateRegistrationOptions>> }
  | ActionErr
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { success: false, error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("user_passkeys")
    .select("credential_id")
    .eq("user_id", user.id);

  const { rpID, rpName } = getRpConfig();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userDisplayName:
      (user.user_metadata?.full_name as string | undefined) || user.email,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: (existing || []).map((row: { credential_id: string }) => ({
      id: row.credential_id,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });

  await storeChallenge(`reg:${user.id}`, options.challenge);
  return { success: true, options };
}

export async function finishPasskeyRegistration(
  response: RegistrationResponseJSON,
  deviceName?: string
): Promise<ActionOk | ActionErr> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const expectedChallenge = await consumeChallenge(`reg:${user.id}`);
  if (!expectedChallenge) {
    return { success: false, error: "Registration timed out. Try again." };
  }

  const { rpID, origin } = getRpConfig();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch {
    return { success: false, error: "Could not verify passkey." };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { success: false, error: "Passkey verification failed." };
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  const credentialID = credential.id;

  const publicKeyBytes =
    credential.publicKey instanceof Uint8Array
      ? credential.publicKey
      : new Uint8Array(credential.publicKey as ArrayBuffer);
  const publicKey = uint8ToBase64Url(publicKeyBytes);

  const name =
    (deviceName && deviceName.trim()) ||
    `${credentialDeviceType === "multiDevice" ? "Synced passkey" : "This device"}${
      credentialBackedUp ? " (backed up)" : ""
    }`;

  const { error } = await supabase.from("user_passkeys").insert({
    user_id: user.id,
    credential_id: credentialID,
    public_key: publicKey,
    counter: credential.counter ?? 0,
    transports: response.response.transports || null,
    device_name: name,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This passkey is already registered." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function deletePasskey(
  passkeyId: string
): Promise<ActionOk | ActionErr> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase
    .from("user_passkeys")
    .delete()
    .eq("id", passkeyId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/profile");
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function startPasskeyLogin(email: string): Promise<
  | {
      success: true;
      options: Awaited<ReturnType<typeof generateAuthenticationOptions>>;
    }
  | ActionErr
> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { success: false, error: "Enter your email first." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "No passkey found for this email." };
  }

  const { data: keys } = await admin
    .from("user_passkeys")
    .select("credential_id, transports")
    .eq("user_id", profile.id);

  if (!keys?.length) {
    return {
      success: false,
      error:
        "No biometric login set up for this account. Enable it in Profile after password login.",
    };
  }

  const { rpID } = getRpConfig();
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: keys.map(
      (k: { credential_id: string; transports: string[] | null }) => ({
        id: k.credential_id,
        transports: (k.transports || undefined) as
          | AuthenticatorTransportFuture[]
          | undefined,
      })
    ),
  });

  await storeChallenge(`auth:${normalized}`, options.challenge);
  return { success: true, options };
}

export async function finishPasskeyLogin(
  email: string,
  response: AuthenticationResponseJSON
): Promise<ActionOk | ActionErr | { success: true; redirectTo: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { success: false, error: "Email required." };

  const expectedChallenge = await consumeChallenge(`auth:${normalized}`);
  if (!expectedChallenge) {
    return { success: false, error: "Login timed out. Try again." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("email", normalized)
    .maybeSingle();

  if (!profile) return { success: false, error: "Account not found." };

  const credentialId = response.id;
  const { data: passkey } = await admin
    .from("user_passkeys")
    .select("*")
    .eq("user_id", profile.id)
    .eq("credential_id", credentialId)
    .maybeSingle();

  if (!passkey) {
    return { success: false, error: "Unknown passkey." };
  }

  const { rpID, origin } = getRpConfig();

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credential_id as string,
        publicKey: base64UrlToUint8(passkey.public_key as string),
        counter: Number(passkey.counter) || 0,
        transports: (passkey.transports || undefined) as
          | AuthenticatorTransportFuture[]
          | undefined,
      },
    });
  } catch {
    return { success: false, error: "Biometric verification failed." };
  }

  if (!verification.verified) {
    return { success: false, error: "Biometric verification failed." };
  }

  await admin
    .from("user_passkeys")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", passkey.id);

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
    });

  if (linkError || !linkData?.properties) {
    return {
      success: false,
      error: linkError?.message || "Could not start session.",
    };
  }

  const tokenHash = linkData.properties.hashed_token as string | undefined;
  if (!tokenHash) {
    return { success: false, error: "Could not start session." };
  }

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (otpError) {
    return { success: false, error: otpError.message };
  }

  const redirectTo =
    profile.role === "admin" ? "/admin/dashboard" : "/dashboard";
  return { success: true, redirectTo };
}
