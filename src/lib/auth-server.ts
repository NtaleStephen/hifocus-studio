import { createClient } from "@supabase/supabase-js";
import prisma from "./prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export async function getUserAndSync(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const authUser = data.user;

  // Sync user to Prisma
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email: authUser.email ?? "",
    },
    update: {
      email: authUser.email ?? "",
    },
  });

  return { authUser, user };
}
