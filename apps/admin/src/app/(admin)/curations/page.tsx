"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Package, Search, GripVertical, X, Upload, Loader2 } from "lucide-react";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

// 섹션 타입 정의
const SECTION_TYPES = [
  { value: "", label: "선택 안함 (일반 큐레이션)" },
  { value: "globe", label: "🌏 지구본 (국가별 상품)" },
  { value: "destinations_carousel", label: "📍 여행지 캐러셀 (이미지 카드)" },
  { value: "featured_grid", label: "⭐ 추천 그리드 (2행 3열 카드)" },
  { value: "product_showcase", label: "🏷️ 상품 쇼케이스 (탭 필터)" },
  { value: "product_carousel", label: "📦 상품 캐러셀 (가로 슬라이드)" },
  { value: "trust_cta", label: "🤝 신뢰 CTA (텍스트 + 전화번호)" },
] as const;

const SECTION_TYPE_LABELS: Record<string, string> = {
  globe: "지구본",
  featured_grid: "추천 그리드",
  product_carousel: "상품 캐러셀",
  product_showcase: "상품 쇼케이스",
  destinations_carousel: "여행지 캐러셀",
  banner_hero: "배너 히어로",
  trust_cta: "신뢰 CTA",
};

const SECTION_TYPE_COLORS: Record<string, string> = {
  globe: "bg-blue-100 text-blue-800",
  featured_grid: "bg-indigo-100 text-indigo-800",
  product_carousel: "bg-cyan-100 text-cyan-800",
  product_showcase: "bg-amber-100 text-amber-800",
  destinations_carousel: "bg-emerald-100 text-emerald-800",
  banner_hero: "bg-rose-100 text-rose-800",
  trust_cta: "bg-violet-100 text-violet-800",
};

// 섹션별 설명
const SECTION_DESCRIPTIONS: Record<string, string> = {
  globe: "상품의 목적지(국가)별로 자동 분류됩니다. 국가 목록과 설명을 관리하세요.",
  destinations_carousel: "여행지 이름과 이미지를 추가하세요. 클릭 시 해당 여행지 페이지로 이동합니다.",
  featured_grid: "연결된 상품이 2행 3열 그리드로 표시됩니다.",
  product_showcase: "탭 필터와 함께 상품이 캐러셀로 표시됩니다. 탭 이름을 설정하세요.",
  product_carousel: "연결된 상품이 가로 캐러셀로 표시됩니다.",
  trust_cta: "신뢰 문구와 전화번호를 설정하세요.",
};

