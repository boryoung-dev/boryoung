"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Bot,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  Star,
  Zap,
} from "lucide-react";
import Modal, {
  ModalCancelButton,
  ModalConfirmButton,
} from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

// === 타입 ===

interface AIProviderItem {
  id: string;
  name: string;
  provider: string;
  apiKey: string | null;
  model: string | null;
  isDefault: boolean;
  isActive: boolean;
  authType: string;
  oauthData: any;
  createdAt: string;
  updatedAt: string;
}

// === 제공자별 모델 목록 ===

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "google", label: "Google (Gemini)" },
  { value: "xai", label: "x.ai (Grok)" },
  { value: "zhipu", label: "z.ai (GLM)" },
];

const MODEL_OPTIONS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  ],
  google: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
  xai: [
    { value: "grok-3", label: "Grok 3" },
    { value: "grok-3-mini", label: "Grok 3 Mini" },
  ],
  zhipu: [
    { value: "glm-5", label: "GLM-5" },
    { value: "glm-4.6v", label: "GLM-4.6V (멀티모달)" },
    { value: "glm-4-flash", label: "GLM-4-Flash" },
    { value: "glm-4", label: "GLM-4" },
    { value: "glm-4-plus", label: "GLM-4-Plus" },
  ],
};

const AUTH_TYPE_OPTIONS = [
  { value: "apikey", label: "API 키" },
  { value: "oauth", label: "OAuth" },
];

// === 제공자 로고/아이콘 ===

