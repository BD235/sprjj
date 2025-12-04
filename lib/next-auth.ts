import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-only-nextauth-secret" : undefined);

if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set. Please define it in your environment variables.");
}

async function ensureBaseRoles() {
  await Promise.all(
    (["OWNER", "PEGAWAI"] as const).map((name) =>
      prisma.role.upsert({
        where: { name },
        create: { name, status: "active" },
        update: {},
      }),
    ),
  );
}

async function getRoleIds() {
  await ensureBaseRoles();
  const [owner, pegawai] = await Promise.all([
    prisma.role.findUnique({ where: { name: "OWNER" } }),
    prisma.role.findUnique({ where: { name: "PEGAWAI" } }),
  ]);

  if (!owner || !pegawai) {
    throw new Error("Roles not initialized");
  }

  return { owner, pegawai };
}

export async function syncUserRoles(userId: string, currentRoles: string[]) {
  const { pegawai } = await getRoleIds();

  if (currentRoles.length === 0) {
    await prisma.userRole.create({
      data: { userId, roleId: pegawai.id },
    });
    return ["PEGAWAI"];
  }

  return currentRoles;
}

function extractRoleNames(
  userRoles:
    | {
      role: { name: string };
    }[]
    | undefined,
) {
  return userRoles?.map((entry) => entry.role.name) ?? [];
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          throw new Error("Email dan password wajib diisi");
        }

        const identifier = getClientIdentifier(req as Request);
        const rateLimitResult = consumeRateLimit({
          key: `login:${identifier}:${email}`,
          windowMs: 60_000,
          maxRequests: 5,
        });
        if (!rateLimitResult.success) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi dalam satu menit.");
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        });

        if (!existingUser) {
          throw new Error("INVALID_CREDENTIALS");
        }

        let userRecord = existingUser;

        if (!userRecord.password) {
          const hashedPassword = await bcrypt.hash(password, 12);
          userRecord = await prisma.user.update({
            where: { id: userRecord.id },
            data: { password: hashedPassword },
            include: { roles: { include: { role: true } } },
          });
        } else {
          const passwordValid = await bcrypt.compare(password, userRecord.password);
          if (!passwordValid) {
            throw new Error("INVALID_CREDENTIALS");
          }
        }

        const initialRoles = extractRoleNames(userRecord.roles);
        const roles = await syncUserRoles(userRecord.id, initialRoles);

        return {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          roles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userIdDb = user.id;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUserId = (token.userIdDb as string) ?? (token.sub as string) ?? session.user.id;
        session.user.id = dbUserId;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;

        if (dbUserId) {
          const latestUser = await prisma.user.findUnique({
            where: { id: dbUserId },
            select: { name: true, email: true },
          });
          if (latestUser) {
            session.user.name = latestUser.name ?? session.user.name;
            session.user.email = latestUser.email ?? session.user.email;
          }
        }

        session.user.claims = {
          roles: (token.roles as string[]) ?? [],
          userIdDb: (token.userIdDb as string) ?? dbUserId,
        };
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