interface Curation {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sectionType?: string | null;
  displayConfig?: any;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

interface Product {
  id: string;
  title: string;
  slug: string;
  destination: string;
  basePrice: number;
}

interface CurationProduct {
  id: string;
  productId: string;
  product: Product;
}

// 여행지 아이템
interface DestinationItem {
  name: string;
  image: string;
  link: string;
}

// 국가 아이템
interface CountryItem {
  name: string;
  code: string;
  description: string;
  lat: number;
  lng: number;
}

export default function CurationsPage() {
  const { authHeaders, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [editingCuration, setEditingCuration] = useState<Curation | null>(null);
  const [managingCuration, setManagingCuration] = useState<Curation | null>(null);

  // 기본 폼 데이터
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formSectionType, setFormSectionType] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // 섹션 타입별 설정 데이터
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");

  // 상품 관리 state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0 && !isLoading) {
      fetchCurations();
    }
  }, [authHeaders, isLoading]);

  const fetchCurations = async () => {
    try {
      const res = await fetch("/api/curations", { headers: authHeaders as any });
      const data = await res.json();
      if (data.success) setCurations(data.curations);
    } catch {} finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormSubtitle("");
    setFormSectionType("");
    setFormSortOrder(curations.length > 0 ? Math.max(...curations.map((c) => c.sortOrder)) + 1 : 0);
    setFormIsActive(true);
    setDestinations([]);
    setCountries([]);
    setTabs([]);
    setCtaPhone("");
    setCtaDescription("");
  };

  const openCreateModal = () => {
    setEditingCuration(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (curation: Curation) => {
    setEditingCuration(curation);
    setFormTitle(curation.title);
    setFormSubtitle(curation.subtitle || "");
    setFormSectionType(curation.sectionType || "");
    setFormSortOrder(curation.sortOrder);
    setFormIsActive(curation.isActive);

    const config = curation.displayConfig || {};

    // 타입별 데이터 로드
    if (curation.sectionType === "destinations_carousel") {
      setDestinations(config.destinations || []);
    } else if (curation.sectionType === "globe") {
      setCountries(config.countries || []);
    } else if (curation.sectionType === "product_showcase") {
      setTabs(config.tabs || []);
    } else if (curation.sectionType === "trust_cta") {
      setCtaPhone(config.phone || "");
      setCtaDescription(curation.description || "");
    }

    setModalOpen(true);
  };

  // displayConfig 빌드
  const buildDisplayConfig = () => {
    switch (formSectionType) {
      case "destinations_carousel":
        return { destinations: destinations.filter((d) => d.name) };
      case "globe":
        return { countries: countries.filter((c) => c.name) };
      case "product_showcase":
        return { tabs: tabs.filter((t) => t), filter: "deals", maxItems: 8 };
      case "product_carousel":
        return { filter: "new", maxItems: 8 };
      case "featured_grid":
        return { columns: 3, rows: 2, maxItems: 6 };
      case "trust_cta":
        return { phone: ctaPhone };
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast("제목은 필수입니다", "error");
      return;
    }

    try {
      const url = editingCuration ? `/api/curations/${editingCuration.id}` : "/api/curations";
      const method = editingCuration ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({
          title: formTitle,
          subtitle: formSubtitle || null,
          description: formSectionType === "trust_cta" ? ctaDescription || null : null,
          sectionType: formSectionType || null,
          displayConfig: buildDisplayConfig(),
          sortOrder: formSortOrder,
          isActive: formIsActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCurations();
        toast(editingCuration ? "수정되었습니다" : "추가되었습니다", "success");
      } else {
        toast(data.error || "저장 실패", "error");
      }
    } catch {
      toast("저장 중 오류가 발생했습니다", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;
    try {
      const res = await fetch(`/api/curations/${id}`, { method: "DELETE", headers: authHeaders as any });
      const data = await res.json();
      if (data.success) { fetchCurations(); toast("삭제되었습니다", "success"); }
    } catch {}
  };

  // 상품 관리 모달
  const openProductsModal = async (curation: Curation) => {
    setManagingCuration(curation);
    setProductsLoading(true);
    setProductsModalOpen(true);
    setProductSearch("");

    try {
      const [productsRes, linkedRes] = await Promise.all([
        fetch("/api/products", { headers: authHeaders as any }),
        fetch(`/api/curations/${curation.id}/products`, { headers: authHeaders as any }),
      ]);
      const productsData = await productsRes.json();
      const linkedData = await linkedRes.json();
      if (productsData.success) setAllProducts(productsData.products || []);
      if (linkedData.success) {
        setSelectedProductIds((linkedData.products || []).map((cp: CurationProduct) => cp.productId));
      }
    } catch {} finally {
      setProductsLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!managingCuration) return;
    try {
      const res = await fetch(`/api/curations/${managingCuration.id}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ productIds: selectedProductIds }),
      });
      const data = await res.json();
      if (data.success) {
        setProductsModalOpen(false);
        fetchCurations();
        toast("상품이 업데이트되었습니다", "success");
      }
    } catch {}
  };

  const filteredProducts = productSearch
    ? allProducts.filter((p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.destination.toLowerCase().includes(productSearch.toLowerCase())
      )
    : allProducts;

  // 여행지 관리 헬퍼
  const addDestination = () => setDestinations([...destinations, { name: "", image: "", link: "" }]);
  const updateDestination = (idx: number, field: string, value: string) => {
    setDestinations(destinations.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };
  const removeDestination = (idx: number) => setDestinations(destinations.filter((_, i) => i !== idx));

  // 국가 관리 헬퍼
  const addCountry = () => setCountries([...countries, { name: "", code: "", description: "", lat: 0, lng: 0 }]);
  const updateCountry = (idx: number, field: string, value: any) => {
    setCountries(countries.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };
  const removeCountry = (idx: number) => setCountries(countries.filter((_, i) => i !== idx));

  // 탭 관리 헬퍼
  const addTab = () => setTabs([...tabs, ""]);
  const updateTab = (idx: number, value: string) => {
    setTabs(tabs.map((t, i) => (i === idx ? value : t)));
  };
  const removeTab = (idx: number) => setTabs(tabs.filter((_, i) => i !== idx));

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">로딩 중...</div>;
  }

  // 섹션 타입에 따라 적절한 라벨
  const getSectionInfo = (c: Curation) => {
    if (c.sectionType === "globe") return "국가별 자동 분류";
    if (c.sectionType === "destinations_carousel") {
      const count = c.displayConfig?.destinations?.length || 0;
      return `여행지 ${count}개`;
    }
    if (c.sectionType === "trust_cta") return "텍스트 + CTA";
    return `상품 ${c._count?.products || 0}개`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메인 섹션 관리</h1>
          <p className="text-sm text-gray-500 mt-1">메인페이지 섹션을 관리합니다. 순서대로 표시됩니다.</p>
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm">
          <Plus className="w-4 h-4" /> 섹션 추가
        </button>
      </div>

      {curations.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">등록된 섹션이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {curations.map((curation) => (
            <div key={curation.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${curation.isActive ? "border-gray-200" : "border-gray-200 opacity-60"}`}>
              <div className="flex items-stretch">
                <div className="flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 text-gray-400">
                  <div className="text-center">
                    <GripVertical className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-xs font-mono">{curation.sortOrder}</span>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">{curation.title}</h3>
                    {curation.sectionType && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SECTION_TYPE_COLORS[curation.sectionType] || "bg-gray-100 text-gray-800"}`}>
                        {SECTION_TYPE_LABELS[curation.sectionType] || curation.sectionType}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${curation.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {curation.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                  {curation.subtitle && <p className="text-sm text-gray-500 mb-1">{curation.subtitle}</p>}
                  <p className="text-xs text-gray-400">{getSectionInfo(curation)}</p>
                </div>

                <div className="flex items-center gap-1 px-3 border-l border-gray-100">
                  {/* 상품 관리 버튼 (상품 기반 섹션만) */}
                  {["featured_grid", "product_carousel", "product_showcase"].includes(curation.sectionType || "") && (
                    <button onClick={() => openProductsModal(curation)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="상품 관리">
                      <Package className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEditModal(curation)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="수정">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(curation.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="삭제">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 생성/수정 모달 */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCuration ? "섹션 수정" : "섹션 추가"} size="lg"
        footer={<><ModalCancelButton onClick={() => setModalOpen(false)} /><ModalConfirmButton type="submit" onClick={() => { document.getElementById("curation-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }}>{editingCuration ? "수정" : "추가"}</ModalConfirmButton></>}
      >
        <form id="curation-form" onSubmit={handleSubmit} className="space-y-5">
          {/* 섹션 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">섹션 타입</label>
            <select value={formSectionType} onChange={(e) => { setFormSectionType(e.target.value); setDestinations([]); setCountries([]); setTabs([]); }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
              {SECTION_TYPES.map((st) => (<option key={st.value} value={st.value}>{st.label}</option>))}
            </select>
            {formSectionType && SECTION_DESCRIPTIONS[formSectionType] && (
              <p className="mt-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded">{SECTION_DESCRIPTIONS[formSectionType]}</p>
            )}
          </div>

          {/* 제목 + 부제 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" required placeholder="예: 추천 골프투어" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부제</label>
              <input type="text" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="예: 보령항공여행사가 엄선한 인기 투어" />
            </div>
          </div>

          {/* ===== 섹션 타입별 설정 UI ===== */}

          {/* 여행지 캐러셀 */}
          {formSectionType === "destinations_carousel" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">여행지 목록</label>
                <button type="button" onClick={addDestination} className="text-sm text-blue-600 hover:text-blue-700">+ 여행지 추가</button>
              </div>
              <div className="space-y-3">
                {destinations.map((dest, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    {dest.image && (
                      <img src={dest.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="flex-1 space-y-2">
                      <input type="text" value={dest.name} onChange={(e) => updateDestination(idx, "name", e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="여행지 이름 (예: 나트랑)" />
                      <input type="url" value={dest.image} onChange={(e) => updateDestination(idx, "image", e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="이미지 URL" />
                      <input type="text" value={dest.link} onChange={(e) => updateDestination(idx, "link", e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="링크 (예: /tours?destination=나트랑)" />
                    </div>
                    <button type="button" onClick={() => removeDestination(idx)} className="p-1 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {destinations.length === 0 && <p className="text-sm text-gray-400 text-center py-4">여행지를 추가해주세요</p>}
              </div>
            </div>
          )}

          {/* 지구본 국가 */}
          {formSectionType === "globe" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">국가 목록</label>
                <button type="button" onClick={addCountry} className="text-sm text-blue-600 hover:text-blue-700">+ 국가 추가</button>
              </div>
              <div className="space-y-3">
                {countries.map((country, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input type="text" value={country.name} onChange={(e) => updateCountry(idx, "name", e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="국가명 (예: 일본)" />
                      <input type="text" value={country.code} onChange={(e) => updateCountry(idx, "code", e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="코드 (예: JP)" />
                      <input type="text" value={country.description} onChange={(e) => updateCountry(idx, "description", e.target.value)} className="col-span-2 px-3 py-1.5 border border-gray-300 rounded text-sm" placeholder="설명 (예: 규슈, 오키나와 등 온천 골프투어)" />
                    </div>
                    <button type="button" onClick={() => removeCountry(idx)} className="p-1 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {countries.length === 0 && <p className="text-sm text-gray-400 text-center py-4">국가를 추가해주세요</p>}
              </div>
            </div>
          )}

          {/* 상품 쇼케이스 탭 */}
          {formSectionType === "product_showcase" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">탭 필터</label>
                <button type="button" onClick={addTab} className="text-sm text-blue-600 hover:text-blue-700">+ 탭 추가</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-gray-50 border rounded-lg px-2 py-1">
                    <input type="text" value={tab} onChange={(e) => updateTab(idx, e.target.value)} className="w-20 px-2 py-1 border-0 bg-transparent text-sm focus:outline-none" placeholder="탭 이름" />
                    <button type="button" onClick={() => removeTab(idx)} className="text-gray-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {tabs.length === 0 && <p className="text-sm text-gray-400">탭을 추가하세요 (예: 전체, 일본, 태국)</p>}
              </div>
            </div>
          )}

          {/* 신뢰 CTA */}
          {formSectionType === "trust_cta" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 문구</label>
                <textarea value={ctaDescription} onChange={(e) => setCtaDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="보령항공여행사와 함께 최고의 골프 여행을 경험하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input type="text" value={ctaPhone} onChange={(e) => setCtaPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="1588-0320" />
              </div>
            </div>
          )}

          {/* 순서 + 활성화 */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
              <input type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" min="0" />
              <p className="text-xs text-gray-400 mt-1">작을수록 먼저 표시</p>
            </div>
            <div className="flex items-end pb-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-700">활성화</span>
                <button type="button" onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formIsActive ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${formIsActive ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* 상품 관리 모달 */}
      <Modal isOpen={productsModalOpen && !!managingCuration} onClose={() => setProductsModalOpen(false)} title={`상품 관리: ${managingCuration?.title || ""}`} size="xl"
        footer={<><div className="flex-1 text-sm text-gray-600">선택: {selectedProductIds.length}개</div><ModalCancelButton onClick={() => setProductsModalOpen(false)} /><ModalConfirmButton onClick={handleSaveProducts}>저장</ModalConfirmButton></>}
      >
        {productsLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
        ) : (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="상품명 또는 여행지로 검색..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            {selectedProductIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-2">선택된 상품 ({selectedProductIds.length}개)</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProductIds.map((pid) => {
                    const product = allProducts.find((p) => p.id === pid);
                    return product ? (
                      <span key={pid} className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 rounded text-xs border border-blue-200">
                        {product.title}
                        <button type="button" onClick={() => toggleProductSelection(pid)} className="text-blue-400 hover:text-red-500 ml-1">x</button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">{productSearch ? "검색 결과 없음" : "등록된 상품 없음"}</div>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <label key={product.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleProductSelection(product.id)} className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.title}</h4>
                        <p className="text-xs text-gray-500">{product.destination} · {product.basePrice ? `${product.basePrice.toLocaleString()}원` : "가격 문의"}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
