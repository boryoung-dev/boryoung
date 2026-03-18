"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Search,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// === 타입 정의 ===

interface SuggestedImage {
  keyword: string;
  alt: string;
}

interface ImageResult {
  id: string;
  url: string;
  thumbUrl: string;
  author: string;
  authorUrl: string;
  alt: string;
}

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  suggestedImages: SuggestedImage[];
  thumbnail: string | null;
  sections?: any[];
}

interface SEOCheck {
  label: string;
  passed: boolean;
  detail: string;
}

interface AIWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** AI 생성 결과를 기존 에디터로 전달하는 콜백 */
  onSendToEditor: (data: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    thumbnail?: string | null;
    sections?: any[];
  }) => void;
}

// === 톤 옵션 ===
const TONE_OPTIONS = [
  { value: "professional", label: "전문적" },
  { value: "friendly", label: "친근한" },
  { value: "casual", label: "캐주얼" },
] as const;

// === 카테고리 옵션 ===
const CATEGORY_OPTIONS = [
  { value: "", label: "자동 추천" },
  { value: "준비물", label: "준비물" },
  { value: "코스공략", label: "코스공략" },
  { value: "여행팁", label: "여행팁" },
  { value: "장비리뷰", label: "장비리뷰" },
  { value: "기타", label: "기타" },
];

// === HTML → 마크다운 변환 ===
function htmlToMarkdown(html: string): string {
  // turndown은 클라이언트에서 dynamic import로 사용
  // 간단한 변환 폴백 (turndown 로드 실패 시)
  let md = html;
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n");
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1");
  md = md.replace(/<ul[^>]*>|<\/ul>/gi, "");
  md = md.replace(/<ol[^>]*>|<\/ol>/gi, "");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

async function convertHtmlToMarkdown(html: string): Promise<string> {
  try {
    const TurndownService = (await import("turndown")).default;
    const turndown = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
    });
    return turndown.turndown(html);
  } catch {
    // turndown 로드 실패 시 폴백
    return htmlToMarkdown(html);
  }
}

// === SEO 점수 계산 ===
function calculateSEOChecks(
  title: string,
  excerpt: string,
  content: string,
  keywords: string
): SEOCheck[] {
  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const plainContent = content.replace(/<[^>]+>/g, "");
  const contentLength = plainContent.length;

  // 키워드 밀도 계산
  let keywordCount = 0;
  for (const kw of keywordList) {
    const regex = new RegExp(kw, "gi");
    keywordCount += (plainContent.match(regex) || []).length;
  }
  const density =
    contentLength > 0 ? ((keywordCount * keywordList[0]?.length || 0) / contentLength) * 100 : 0;

  // H2 태그 수
  const h2Count = (content.match(/<h2/gi) || []).length;

  return [
    {
      label: "제목 길이",
      passed: title.length > 0 && title.length <= 60,
      detail: `${title.length}/60자`,
    },
    {
      label: "발췌문 길이",
      passed: excerpt.length > 0 && excerpt.length <= 150,
      detail: `${excerpt.length}/150자`,
    },
    {
      label: "본문 길이",
      passed: contentLength >= 1500 && contentLength <= 2500,
      detail: `${contentLength}자 (권장: 1500~2500)`,
    },
    {
      label: "키워드 포함",
      passed: keywordList.some((kw) => title.includes(kw)),
      detail: keywordList.some((kw) => title.includes(kw))
        ? "제목에 키워드 포함됨"
        : "제목에 키워드 없음",
    },
    {
      label: "키워드 밀도",
      passed: density >= 0.5 && density <= 3,
      detail: `${density.toFixed(1)}% (권장: 1~2%)`,
    },
    {
      label: "서브헤딩(H2)",
      passed: h2Count >= 3,
      detail: `${h2Count}개 (권장: 3개 이상)`,
    },
  ];
}

// === 네이버 블로그 호환 HTML 변환 ===
function prepareForNaverBlog(html: string): string {
  // blockquote에 inline style 추가 (네이버는 class 무시)
  return html.replace(
    /<blockquote>/g,
    '<blockquote style="background:#f8f9fa;border-left:4px solid #4285f4;padding:16px 20px;margin:24px 0;border-radius:8px;">'
  );
}

// === 기존 게시글 타입 ===
interface ExistingPost {
  title: string;
  category: string | null;
}

