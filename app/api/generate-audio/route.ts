import OpenAI from "openai";

import { adminDb } from "@/lib/firebase-admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = body.text;
    const voice = body.voice;
    const uid = body.uid;

    if (!uid) {
      return Response.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);

    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    const credits = userData?.credits || 0;

    if (credits < text.length) {
      return Response.json(
        { error: "Not enough credits" },
        { status: 400 }
      );
    }

    await userRef.update({
      credits: credits - text.length,
    });
await adminDb.collection("history").add({
  uid,
  text,
  voice,
  characters: text.length,
  createdAt: new Date(),
});
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
    });

    const buffer = Buffer.from(
      await mp3.arrayBuffer()
    );

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.log(error);

    return Response.json(
      {
        error: "Audio generation failed",
      },
      {
        status: 500,
      }
    );
  }
}