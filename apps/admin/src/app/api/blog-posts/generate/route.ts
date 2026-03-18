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
      return await callZhipu(provider, model || "glm-5", topic, keywords, tone, category);
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

  const systemPrompt = `당신은 보령항공여행사의 골프 여행 블로그 전문 작가입니다.
네이버 블로그 스타일로 SEO 최적화된 한국어 블로그 글을 작성합니다.

[중복 방지]
- 매번 다른 관점, 다른 도입부, 다른 비유를 사용하세요
- 같은 주제라도 시즌, 날씨, 여행 스타일 등 다른 각도에서 접근하세요
- 이전에 작성된 글과 겹치지 않도록 독창적인 표현을 사용하세요

[글쓰기 스타일]
- 짧은 문장으로 끊어 쓰기 (한 문장이 30자를 넘지 않게)
- 2~3문장마다 빈 줄(<br>) 삽입
- 대화하듯 친근하고 신뢰감 있는 톤
- "~인데요,", "~합니다.", "~하시나요?", "~보세요." 등 자연스러운 어미
- 구체적 숫자와 정보 활용 (거리, 시간, 가격, 기온 등)

[HTML 구조]
- 소제목: <blockquote><strong>섹션 제목</strong><br>부제목</blockquote>
- 본문: <p style="text-align:center;line-height:2.1;">짧은 문장</p>
- 이미지 위치: 각 섹션 텍스트 사이에 <!-- IMAGE: 검색키워드 --> 마커 삽입 (2~3개)
- 강조: <span style="color:#ff0010;font-size:19px;"><b>강조 텍스트</b></span>
- 구분선: <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

[SEO 규칙]
- 제목 60자 이내, 주요 키워드 포함
- 발췌문 150자 이내
- 본문 2000~3000자
- 메인 키워드를 자연스럽게 5~8회 반복
- H2 대신 blockquote로 섹션 구분 (네이버 블로그 스타일)

[본문 구성]
1. 도입부: 인사 + 주제 소개 + 보령항공여행사 언급
2. 본문 섹션 4~6개 (각 섹션: 소제목 → 설명 → 이미지 마커)
3. 마무리: CTA (문의/예약 유도)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "SEO 최적화 제목",
  "excerpt": "메타 디스크립션 150자 이내",
  "content": "HTML 본문 (<!-- IMAGE: 키워드 --> 마커 포함)",
  "category": "추천 카테고리",
  "tags": ["태그1", "태그2"],
  "suggestedImages": [
    { "keyword": "검색 키워드", "alt": "이미지 설명", "position": "섹션명" }
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

// AI 응답 결과에 이미지 마커 처리를 적용
function processAIResult(result: Record<string, unknown>): Record<string, unknown> {
  if (typeof result.content === "string") {
    result.content = replaceImageMarkers(result.content);
  }
  return result;
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
    const result = processAIResult(parseAIResponse(content));
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
    const result = processAIResult(parseAIResponse(content));
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
    const result = processAIResult(parseAIResponse(content));
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
    const result = processAIResult(parseAIResponse(content));
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
    const result = processAIResult(parseAIResponse(content));
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
    content: `<p style="text-align:center;line-height:2.1;">안녕하세요, 보령항공여행사입니다.</p>
<p style="text-align:center;line-height:2.1;">오늘은 많은 분들이 찾으시는<br><span style="color:#ff0010;font-size:19px;"><b>${mainKeyword}</b></span>에 대해<br>자세히 안내드리려고 합니다.</p>
<p style="text-align:center;line-height:2.1;">${mainKeyword}, 어디서부터 준비해야 할지<br>막막하셨다면 이 글 하나로 충분합니다.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=1" alt="${mainKeyword} 전경" style="width:100%;max-width:720px;border-radius:12px;" /></div>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>출발 전 체크리스트</strong><br>${mainKeyword} 준비 필수 사항</blockquote>

<p style="text-align:center;line-height:2.1;">여행 전 꼭 확인해야 할 것들이 있는데요,</p>
<p style="text-align:center;line-height:2.1;">여권 유효기간은 6개월 이상 남아있어야 합니다.<br>항공권은 2~3개월 전 예약이 가장 저렴합니다.</p>
<p style="text-align:center;line-height:2.1;">골프 보험도 꼭 가입하세요.<br>라운딩 중 사고에 대비할 수 있습니다.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=2" alt="골프 여행 준비" style="width:100%;max-width:720px;border-radius:12px;" /></div>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>추천 골프 코스</strong><br>현지 인기 코스 TOP 3</blockquote>

