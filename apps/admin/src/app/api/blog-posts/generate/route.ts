import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// AI 블로그 글 생성 API (다중 제공자 지원)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { topic, keywords, tone, category, providerId, autoTopic } = body;

    // 기존 발행된 글 조회 (중복 방지용 + autoTopic용)
    const existingPosts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { title: true, category: true, tags: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const existingTitles = existingPosts.map((p) => p.title).join("\n- ");

    // autoTopic 모드: 주제/키워드 자동 선정
    if (autoTopic || (!topic && !keywords)) {
      const autoTopics = [
        { topic: "베트남 다낭 골프 여행", keywords: "다낭골프,베트남골프,다낭골프장" },
        { topic: "태국 파타야 골프 여행", keywords: "파타야골프,태국골프,파타야골프장" },
        { topic: "필리핀 클락 골프 여행", keywords: "필리핀골프,클락골프,클락골프장" },
        { topic: "일본 오키나와 골프 여행", keywords: "오키나와골프,일본골프,오키나와골프장" },
        { topic: "제주도 골프 여행 가이드", keywords: "제주골프,제주도골프,제주골프장" },
        { topic: "호주 골드코스트 골프 여행", keywords: "호주골프,골드코스트골프" },
        { topic: "미국 하와이 골프 여행", keywords: "하와이골프,미국골프,하와이골프장" },
        { topic: "말레이시아 쿠알라룸푸르 골프", keywords: "말레이시아골프,쿠알라룸푸르골프" },
        { topic: "인도네시아 발리 골프 여행", keywords: "발리골프,인도네시아골프" },
        { topic: "캄보디아 씨엠립 골프 여행", keywords: "캄보디아골프,씨엠립골프" },
        { topic: "골프 여행 준비물 완벽 가이드", keywords: "골프여행준비물,골프여행짐" },
        { topic: "해외 골프장 그린피 비교", keywords: "해외그린피,골프장비용비교" },
        { topic: "골프 여행 보험 선택 가이드", keywords: "골프보험,골프여행보험" },
        { topic: "초보자를 위한 골프 여행 팁", keywords: "골프초보여행,골프여행팁" },
        { topic: "시니어 골프 여행 추천지", keywords: "시니어골프,시니어골프여행" },
      ];

      // 기존 글 제목에 없는 주제 필터링
      const existingTitleSet = existingPosts.map((p) => p.title.toLowerCase());
      const available = autoTopics.filter(
        (t) => !existingTitleSet.some((et) => et.includes(t.topic.substring(0, 6).toLowerCase()))
      );

      if (available.length === 0) {
        // 모든 주제가 소진되면 랜덤 선택
        const random = autoTopics[Math.floor(Math.random() * autoTopics.length)];
        topic = random.topic;
        keywords = random.keywords;
      } else {
        const picked = available[Math.floor(Math.random() * available.length)];
        topic = picked.topic;
        keywords = picked.keywords;
      }
    }

    if (!topic || !keywords) {
      return NextResponse.json(
        { error: "주제와 키워드는 필수입니다" },
        { status: 400 }
      );
    }

    // AI 제공자 결정
    let provider = null;
    if (providerId) {
      provider = await prisma.aIProvider.findUnique({
        where: { id: providerId },
      });
    } else {
      // 기본 제공자 찾기
      provider = await prisma.aIProvider.findFirst({
        where: { isDefault: true, isActive: true },
      });
    }

    // 제공자가 없으면 환경변수 OPENAI_API_KEY 폴백
    let aiResponse: NextResponse;

    if (!provider) {
      const envApiKey = process.env.OPENAI_API_KEY;
      if (!envApiKey) {
        // 데모 모드
        const demoResult = generateDemoContent(topic, keywords, tone, category);
        aiResponse = NextResponse.json({ success: true, ...demoResult });
      } else {
        // 환경변수 기반 OpenAI 호출
        aiResponse = await callOpenAI(envApiKey, "gpt-4o-mini", topic, keywords, tone, category, existingTitles);
      }
    } else {
      // 제공자별 API 호출
      const apiKey = provider.apiKey;
      const model = provider.model;

      if (provider.provider === "openai") {
        if (!apiKey) {
          return NextResponse.json(
            { error: "OpenAI API 키가 설정되지 않았습니다" },
            { status: 400 }
          );
        }
        aiResponse = await callOpenAI(apiKey, model || "gpt-4o-mini", topic, keywords, tone, category, existingTitles);
      } else if (provider.provider === "anthropic") {
        if (!apiKey) {
          return NextResponse.json(
            { error: "Anthropic API 키가 설정되지 않았습니다" },
            { status: 400 }
          );
        }
        aiResponse = await callAnthropic(apiKey, model || "claude-sonnet-4-20250514", topic, keywords, tone, category, existingTitles);
      } else if (provider.provider === "google") {
        aiResponse = await callGoogle(provider, model || "gemini-2.0-flash", topic, keywords, tone, category, existingTitles);
      } else if (provider.provider === "zhipu") {
        aiResponse = await callZhipu(provider, model || "glm-5", topic, keywords, tone, category, existingTitles);
      } else if (provider.provider === "xai") {
        if (!apiKey) {
          return NextResponse.json(
            { error: "x.ai API 키가 설정되지 않았습니다" },
            { status: 400 }
          );
        }
        aiResponse = await callXAI(apiKey, model || "grok-3-mini", topic, keywords, tone, category, existingTitles);
      } else if (provider.provider === "openrouter") {
        if (!apiKey) {
          return NextResponse.json(
            { error: "OpenRouter API 키가 설정되지 않았습니다" },
            { status: 400 }
          );
        }
        aiResponse = await callOpenRouter(apiKey, model || "google/gemini-2.5-flash", topic, keywords, tone, category, existingTitles);
      } else {
        return NextResponse.json(
          { error: `지원하지 않는 AI 제공자입니다: ${provider.provider}` },
          { status: 400 }
        );
      }
    }

    // 성공 응답이면 썸네일 자동 검색 추가
    const responseData = await aiResponse.json();
    if (responseData.success && !responseData.thumbnail) {
      const mainKeyword = keywords.split(",")[0]?.trim() || topic;
      const thumbnail = await fetchThumbnail(mainKeyword + " golf travel", provider?.provider);
      responseData.thumbnail = thumbnail;
    }
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("AI 글 생성 실패:", error);
    return NextResponse.json(
      { error: `AI 글 생성 중 오류: ${error?.message || "알 수 없는 오류"}` },
      { status: 500 }
    );
  }
}

