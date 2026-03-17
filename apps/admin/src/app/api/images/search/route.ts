import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

// Unsplash 이미지 검색 결과 타입
interface ImageResult {
  id: string;
  url: string;
  thumbUrl: string;
  author: string;
  authorUrl: string;
  alt: string;
  downloadUrl: string;
}

// Unsplash 이미지 검색 API
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const perPage = parseInt(searchParams.get("perPage") || "6", 10);

    if (!query) {
      return NextResponse.json(
        { error: "검색 키워드는 필수입니다" },
        { status: 400 }
      );
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    // Unsplash API 키가 있으면 Unsplash 사용
    if (accessKey) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Unsplash API 오류:", await response.text());
        // Unsplash 실패 시 picsum 폴백
        return NextResponse.json({
          success: true,
          images: generatePicsumFallback(query, perPage),
          source: "picsum",
        });
      }

      const data = await response.json();
      const images: ImageResult[] = data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.small,
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        alt: photo.alt_description || query,
        downloadUrl: photo.links.download,
      }));

      return NextResponse.json({
        success: true,
        images,
        source: "unsplash",
      });
    }

    // API 키 없으면 picsum.photos 폴백
    return NextResponse.json({
      success: true,
      images: generatePicsumFallback(query, perPage),
      source: "picsum",
    });
  } catch (error) {
    console.error("이미지 검색 실패:", error);
    return NextResponse.json(
      { error: "이미지 검색 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// picsum.photos 폴백 이미지 생성
function generatePicsumFallback(query: string, count: number): ImageResult[] {
  const images: ImageResult[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${query}-${i}-${Date.now()}`;
    images.push({
      id: `picsum-${i}`,
      url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`,
      thumbUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`,
      author: "Picsum Photos",
      authorUrl: "https://picsum.photos",
      alt: query,
      downloadUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`,
    });
  }
  return images;
}
