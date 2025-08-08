import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaSingleton";

// Edit this endpoint according to your need
export default async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    if (!body.email || !body.username || !body.password) {
      return NextResponse.json(
        {
          error: "Incomplete credentials provided!",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists!",
        },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
        provider: "CREDENTIALS",
      },
    });

    return NextResponse.json({ message: "Signed up succesfully", user });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