function ProviderIcon({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    openai: "bg-green-100 text-green-700",
    anthropic: "bg-orange-100 text-orange-700",
    google: "bg-blue-100 text-blue-700",
    xai: "bg-purple-100 text-purple-700",
    zhipu: "bg-cyan-100 text-cyan-700",
  };
  const labels: Record<string, string> = {
    openai: "AI",
    anthropic: "CL",
    google: "GE",
    xai: "XA",
    zhipu: "智",
  };
  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${colors[provider] || "bg-gray-100 text-gray-700"}`}
    >
      {labels[provider] || "??"}
    </div>
  );
}

// === 컴포넌트 ===

export default function AISettingsPage() {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AIProviderItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    provider: "openai",
    apiKey: "",
    model: "gpt-4o-mini",
    isDefault: false,
    authType: "apikey",
  });

  // OAuth 콜백 메시지 처리
  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    if (error) {
      toast(decodeURIComponent(error), "error");
    }
    if (success) {
      toast(decodeURIComponent(success), "success");
      fetchProviders();
    }
  }, [searchParams]);

  // 제공자 목록 조회
  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/ai-providers", {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error("AI 제공자 목록 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchProviders();
    }
  }, [authHeaders]);

  // 제공자 변경 시 모델 기본값 설정
  const handleProviderChange = (provider: string) => {
    const models = MODEL_OPTIONS[provider];
    setFormData({
      ...formData,
      provider,
      model: models?.[0]?.value || "",
      // Google, ZHIPU만 OAuth 지원
      authType: formData.authType === "oauth" && provider !== "google" && provider !== "zhipu" ? "apikey" : formData.authType,
    });
  };

  // 추가
  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast("이름을 입력해주세요", "error");
      return;
    }
    if (formData.authType === "apikey" && !formData.apiKey.trim()) {
      toast("API 키를 입력해주세요", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ai-providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast("AI 제공자가 추가되었습니다", "success");
        setShowAddModal(false);
        resetForm();
        fetchProviders();

        // OAuth인 경우 바로 OAuth 플로우 시작
        if (formData.authType === "oauth" && formData.provider === "google") {
          startGoogleOAuth(data.provider.id);
        }
        if (formData.authType === "oauth" && formData.provider === "zhipu") {
          startZhipuOAuth(data.provider.id);
        }
      } else {
        toast(data.error || "추가 실패", "error");
      }
    } catch {
      toast("추가 중 오류가 발생했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  // 수정
  const handleEdit = async () => {
    if (!editTarget) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/ai-providers/${editTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast("AI 제공자가 수정되었습니다", "success");
        setShowEditModal(false);
        setEditTarget(null);
        resetForm();
        fetchProviders();
      } else {
        toast(data.error || "수정 실패", "error");
      }
    } catch {
      toast("수정 중 오류가 발생했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async (id: string, name: string) => {
    if (
      !(await confirm({
        message: `"${name}" AI 제공자를 삭제하시겠습니까?`,
        variant: "danger",
        confirmText: "삭제",
      }))
    )
      return;

    try {
      const res = await fetch(`/api/ai-providers/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });

      const data = await res.json();
      if (data.success) {
        toast("AI 제공자가 삭제되었습니다", "success");
        fetchProviders();
      } else {
        toast(data.error || "삭제 실패", "error");
      }
    } catch {
      toast("삭제 중 오류가 발생했습니다", "error");
    }
  };

  // 활성/비활성 토글
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (data.success) fetchProviders();
    } catch {
      toast("상태 변경 중 오류가 발생했습니다", "error");
    }
  };

  // 기본 제공자 설정
  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast("기본 제공자가 변경되었습니다", "success");
        fetchProviders();
      }
    } catch {
      toast("기본 제공자 변경 중 오류가 발생했습니다", "error");
    }
  };

  // 연결 테스트
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch("/api/ai-providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ providerId: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast(data.message || "연결 성공!", "success");
      } else {
        toast(`연결 실패: ${data.error || "알 수 없는 오류"}`, "error");
      }
    } catch {
      toast("연결 테스트 중 오류가 발생했습니다", "error");
    } finally {
      setTestingId(null);
    }
  };

  // Google OAuth 시작
  const startGoogleOAuth = async (providerId: string) => {
    setOauthLoading(true);
    try {
      const res = await fetch(
        `/api/ai-providers/oauth/google?providerId=${providerId}`,
        { headers: authHeaders as any }
      );
      const data = await res.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast(data.error || "OAuth 시작 실패", "error");
      }
    } catch {
      toast("OAuth 시작 중 오류가 발생했습니다", "error");
    } finally {
      setOauthLoading(false);
    }
  };

  // ZHIPU OAuth 시작
  const startZhipuOAuth = async (providerId: string) => {
    setOauthLoading(true);
    try {
      const res = await fetch(
        `/api/ai-providers/oauth/zhipu?providerId=${providerId}`,
        { headers: authHeaders as any }
      );
      const data = await res.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast(data.error || "OAuth 시작 실패", "error");
      }
    } catch {
      toast("OAuth 시작 중 오류가 발생했습니다", "error");
    } finally {
      setOauthLoading(false);
    }
  };

  // 수정 모달 열기
  const openEditModal = (provider: AIProviderItem) => {
    setEditTarget(provider);
    setFormData({
      name: provider.name,
      provider: provider.provider,
      apiKey: "",
      model: provider.model || MODEL_OPTIONS[provider.provider]?.[0]?.value || "",
      isDefault: provider.isDefault,
      authType: provider.authType,
    });
    setShowEditModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      provider: "openai",
      apiKey: "",
      model: "gpt-4o-mini",
      isDefault: false,
      authType: "apikey",
    });
  };

  // 제공자 레이블
  const getProviderLabel = (provider: string) => {
    return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI 설정</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> AI 제공자 추가
        </button>
      </div>

      {/* 제공자 카드 목록 */}
      {providers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-4">
            등록된 AI 제공자가 없습니다.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> 첫 번째 AI 제공자 추가하기
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-xl shadow-sm border p-5 transition-colors ${
                p.isDefault
                  ? "border-blue-300 ring-1 ring-blue-100"
                  : "border-gray-200"
              } ${!p.isActive ? "opacity-60" : ""}`}
            >
              {/* 상단: 로고 + 이름 + 뱃지 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={p.provider} />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        {
                          openai: "bg-green-50 text-green-600",
                          anthropic: "bg-orange-50 text-orange-600",
                          google: "bg-blue-50 text-blue-600",
                          xai: "bg-purple-50 text-purple-600",
                          zhipu: "bg-cyan-50 text-cyan-600",
                        }[p.provider] || "bg-gray-50 text-gray-600"
                      }`}>
                        {getProviderLabel(p.provider)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.isDefault && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                      <Star className="w-3 h-3" /> 기본
                    </span>
                  )}
                  {p.apiKey || (p.authType === "oauth" && p.oauthData) ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded-full">
                      <Wifi className="w-3 h-3" /> 연결됨
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
                      <WifiOff className="w-3 h-3" /> 미설정
                    </span>
                  )}
                </div>
              </div>

              {/* 모델 + 인증 방식 */}
              <div className="space-y-1.5 mb-4">
                {p.model && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-gray-400">모델:</span>
                    <span className="font-medium">{p.model}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400">인증:</span>
                  <span className="font-medium">
                    {p.authType === "oauth" ? "OAuth" : "API 키"}
                    {p.authType === "apikey" && p.apiKey && (
                      <span className="ml-1 text-gray-400 font-mono">{p.apiKey}</span>
                    )}
                    {p.authType === "oauth" && p.oauthData && (
                      <span className="ml-1 text-green-600">연결됨</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 하단: 액션 버튼들 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  {/* 활성/비활성 토글 */}
                  <button
                    onClick={() => handleToggleActive(p.id, !p.isActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      p.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                    title={p.isActive ? "비활성화" : "활성화"}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        p.isActive
                          ? "translate-x-[18px]"
                          : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                  {/* 기본 설정 */}
                  {!p.isDefault && (
                    <button
                      onClick={() => handleSetDefault(p.id)}
                      className="ml-2 px-2 py-1 text-[10px] text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      title="기본 제공자로 설정"
                    >
                      기본으로
                    </button>
                  )}
                  {/* Google OAuth 재연결 */}
                  {p.provider === "google" && p.authType === "oauth" && (
                    <button
                      onClick={() => startGoogleOAuth(p.id)}
                      disabled={oauthLoading}
                      className="ml-2 px-2 py-1 text-[10px] text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {oauthLoading ? "연결 중..." : "Google 재연결"}
                    </button>
                  )}
                  {/* ZHIPU OAuth 재연결 */}
                  {p.provider === "zhipu" && p.authType === "oauth" && (
                    <button
                      onClick={() => startZhipuOAuth(p.id)}
                      disabled={oauthLoading}
                      className="ml-2 px-2 py-1 text-[10px] text-cyan-600 border border-cyan-200 rounded hover:bg-cyan-50 transition-colors disabled:opacity-50"
                    >
                      {oauthLoading ? "연결 중..." : "智谱 재연결"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTestConnection(p.id)}
                    disabled={testingId === p.id}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="연결 테스트"
                  >
                    {testingId === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="AI 제공자 추가"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowAddModal(false)} />
            <ModalConfirmButton onClick={handleAdd} disabled={saving}>
              {saving ? "저장 중..." : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <ProviderForm
          formData={formData}
          setFormData={setFormData}
          onProviderChange={handleProviderChange}
          onStartOAuth={undefined}
        />
      </Modal>

      {/* 수정 모달 */}
      <Modal
        isOpen={showEditModal && !!editTarget}
        onClose={() => {
          setShowEditModal(false);
          setEditTarget(null);
        }}
        title="AI 제공자 수정"
        size="md"
        footer={
          <>
            <ModalCancelButton
              onClick={() => {
                setShowEditModal(false);
                setEditTarget(null);
              }}
            />
            <ModalConfirmButton onClick={handleEdit} disabled={saving}>
              {saving ? "저장 중..." : "수정"}
            </ModalConfirmButton>
          </>
        }
      >
        <ProviderForm
          formData={formData}
          setFormData={setFormData}
          onProviderChange={handleProviderChange}
          onStartOAuth={
            editTarget && formData.provider === "google"
              ? () => startGoogleOAuth(editTarget.id)
              : editTarget && formData.provider === "zhipu"
                ? () => startZhipuOAuth(editTarget.id)
                : undefined
          }
          isEdit
        />
      </Modal>
    </div>
  );
}

// === 폼 컴포넌트 ===

function ProviderForm({
  formData,
  setFormData,
  onProviderChange,
  onStartOAuth,
  isEdit,
}: {
  formData: {
    name: string;
    provider: string;
    apiKey: string;
    model: string;
    isDefault: boolean;
    authType: string;
  };
  setFormData: (data: any) => void;
  onProviderChange: (provider: string) => void;
  onStartOAuth: (() => void) | undefined;
  isEdit?: boolean;
}) {
  const models = MODEL_OPTIONS[formData.provider] || [];
  const supportsOAuth = formData.provider === "google" || formData.provider === "zhipu";

  return (
    <div className="space-y-4">
      {/* 제공자 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          AI 제공자 *
        </label>
        <div className="flex gap-2">
          {PROVIDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onProviderChange(opt.value)}
              className={`flex-1 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                formData.provider === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          placeholder="예: 내 OpenAI, 회사 Claude"
        />
      </div>

      {/* 인증 방식 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          인증 방식
        </label>
        <div className="flex gap-2">
          {AUTH_TYPE_OPTIONS.map((opt) => {
            const disabled = opt.value === "oauth" && !supportsOAuth;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  setFormData({ ...formData, authType: opt.value })
                }
                className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  formData.authType === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {opt.label}
                {opt.value === "oauth" && !supportsOAuth && (
                  <span className="block text-[10px] text-gray-400">
                    Google/智谱만 지원
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* API 키 (apikey 선택 시) */}
      {formData.authType === "apikey" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API 키 {!isEdit && "*"}
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData({ ...formData, apiKey: e.target.value })
            }
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm font-mono"
            placeholder={
              isEdit ? "새 키를 입력하거나 빈칸이면 기존 키 유지" : "sk-... 또는 API 키 입력"
            }
          />
          {isEdit && (
            <p className="text-xs text-gray-400 mt-1">
              기존 키가 저장되어 있습니다. 변경하려면 새 키를 입력하세요.
            </p>
          )}
        </div>
      )}

      {/* OAuth (oauth 선택 시) */}
      {formData.authType === "oauth" && supportsOAuth && onStartOAuth && (
        <div>
          <button
            type="button"
            onClick={onStartOAuth}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {formData.provider === "google" ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center rounded bg-cyan-100 text-cyan-700 text-xs font-bold">智</span>
            )}
            {formData.provider === "google" ? "Google 계정 연결" : "智谱 계정 연결"}
          </button>
        </div>
      )}

      {formData.authType === "oauth" && supportsOAuth && !onStartOAuth && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          저장 후 {formData.provider === "google" ? "Google" : "智谱"} 계정을 연결할 수 있습니다.
        </div>
      )}

      {/* 모델 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          기본 모델
        </label>
        <select
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 기본 제공자 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">기본 제공자로 설정</span>
      </label>
    </div>
  );
}
