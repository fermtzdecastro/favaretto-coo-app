import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Usuario } from "@/types";

export async function getSessionUser(): Promise<Usuario | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil, error } = await supabase
    .from("usuarios")
    .select("id, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (error || !perfil) return null;

  return {
    id: perfil.id,
    email: perfil.email,
    role: String(perfil.role),
    created_at: perfil.created_at,
  };
}

export async function requireAuth(): Promise<Usuario> {
  const usuario = await getSessionUser();
  if (!usuario) redirect("/login");
  return usuario;
}
