import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("users")
      .limit(1)
      .get();

    return NextResponse.json({
      success: true,
      usersFound: snapshot.size,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "Admin SDK failed",
    });
  }
}