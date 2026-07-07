import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Admin client — uses service role key (server-side only, never exposed to browser)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the caller is logged in and is an admin
    const token = req.headers.get("Authorization");
    if (!token) throw new Error("Not authenticated.");

    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: token } } },
    );

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Not authenticated.");

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "admin") throw new Error("Not authorized.");

    // Parse request body
    const { name, email, credential_no, institution } = await req.json() as {
      name: string;
      email: string;
      credential_no: string;
      institution: string;
    };

    if (!name || !email || !credential_no || !institution) {
      throw new Error("All fields are required.");
    }

    // Create the nutritionist account (confirmed immediately)
    const { data: { user: newUser }, error: createErr } =
      await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, role: "nutritionist" },
      });

    if (createErr) throw createErr;
    if (!newUser) throw new Error("Failed to create user.");

    // Create their profile with role = nutritionist
    const { error: profileErr } = await adminClient.from("profiles").upsert({
      id:        newUser.id,
      name,
      age:       0,
      sex:       "female",
      weight_kg: 0,
      height_cm: 0,
      role:      "nutritionist",
    });
    if (profileErr) throw profileErr;

    // Record in applications table as admin-created + approved
    await adminClient.from("nutritionist_applications").insert({
      user_id:       newUser.id,
      full_name:     name,
      email,
      credential_no,
      institution,
      status:        "approved",
      reviewed_by:   caller.id,
      reviewed_at:   new Date().toISOString(),
    });

    // Send password-setup email so the nutritionist can log in
    await adminClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get("origin") ?? "https://nutrisense-seven-omega.vercel.app"}/reset-password`,
    });

    return new Response(
      JSON.stringify({ success: true, userId: newUser.id }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