// === 컴포넌트 ===

// === AI 제공자 타입 ===
interface AIProviderOption {
  id: string;
  name: string;
  provider: string;
  model: string | null;
  isDefault: boolean;
}

export default function AIWriterModal({
  isOpen,
  onClose,
  onSendToEditor,
}: AIWriterModalProps) {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();

  // 단계: "input" | "result"
  const [step, setStep] = useState<"input" | "result">("input");

  // 입력 폼 상태
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [category, setCategory] = useState("");

  // AI 제공자 상태
  const [aiProviders, setAiProviders] = useState<AIProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [providersLoaded, setProvidersLoaded] = useState(false);

  // 생성 결과 상태
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [editableTitle, setEditableTitle] = useState("");
  const [editableContent, setEditableContent] = useState("");

  // 기존 게시글 상태
  const [existingPosts, setExistingPosts] = useState<ExistingPost[]>([]);
  const [existingPostsOpen, setExistingPostsOpen] = useState(false);

  // 이미지 검색 상태
  const [imageSearching, setImageSearching] = useState<string | null>(null);
  const [searchedImages, setSearchedImages] = useState<Record<string, ImageResult[]>>({});

  // AI 제공자 목록 로드
  useEffect(() => {
    if (isOpen && !providersLoaded && Object.keys(authHeaders).length > 0) {
      fetch("/api/ai-providers", {
        headers: authHeaders as any,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.providers) {
            const active = data.providers
              .filter((p: any) => p.isActive)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                provider: p.provider,
                model: p.model,
                isDefault: p.isDefault,
              }));
            setAiProviders(active);
            // 기본 제공자 자동 선택
            const defaultProvider = active.find((p: AIProviderOption) => p.isDefault);
            if (defaultProvider) {
              setSelectedProviderId(defaultProvider.id);
            }
            setProvidersLoaded(true);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, providersLoaded, authHeaders]);

  // 기존 발행된 글 목록 로드
  useEffect(() => {
    if (isOpen && Object.keys(authHeaders).length > 0) {
      fetch("/api/blog-posts?limit=10&published=true", {
        headers: authHeaders as any,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.posts) {
            setExistingPosts(
              data.posts.map((p: any) => ({
                title: p.title,
                category: p.category,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [isOpen, authHeaders]);

  // === 핸들러 ===

  // AI 글 생성 (주제/키워드 비어있으면 자동 생성)
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // 주제/키워드가 비어있으면 autoTopic 모드로 요청
      const autoMode = !topic.trim() && !keywords.trim();
      const res = await fetch("/api/blog-posts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          keywords: keywords.trim() || undefined,
          tone,
          category,
          providerId: selectedProviderId || undefined,
          autoTopic: autoMode,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast(data.error || "AI 글 생성에 실패했습니다", "error");
        return;
      }

      // 구조화된 섹션이 있으면 JSON으로 content 저장
      const contentValue = data.sections
        ? JSON.stringify({ sections: data.sections })
        : data.content || "";

      const generated: GeneratedContent = {
        title: data.title,
        excerpt: data.excerpt,
        content: contentValue,
        category: data.category || category,
        tags: data.tags || [],
        suggestedImages: data.suggestedImages || [],
        thumbnail: data.thumbnail || null,
        sections: data.sections || undefined,
      };

      setResult(generated);
      setEditableTitle(generated.title);
      setEditableContent(generated.content);
      setSearchedImages({});
      setStep("result");
    } catch (error) {
      console.error("AI 글 생성 실패:", error);
      toast("AI 글 생성 중 오류가 발생했습니다", "error");
    } finally {
      setGenerating(false);
    }
  };

  // 이미지 검색
  const handleImageSearch = async (keyword: string) => {
    setImageSearching(keyword);
    try {
      const res = await fetch(
        `/api/images/search?query=${encodeURIComponent(keyword)}&perPage=6`,
        {
          headers: authHeaders as any,
        }
      );
      const data = await res.json();

      if (data.success) {
        setSearchedImages((prev) => ({
          ...prev,
          [keyword]: data.images,
        }));
      } else {
        toast("이미지 검색에 실패했습니다", "error");
      }
    } catch {
      toast("이미지 검색 중 오류가 발생했습니다", "error");
    } finally {
      setImageSearching(null);
    }
  };

  // 이미지 본문에 삽입
  const handleInsertImage = (image: ImageResult) => {
    const imgHtml = `<figure><img src="${image.url}" alt="${image.alt}" style="width:100%;border-radius:8px;" /><figcaption style="text-align:center;color:#666;font-size:0.9em;margin-top:4px;">${image.alt} (${image.author})</figcaption></figure>`;

    // 첫 번째 </h2> 이후, 또는 첫 번째 </p> 이후에 삽입
    const insertAfterH2 = editableContent.indexOf("</h2>");
    const insertAfterP = editableContent.indexOf("</p>");
    // 두 번째 </p> 찾기 (도입부 다음)
    const secondP = editableContent.indexOf("</p>", insertAfterP + 1);
    const insertPos = secondP !== -1 ? secondP + 4 : insertAfterH2 !== -1 ? insertAfterH2 + 5 : insertAfterP !== -1 ? insertAfterP + 4 : 0;

    const before = editableContent.slice(0, insertPos);
    const after = editableContent.slice(insertPos);
    setEditableContent(before + "\n" + imgHtml + "\n" + after);
    toast("이미지가 본문에 삽입되었습니다", "success");
  };

  // 에디터로 보내기
  const handleSendToEditor = () => {
    if (!result) return;
    onSendToEditor({
      title: editableTitle,
      excerpt: result.excerpt,
      content: editableContent,
      category: result.category,
      tags: result.tags,
      thumbnail: result.thumbnail,
      sections: result.sections,
    });
    handleClose();
  };

  // HTML 복사 (네이버 블로그 호환 형식)
  const handleCopyHtml = async () => {
    try {
      const naverHtml = prepareForNaverBlog(editableContent);
      await navigator.clipboard.writeText(naverHtml);
      toast("네이버 블로그 호환 HTML이 복사되었습니다", "success");
    } catch {
      toast("복사에 실패했습니다", "error");
    }
  };

  // 마크다운 복사
  const handleCopyMarkdown = async () => {
    try {
      const md = await convertHtmlToMarkdown(editableContent);
      await navigator.clipboard.writeText(md);
      toast("마크다운이 복사되었습니다", "success");
    } catch {
      toast("복사에 실패했습니다", "error");
    }
  };

  // 다시 생성 (1단계로 돌아가기)
  const handleRegenerate = () => {
    setStep("input");
    setResult(null);
    setEditableTitle("");
    setEditableContent("");
    setSearchedImages({});
  };

  // 모달 닫기
  const handleClose = () => {
    setStep("input");
    setTopic("");
    setKeywords("");
    setTone("professional");
    setCategory("");
    setResult(null);
    setEditableTitle("");
    setEditableContent("");
    setSearchedImages({});
    setGenerating(false);
    setProvidersLoaded(false);
    onClose();
  };

  if (!isOpen) return null;

  // SEO 체크리스트
  const seoChecks =
    result && step === "result"
      ? calculateSEOChecks(editableTitle, result.excerpt, editableContent, keywords)
      : [];
  const seoScore = seoChecks.filter((c) => c.passed).length;
  const seoTotal = seoChecks.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold">AI 글 작성</h2>
            {step === "result" && (
              <span className="text-sm text-gray-500 ml-2">미리보기</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* === 1단계: 입력 === */}
          {step === "input" && (
            <div className="space-y-5">
              {/* 주제 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주제 / 제목 *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: 태국 골프 여행 준비물 총정리"
                />
              </div>

              {/* 키워드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  키워드 * <span className="text-gray-400 font-normal">(콤마로 구분)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: 태국 골프, 골프 여행 준비물, 방콕 골프장"
                />
              </div>

              {/* 톤 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  톤
                </label>
                <div className="flex gap-3">
                  {TONE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                        tone === opt.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={opt.value}
                        checked={tone === opt.value}
                        onChange={(e) => setTone(e.target.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI 제공자 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI 제공자 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">
                    {aiProviders.length === 0 ? "데모 모드 (제공자 없음)" : "기본 제공자 사용"}
                  </option>
                  {aiProviders.map((p) => {
                    const providerLabel: Record<string, string> = {
                      openai: "OpenAI",
                      anthropic: "Anthropic",
                      google: "Google",
                      xai: "x.ai",
                      zhipu: "z.ai (GLM)",
                    };
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({providerLabel[p.provider] || p.provider}{p.model ? ` - ${p.model}` : ""})
                        {p.isDefault ? " [기본]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 기존 게시글 목록 (접이식) */}
              {existingPosts.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setExistingPostsOpen(!existingPostsOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {existingPostsOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    기존 게시글 ({existingPosts.length}개)
                  </button>
                  {existingPostsOpen && (
                    <div className="px-3 pb-3">
                      <ul className="space-y-1">
                        {existingPosts.map((post, i) => (
                          <li key={i} className="text-xs text-gray-400 truncate">
                            {post.category && (
                              <span className="text-gray-300 mr-1">[{post.category}]</span>
                            )}
                            {post.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="px-3 pb-2 text-xs text-gray-400">
                    AI가 기존 글과 겹치지 않게 자동으로 작성합니다
                  </p>
                </div>
              )}

              {/* 생성 버튼 */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI가 글을 작성하고 있습니다...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {topic.trim() || keywords.trim() ? "AI로 글 생성" : "AI가 주제 선정 + 글 생성"}
                  </>
                )}
              </button>
              {!topic.trim() && !keywords.trim() && (
                <p className="text-xs text-center text-gray-400 -mt-2">
                  주제/키워드를 비워두면 AI가 자동으로 골프 여행 주제를 선정합니다
                </p>
              )}
            </div>
          )}

          {/* === 2단계: 결과 미리보기 === */}
          {step === "result" && result && (
            <div className="space-y-6">
              {/* 제목 (수정 가능) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                />
              </div>

              {/* 발췌문 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발췌문 (메타 디스크립션)
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {result.excerpt}
                </p>
              </div>

              {/* 카테고리 & 태그 */}
              <div className="flex flex-wrap gap-2">
                {result.category && (
                  <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    {result.category}
                  </span>
                )}
                {result.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* SEO 점수 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    SEO 점수
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      seoScore >= 5
                        ? "text-green-600"
                        : seoScore >= 3
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {seoScore}/{seoTotal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {seoChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {check.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-gray-600">
                        {check.label}: {check.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 이미지 삽입 */}
              {result.suggestedImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추천 이미지
                  </label>
                  <div className="space-y-4">
                    {result.suggestedImages.map((img, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => handleImageSearch(img.keyword)}
                            disabled={imageSearching === img.keyword}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {imageSearching === img.keyword ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                            &quot;{img.keyword}&quot; 검색
                          </button>
                          <span className="text-xs text-gray-400">
                            {img.alt}
                          </span>
                        </div>

                        {/* 검색된 이미지 그리드 */}
                        {searchedImages[img.keyword] && (
                          <div className="grid grid-cols-3 gap-2">
                            {searchedImages[img.keyword].map((photo) => (
                              <button
                                key={photo.id}
                                onClick={() =>
                                  handleInsertImage({
                                    ...photo,
                                    alt: img.alt,
                                  })
                                }
                                className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-colors"
                              >
                                <img
                                  src={photo.thumbUrl}
                                  alt={photo.alt}
                                  className="w-full h-24 object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white truncate">
                                  {photo.author}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 본문 미리보기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문 미리보기
                </label>
                <div className="border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto bg-white">
                  {result.sections ? (
                    <div className="space-y-6" style={{ maxWidth: 720, margin: "0 auto" }}>
                      {result.sections.map((section: any, i: number) => (
                        <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-600 mb-2">
                            {section.type}
                          </span>
                          {section.heading && (
                            <h3 className="text-base font-bold text-gray-900 mb-1">{section.heading}</h3>
                          )}
                          {section.text && (
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{section.text}</p>
                          )}
                          {section.items && (
                            <ul className="mt-1 space-y-1">
                              {section.items.map((item: string, j: number) => (
                                <li key={j} className="text-sm text-gray-600 flex gap-2">
                                  <span className="text-purple-500">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          {section.image && (
                            <img src={section.image} alt={section.imageAlt || ""} className="mt-2 rounded-lg w-full max-h-40 object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="blog-preview prose prose-sm"
                      style={{ maxWidth: 720, margin: "0 auto" }}
                      dangerouslySetInnerHTML={{ __html: editableContent }}
                    />
                  )}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleSendToEditor}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  에디터로 보내기
                </button>
                <button
                  onClick={handleCopyHtml}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  HTML 복사
                </button>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  마크다운 복사
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 생성
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
