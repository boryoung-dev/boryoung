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
    const { topic, keywords, tone, category, providerId } = body;

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
    if (!provider) {
      const envApiKey = process.env.OPENAI_API_KEY;
      if (!envApiKey) {
        // 데모 모드
        const demoResult = generateDemoContent(topic, keywords, tone, category);
        return NextResponse.json({ success: true, ...demoResult });
      }
      // 환경변수 기반 OpenAI 호출
      return await callOpenAI(envApiKey, "gpt-4o-mini", topic, keywords, tone, category);
    }

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
      return await callOpenAI(apiKey, model || "gpt-4o-mini", topic, keywords, tone, category);
    }

    if (provider.provider === "anthropic") {
      if (!apiKey) {
        return NextResponse.json(
          { error: "Anthropic API 키가 설정되지 않았습니다" },
          { status: 400 }
        );
      }
      return await callAnthropic(apiKey, model || "claude-sonnet-4-20250514", topic, keywords, tone, category);
    }

    if (provider.provider === "google") {
      return await callGoogle(provider, model || "gemini-2.0-flash", topic, keywords, tone, category);
    }

    if (provider.provider === "zhipu") {
      return await callZhipu(provider, model || "glm-4-flash", topic, keywords, tone, category);
    }

    if (provider.provider === "xai") {
      if (!apiKey) {
        return NextResponse.json(
          { error: "x.ai API 키가 설정되지 않았습니다" },
          { status: 400 }
        );
      }
      return await callXAI(apiKey, model || "grok-3-mini", topic, keywords, tone, category);
    }

    return NextResponse.json(
      { error: `지원하지 않는 AI 제공자입니다: ${provider.provider}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("AI 글 생성 실패:", error);
    return NextResponse.json(
      { error: "AI 글 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// === 공통 프롬프트 ===

function buildPrompts(topic: string, keywords: string, tone: string, category?: string) {
  const toneMap: Record<string, string> = {
    professional: "전문적이고 신뢰감 있는 톤",
    friendly: "친근하고 따뜻한 톤",
    casual: "캐주얼하고 가벼운 톤",
  };
  const toneDesc = toneMap[tone] || toneMap.professional;

  const systemPrompt = `당신은 골프 여행 전문 블로그 작가입니다. SEO에 최적화된 고품질 한국어 블로그 글을 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{
  "title": "SEO 최적화된 제목 (60자 이내, 주요 키워드 포함)",
  "excerpt": "메타 디스크립션용 발췌문 (150자 이내, 핵심 내용 요약)",
  "content": "HTML 형식의 본문",
  "category": "추천 카테고리",
  "tags": ["관련", "태그", "목록"],
  "suggestedImages": [
    { "keyword": "이미지 검색 키워드", "alt": "이미지 설명" }
  ]
}

본문(content) HTML 작성 규칙:
- h2, h3, p, ul, li, strong, em 태그만 사용
- 본문 1500~2500자
- H2 서브헤딩 3~5개 활용
- H3 하위 헤딩 적절히 활용
- 도입부에서 핵심 키워드 자연스럽게 언급
- 키워드 밀도 1~2% 유지
- 결론에 CTA(Call to Action) 포함
- 내부 링크 삽입 가능 위치에 <!-- internal-link --> 주석 표시
- suggestedImages는 2~3개 추천 (본문 중간에 삽입할 이미지 키워드)`;

  const userPrompt = `주제: ${topic}
키워드: ${keywords}
톤: ${toneDesc}
${category ? `카테고리: ${category}` : "카테고리: 자동 추천"}

위 정보를 바탕으로 SEO 최적화된 골프 여행 블로그 글을 작성해주세요.`;

  return { systemPrompt, userPrompt };
}

// JSON 파싱 헬퍼
function parseAIResponse(content: string) {
  const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(jsonStr);
}

// === OpenAI 호출 ===

async function callOpenAI(
  apiKey: string,
  model: string,
  topic: string,
  keywords: string,
  tone: string,
  category?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category);

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
    const result = parseAIResponse(content);
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
  category?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category);

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
    const result = parseAIResponse(content);
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
  category?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category);
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
    console.error("Google API 오류:", errorData);
    return NextResponse.json(
      { error: "AI 글 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    return NextResponse.json({ error: "AI 응답이 비어있습니다" }, { status: 500 });
  }

  try {
    const result = parseAIResponse(content);
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
  category?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category);

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
    const result = parseAIResponse(content);
    return NextResponse.json({ success: true, ...result });
  } catch {
    console.error("x.ai 응답 JSON 파싱 실패:", content);
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
  category?: string
) {
  const { systemPrompt, userPrompt } = buildPrompts(topic, keywords, tone, category);

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

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
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
    const result = parseAIResponse(content);
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

function generateDemoContent(topic: string, keywords: string, tone: string, category?: string) {
  const keywordList = keywords.split(",").map((k: string) => k.trim());
  const mainKeyword = keywordList[0] || topic;

  const toneStyle = tone === "casual" ? "편하게" : tone === "friendly" ? "친근하게" : "전문적으로";

  const suggestedCategory = category || "여행팁";

  return {
    title: `${topic} | 2026 최신 가이드`,
    excerpt: `${mainKeyword}에 대한 모든 것을 ${toneStyle} 알려드립니다. 초보자부터 경험자까지 꼭 알아야 할 핵심 정보를 총정리했습니다.`,
    content: `<h2>${topic} 완벽 가이드</h2>
<p>${mainKeyword}을(를) 계획하고 계신가요? 이 글에서는 ${keywordList.join(", ")} 등 핵심 정보를 상세하게 다룹니다. 처음 가시는 분들도 이 가이드만 읽으면 충분합니다.</p>

<h2>1. 출발 전 꼭 확인해야 할 것들</h2>
<p>여행을 떠나기 전에 반드시 체크해야 할 항목들이 있습니다. 특히 ${mainKeyword} 관련해서는 사전 준비가 매우 중요합니다.</p>
<ul>
<li><strong>여권 및 비자</strong>: 유효기간 6개월 이상 확인 필수</li>
<li><strong>항공권 예약</strong>: 2~3개월 전 예약 시 최저가 확보 가능</li>
<li><strong>숙소 선정</strong>: 골프장과의 거리, 조식 포함 여부 확인</li>
<li><strong>보험 가입</strong>: 골프 라운딩 중 사고 대비 여행자 보험 필수</li>
</ul>

<h2>2. 현지에서 알아두면 좋은 팁</h2>
<p>현지에 도착하면 몇 가지 팁을 알고 있으면 훨씬 편하게 여행을 즐길 수 있습니다. ${mainKeyword}의 매력을 200% 즐기는 방법을 알려드리겠습니다.</p>
<ul>
<li><strong>환전</strong>: 공항보다 시내 환전소가 유리합니다</li>
<li><strong>교통</strong>: 그랩(Grab) 앱을 미리 설치하세요</li>
<li><strong>날씨</strong>: 우기(6~10월) 피해서 건기 시즌 추천</li>
<li><strong>복장</strong>: 골프장 드레스 코드 사전 확인 필수</li>
</ul>

<h2>3. 추천 코스 & 일정</h2>
<p>현지에서 가장 인기 있는 코스와 효율적인 일정을 추천드립니다. ${keywordList.slice(0, 2).join("과 ")}을(를) 모두 만족시키는 완벽한 플랜입니다.</p>
<ul>
<li><strong>Day 1</strong>: 도착 및 호텔 체크인, 드라이빙 레인지 연습</li>
<li><strong>Day 2</strong>: 명문 골프장 18홀 라운딩 + 전통 마사지</li>
<li><strong>Day 3</strong>: 프리미엄 코스 36홀 라운딩</li>
<li><strong>Day 4</strong>: 시내 관광 및 쇼핑, 귀국</li>
</ul>

<h2>4. 예산 & 비용 총정리</h2>
<p>합리적인 예산 계획을 위해 항목별 예상 비용을 정리했습니다.</p>
<ul>
<li><strong>항공권</strong>: 30~50만원 (직항 기준)</li>
<li><strong>숙소</strong>: 1박 8~15만원 (4성급 기준)</li>
<li><strong>그린피</strong>: 1라운드 5~10만원</li>
<li><strong>캐디피+카트</strong>: 1라운드 3~5만원</li>
<li><strong>식비+기타</strong>: 1일 3~5만원</li>
</ul>

<h2>마무리</h2>
<p>${mainKeyword}, 이 가이드를 참고하시면 완벽한 여행을 즐기실 수 있습니다. 보령항공여행에서는 최적의 골프 패키지를 준비하고 있으니, 지금 바로 상담을 신청해 보세요!</p>`,
    category: suggestedCategory,
    tags: keywordList.slice(0, 5),
    suggestedImages: [
      { keyword: `${mainKeyword} 풍경`, alt: `${mainKeyword} 전경` },
      { keyword: "골프장 코스", alt: "아름다운 골프 코스 전경" },
      { keyword: "골프 여행 준비물", alt: "골프 여행 필수 준비물 체크리스트" },
    ],
  };
}
