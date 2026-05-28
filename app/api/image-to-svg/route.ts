import { NextResponse } from "next/server";

import sharp from "sharp";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get(
        "file"
      ) as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const enhanced =
      await sharp(buffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .flatten({
          background: "#ffffff",
        })
        .normalize()
        .sharpen({
          sigma: 1.5,
        })
        .modulate({
          brightness: 1.03,
          saturation: 1.08,
        })
        .png()
        .toBuffer();

    return new Response(
      enhanced as BodyInit,
      {
        headers: {
          "Content-Type":
            "image/png",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Enhancement failed",
      },
      {
        status: 500,
      }
    );
  }
}
