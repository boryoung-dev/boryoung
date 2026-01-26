export function KakaoFloating() {
  return (
    <button
      className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAE100] text-[#371D1E] shadow-lg transition-transform hover:scale-105 active:scale-95 border border-black/5"
      aria-label="KakaoTalk Consultation"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="fill-current"
      >
        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
      </svg>
    </button>
  );
}