<p style="text-align:center;line-height:2.1;">${mainKeyword}에서 꼭 가봐야 할 코스를 소개합니다.</p>
<p style="text-align:center;line-height:2.1;">첫째, 초보자도 즐길 수 있는 평탄한 코스.<br>그린피는 약 5~8만원 수준입니다.</p>
<p style="text-align:center;line-height:2.1;">둘째, 현지인들이 사랑하는 명문 코스.<br>18홀 기준 약 8~12만원입니다.</p>
<p style="text-align:center;line-height:2.1;">셋째, 오션뷰를 자랑하는 프리미엄 코스.<br>잊지 못할 라운딩이 될 거예요.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=3" alt="골프 코스 전경" style="width:100%;max-width:720px;border-radius:12px;" /></div>
<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=4" alt="골프장 풍경" style="width:100%;max-width:720px;border-radius:12px;" /></div>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>숙소 & 부대시설</strong><br>편안한 휴식을 위한 추천 숙소</blockquote>

<p style="text-align:center;line-height:2.1;">골프장에서 차로 10분 거리에<br>4성급 리조트가 있습니다.</p>
<p style="text-align:center;line-height:2.1;">1박 기준 약 8~15만원이며,<br>조식 뷔페가 포함되어 있습니다.</p>
<p style="text-align:center;line-height:2.1;">온천과 스파 시설도 갖추고 있어<br>라운딩 후 피로를 풀기 딱 좋습니다.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=5" alt="리조트 전경" style="width:100%;max-width:720px;border-radius:12px;" /></div>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>추천 일정</strong><br>3박 4일 알찬 여행 플랜</blockquote>

<p style="text-align:center;line-height:2.1;"><span style="color:#ff0010;font-size:19px;"><b>Day 1</b></span> 도착 + 호텔 체크인<br>드라이빙 레인지에서 가볍게 몸을 풀어보세요.</p>
<p style="text-align:center;line-height:2.1;"><span style="color:#ff0010;font-size:19px;"><b>Day 2</b></span> 명문 코스 18홀 라운딩<br>라운딩 후 전통 마사지로 힐링합니다.</p>
<p style="text-align:center;line-height:2.1;"><span style="color:#ff0010;font-size:19px;"><b>Day 3</b></span> 프리미엄 코스 라운딩<br>36홀 풀 라운딩도 가능합니다.</p>
<p style="text-align:center;line-height:2.1;"><span style="color:#ff0010;font-size:19px;"><b>Day 4</b></span> 시내 관광 + 쇼핑<br>현지 맛집 탐방 후 귀국합니다.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=6" alt="여행 일정" style="width:100%;max-width:720px;border-radius:12px;" /></div>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>예산 총정리</strong><br>항목별 예상 비용</blockquote>

<p style="text-align:center;line-height:2.1;">항공권: 30~50만원 (직항 기준)<br>숙소: 1박 8~15만원 (4성급)</p>
<p style="text-align:center;line-height:2.1;">그린피: 1라운드 5~10만원<br>캐디피+카트: 1라운드 3~5만원</p>
<p style="text-align:center;line-height:2.1;">식비+기타: 1일 3~5만원<br><span style="color:#ff0010;font-size:19px;"><b>총 예산: 약 80~150만원</b></span></p>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

<blockquote><strong>보령항공여행사와 함께하세요</strong><br>맞춤 골프 패키지 상담</blockquote>

<p style="text-align:center;line-height:2.1;">${mainKeyword}, 혼자 준비하면 복잡하시죠?</p>
<p style="text-align:center;line-height:2.1;">보령항공여행사에서는<br>항공+숙소+골프를 한 번에 해결하는<br>맞춤 패키지를 운영하고 있습니다.</p>
<p style="text-align:center;line-height:2.1;"><span style="color:#ff0010;font-size:19px;"><b>지금 바로 상담 신청하세요!</b></span><br>전문 상담사가 1:1로 안내드립니다.</p>

<div style="text-align:center;margin:24px 0;"><img src="https://picsum.photos/800/500?random=7" alt="보령항공여행사" style="width:100%;max-width:720px;border-radius:12px;" /></div>`,
    category: suggestedCategory,
    tags: keywordList.slice(0, 5),
    suggestedImages: [
      { keyword: `${mainKeyword} 풍경`, alt: `${mainKeyword} 전경`, position: "도입부" },
      { keyword: "골프장 코스", alt: "아름다운 골프 코스 전경", position: "추천 코스" },
      { keyword: "골프 여행 준비물", alt: "골프 여행 필수 준비물", position: "체크리스트" },
    ],
  };
}