// === 공통 프롬프트 ===

function buildPrompts(topic: string, keywords: string, tone: string, category?: string, existingTitles?: string) {
  const toneMap: Record<string, string> = {
    professional: "전문적이고 신뢰감 있는 톤",
    friendly: "친근하고 따뜻한 톤",
    casual: "캐주얼하고 가벼운 톤",
  };
  const toneDesc = toneMap[tone] || toneMap.professional;

  const systemPrompt = `당신은 보령항공여행사의 골프 여행 블로그 전문 작가입니다.
SEO 최적화된 한국어 블로그 글을 구조화된 JSON 섹션 형식으로 작성합니다.

[중복 방지]
- 매번 다른 관점, 다른 도입부, 다른 비유를 사용하세요
- 같은 주제라도 시즌, 날씨, 여행 스타일 등 다른 각도에서 접근하세요
- 이전에 작성된 글과 겹치지 않도록 독창적인 표현을 사용하세요
${existingTitles ? `\n[중복 방지 - 기존 게시글]\n아래는 이미 작성된 글 제목 목록입니다. 이 제목들과 겹치지 않는 새로운 제목과 내용을 작성하세요:\n- ${existingTitles}` : ""}

[글쓰기 스타일]
- 짧은 문장으로 끊어 쓰기 (한 문장이 30자를 넘지 않게)
- 여러 문단은 \\n\\n으로 구분하세요
- 대화하듯 친근하고 신뢰감 있는 톤
- "~인데요,", "~합니다.", "~하시나요?", "~보세요." 등 자연스러운 어미
- 구체적 숫자와 정보 활용 (거리, 시간, 가격, 기온 등)

[SEO 규칙]
- 제목 60자 이내, 주요 키워드 포함
- 발췌문 150자 이내
- 각 content 섹션 본문 300~600자
- 메인 키워드를 자연스럽게 5~8회 반복

[섹션 타입 안내]
- "intro": 도입부. 인사 + 주제 소개 + 보령항공여행사 언급. text 필드만 사용.
- "content": 일반 본문 섹션. heading(소제목), text(본문, \\n\\n으로 문단 구분), imageKeyword(이미지 검색 키워드) 필드 사용.
- "highlight": 핵심 정보 강조 박스. heading, text 필드 사용. 가장 중요한 팁이나 주의사항에 사용.
- "tips": 팁 목록 섹션. heading, items(문자열 배열) 필드 사용. 체크리스트나 준비물 등에 적합.
- "cta": 마무리 행동 유도. heading, text 필드 사용. 보령항공여행사 문의/예약 유도로 마무리.

[본문 구성 - 최소 5개 섹션, 최대 7개 섹션]
1. intro 섹션 1개 (도입부)
2. content 섹션 3개 이상 (각 섹션에 imageKeyword 포함)
3. highlight 또는 tips 섹션 1개 (핵심 강조)
4. cta 섹션 1개 (마무리)

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "title": "SEO 최적화 제목",
  "excerpt": "메타 디스크립션 150자 이내",
  "category": "추천 카테고리",
  "tags": ["태그1", "태그2"],
  "sections": [
    { "type": "intro", "text": "도입부 텍스트 (인사 + 주제 소개)" },
    { "type": "content", "heading": "섹션 제목", "text": "본문 내용 (여러 문단은 \\n\\n으로 구분)", "imageKeyword": "이미지 검색 키워드" },
    { "type": "highlight", "heading": "강조 제목", "text": "강조할 핵심 정보" },
    { "type": "tips", "heading": "팁 제목", "items": ["팁1", "팁2", "팁3"] },
    { "type": "cta", "heading": "CTA 제목", "text": "문의/예약 유도 텍스트" }
  ]
}`;

  const userPrompt = `주제: ${topic}
키워드: ${keywords}
톤: ${toneDesc}
${category ? `카테고리: ${category}` : "카테고리: 자동 추천"}

위 정보를 바탕으로 네이버 블로그 스타일의 SEO 최적화된 골프 여행 블로그 글을 작성해주세요.`;

  return { systemPrompt, userPrompt };
}

