import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, university, major, role } = body;

    // Security Check: Public registration is strictly for STUDENT accounts.
    if (role && role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Teacher and Administrator accounts cannot be self-registered. Faculty access must be authorized and provisioned by an institution administrator.",
        },
        { status: 403 }
      );
    }

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Derive a unique username base
    let baseUsername = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    if (!baseUsername) baseUsername = "student";
    let usernameCandidate = baseUsername;
    let counter = 1;

    while (await prisma.user.findUnique({ where: { username: usernameCandidate } })) {
      usernameCandidate = `${baseUsername}${counter}`;
      counter++;
    }

    // Role is strictly forced to STUDENT (prevents privilege escalation)
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        hashedPassword,
        username: usernameCandidate,
        role: "STUDENT",
        university: university?.trim() || "Campus College",
        major: major?.trim() || "Undeclared",
        bio: "",
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        university: true,
        major: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully.", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

