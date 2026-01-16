import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the form data from the request
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "No image provided" },
        { status: 400 }
      );
    }

    // 2. Prepare data for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", imageFile);

    // 3. Upload to ImgBB using your SECURE server-side key
    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_HOST_KEY}`,
      {
        method: "POST",
        body: imgbbFormData,
      }
    );

    const imgbbData = await imgbbRes.json();

    if (!imgbbData.success) {
      return NextResponse.json(
        { success: false, message: "ImgBB upload failed" },
        { status: 500 }
      );
    }

    // 4. Return the display URL to the frontend
    return NextResponse.json({
      success: true,
      url: imgbbData.data.display_url,
    });
  } catch (error) {
    console.error("Backend Upload Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