// JSON 파싱 헬퍼
function parseAIResponse(content: string) {
  const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(jsonStr);
}

// 이미지 마커를 실제 picsum 이미지 태그로 교체
function replaceImageMarkers(html: string): string {
  let imageIndex = 0;
  return html.replace(/<!-- IMAGE:\s*(.+?)\s*-->/g, (_match, keyword: string) => {
    imageIndex++;
    const alt = keyword.trim();
    return `<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=${imageIndex}" alt="${alt}" style="width:100%;max-width:720px;border-radius:12px;" /></div>`;
  });
}

// 섹션의 imageKeyword로 Unsplash 또는 picsum 이미지 URL을 조회
async function resolveImageForSection(keyword: string): Promise<{ image: string; imageAlt: string }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]) {
          return { image: data.results[0].urls.regular, imageAlt: keyword };
        }
      }
    } catch {
      // Unsplash 실패 시 picsum 폴백
    }
  }
  // picsum 폴백 (키워드 + 타임스탬프로 시드 생성)
  const seed = `${keyword}-${Date.now()}`;
  return { image: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`, imageAlt: keyword };
}

// AI 응답 결과에 이미지 처리를 적용 (레거시 HTML 마커 + 신규 섹션 방식 모두 지원)
async function processAIResult(result: Record<string, unknown>): Promise<Record<string, unknown>> {
  // 레거시: HTML content 문자열의 이미지 마커 교체
  if (typeof result.content === "string") {
    result.content = replaceImageMarkers(result.content);
  }
  // 신규: sections 배열의 imageKeyword를 실제 이미지 URL로 교체
  if (Array.isArray(result.sections)) {
    for (const section of result.sections) {
      if (section.imageKeyword) {
        const { image, imageAlt } = await resolveImageForSection(section.imageKeyword);
        section.image = image;
        section.imageAlt = imageAlt;
        delete section.imageKeyword;
      }
    }
  }
  return result;
}

// 썸네일 자동 생성 (선택된 제공자 우선 → 폴백)
async function fetchThumbnail(keyword: string, providerType?: string): Promise<string> {
  const imagePrompt = `A beautiful, professional travel blog thumbnail photo for: "${keyword}". Style: bright, vibrant, high-quality travel photography with warm lighting. No text or watermarks.`;

  // 1. Google Imagen 시도 (Google provider 선택 시 우선)
  if (providerType === "google" || !providerType) {
    const googleKey = await getGoogleKey();
    if (googleKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${googleKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: imagePrompt,
              config: { numberOfImages: 1 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          // Imagen은 base64 이미지를 반환 → data URL로 변환
          const imageData = data.generatedImages?.[0]?.image?.imageBytes;
          if (imageData) {
            return `data:image/png;base64,${imageData}`;
          }
        } else {
          console.error("Google Imagen 오류:", await res.text().catch(() => ""));
        }
      } catch {
        // Imagen 실패 시 다음 폴백
      }
    }
  }

  // 2. DALL-E 시도 (OpenAI provider 선택 시 우선, 또는 Google 실패 시 폴백)
  const openaiKey = await getOpenAIKey();
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1792x1024",
          quality: "standard",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) {
          return data.data[0].url;
        }
      }
    } catch {
      // DALL-E 실패 시 다음 폴백
    }
  }

  // 3. Unsplash 검색 폴백
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]) {
          return data.results[0].urls.regular;
        }
      }
    } catch {
      // Unsplash 실패 시 폴백
    }
  }

  // 4. picsum 폴백
  const seed = `${keyword}-${Date.now()}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;
}

// Google API 키 가져오기
async function getGoogleKey(): Promise<string | null> {
  try {
    const googleProvider = await prisma.aIProvider.findFirst({
      where: { provider: "google", isActive: true, authType: "apikey" },
      select: { apiKey: true },
    });
    return googleProvider?.apiKey || null;
  } catch {
    return null;
  }
}

// OpenAI API 키 가져오기
async function getOpenAIKey(): Promise<string | null> {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const openaiProvider = await prisma.aIProvider.findFirst({
      where: { provider: "openai", isActive: true },
      select: { apiKey: true },
    });
    return openaiProvider?.apiKey || null;
  } catch {
    return null;
  }
}

// === OpenAI 호출 ===

async function callOpenAI(
  apiKey: string,
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("OpenAI API 오류:", errorData);
    return NextResponse.json(
      { error: "AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("OpenAI 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === Anthropic (Claude) 호출 ===

async function callAnthropic(
  apiKey: string,
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Anthropic API 오류:", errorData);
    return NextResponse.json(
      { error: "AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("Anthropic 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === Google (Gemini) 호출 ===

async function callGoogle(
  provider: { apiKey: string | null; authType: string; oauthData: any },
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  let url: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (provider.authType === "oauth" && provider.oauthData) {
    // OAuth 토큰 사용
    const oauthData = provider.oauthData as { access_token: string };
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    headers["Authorization"] = `Bearer ${oauthData.access_token}`;
  } else if (provider.apiKey) {
    // API 키 사용
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`;
  } else {
    return NextResponse.json(
      { error: "Google API 키 또는 OAuth 인증이 필요합니다" },
      { status: 400 }
    );
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Google API 오류:", JSON.stringify(errorData, null, 2));
    const errorMessage = errorData?.error?.message || errorData?.error?.status || JSON.stringify(errorData);
    return NextResponse.json(
      { error: `Google API 오류: ${errorMessage}` },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("Google 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === x.ai (Grok) 호출 ===

async function callXAI(
  apiKey: string,
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("x.ai API 오류:", errorData);
    return NextResponse.json(
      { error: "AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("x.ai 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === OpenRouter 호출 (OpenAI 호환 API) ===

async function callOpenRouter(
  apiKey: string,
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://boryoung.co.kr",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("OpenRouter API 오류:", errorData);
    const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
    return NextResponse.json(
      { error: `OpenRouter API 오류: ${errorMessage}` },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("OpenRouter 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === ZHIPU AI (GLM) 호출 ===

async function callZhipu(
  provider: { apiKey: string | null; authType: string; oauthData: any },
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string,
  existingTitles?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category, existingTitles);

  // API 키 또는 OAuth 토큰 결정
  let apiKey: string;
  if (provider.authType === "oauth" && provider.oauthData) {
    const oauthData = provider.oauthData as { access_token: string };
    apiKey = oauthData.access_token;
  } else if (provider.apiKey) {
    apiKey = provider.apiKey;
  } else {
    return NextResponse.json(
      { error: "ZHIPU API 키 또는 OAuth 인증이 필요합니다" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("ZHIPU API 오류:", errorData);
    return NextResponse.json(
      { error: "AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = await processAIResult(parseAIResponse(content));
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("ZHIPU 응답 JSON 파싱 실패:", content);
    return NextResponse.json(
      { error: "AI 응답을 처리할 수 없습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// === 데모 모드 ===

function generateDemoContent(topic: string, keywords: string, _tone: string, category?: string) {
  const keywordList = keywords.split(",").map((k: string) => k.trim());
  const mainKeyword = keywordList[0] || topic;

  const suggestedCategory = category || "여행팁";

  return {
    title: `${topic} | 2026 최신 가이드`,
    excerpt: `${mainKeyword}에 대한 핵심 정보를 총정리했습니다. 보령항공여행사와 함께하는 완벽한 골프 여행을 만나보세요.`,
    category: suggestedCategory,
    tags: keywordList.slice(0, 5),
    // 신규 구조화 섹션 형식 (프론트엔드 템플릿 렌더링용)
    sections: [
      {
        type: "intro",
        text: `안녕하세요, 보령항공여행사입니다.\n\n오늘은 많은 분들이 찾으시는 ${mainKeyword}에 대해 자세히 안내드리려고 합니다.\n\n${mainKeyword}, 어디서부터 준비해야 할지 막막하셨다면 이 글 하나로 충분합니다.`,
      },
      {
        type: "content",
        heading: "출발 전 체크리스트",
        text: `여행 전 꼭 확인해야 할 것들이 있는데요,\n\n여권 유효기간은 6개월 이상 남아있어야 합니다. 항공권은 2~3개월 전 예약이 가장 저렴합니다.\n\n골프 보험도 꼭 가입하세요. 라운딩 중 사고에 대비할 수 있습니다.`,
        image: "https://picsum.photos/seed/golf-checklist/800/500",
        imageAlt: "골프 여행 준비 체크리스트",
      },
      {
        type: "content",
        heading: "추천 골프 코스",
        text: `${mainKeyword}에서 꼭 가봐야 할 코스를 소개합니다.\n\n첫째, 초보자도 즐길 수 있는 평탄한 코스. 그린피는 약 5~8만원 수준입니다.\n\n둘째, 현지인들이 사랑하는 명문 코스. 18홀 기준 약 8~12만원입니다.\n\n셋째, 오션뷰를 자랑하는 프리미엄 코스. 잊지 못할 라운딩이 될 거예요.`,
        image: "https://picsum.photos/seed/golf-course/800/500",
        imageAlt: "골프 코스 전경",
      },
      {
        type: "content",
        heading: "숙소 & 부대시설",
        text: `골프장에서 차로 10분 거리에 4성급 리조트가 있습니다.\n\n1박 기준 약 8~15만원이며, 조식 뷔페가 포함되어 있습니다.\n\n온천과 스파 시설도 갖추고 있어 라운딩 후 피로를 풀기 딱 좋습니다.`,
        image: "https://picsum.photos/seed/golf-resort/800/500",
        imageAlt: "리조트 전경",
      },
      {
        type: "tips",
        heading: "3박 4일 추천 일정",
        items: [
          "Day 1 - 도착 + 호텔 체크인 / 드라이빙 레인지에서 워밍업",
          "Day 2 - 명문 코스 18홀 라운딩 / 라운딩 후 전통 마사지",
          "Day 3 - 프리미엄 코스 라운딩 / 36홀 풀 라운딩도 가능",
          "Day 4 - 시내 관광 + 쇼핑 / 현지 맛집 탐방 후 귀국",
        ],
      },
      {
        type: "highlight",
        heading: "예산 총정리",
        text: `항공권: 30~50만원 (직항 기준) / 숙소: 1박 8~15만원 (4성급)\n\n그린피: 1라운드 5~10만원 / 캐디피+카트: 1라운드 3~5만원\n\n식비+기타: 1일 3~5만원 → 총 예산: 약 80~150만원`,
      },
      {
        type: "cta",
        heading: "보령항공여행사와 함께하세요",
        text: `${mainKeyword}, 혼자 준비하면 복잡하시죠?\n\n보령항공여행사에서는 항공+숙소+골프를 한 번에 해결하는 맞춤 패키지를 운영하고 있습니다.\n\n지금 바로 상담 신청하세요! 전문 상담사가 1:1로 안내드립니다.`,
      },
    ],
  };
}
