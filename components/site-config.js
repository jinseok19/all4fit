// 사이트 전체 설정 및 네비게이션 구조
export const brand = {
  name: "모두의핏",
  company: "NEXUSCORE",
  tagline: "모든 사람을 위한 체육시설과 프로그램",
  logo: "🏃‍♂️"
};

export const nav = [
  { label: "홈", href: "/" },
  { label: "체육시설", href: "/facilities/" },
  { label: "프로그램", href: "/programs/" },
  { label: "지도자", href: "/coaches/" },
  { label: "바우처", href: "/voucher/" },
  { label: "고객센터", href: "/support/" },
  { label: "소개", href: "/about/" }
];

export const sitemap = [
  {
    title: "서비스",
    links: [
      { label: "체육시설", href: "/facilities/" },
      { label: "프로그램", href: "/programs/" },
      { label: "지도자", href: "/coaches/" },
      { label: "바우처 안내", href: "/voucher/" }
    ]
  },
  {
    title: "고객지원",
    links: [
      { label: "공지사항", href: "/support/notices.html" },
      { label: "FAQ", href: "/support/#faq" },
      { label: "문의하기", href: "/support/#contact" }
    ]
  },
  {
    title: "회사소개",
    links: [
      { label: "소개", href: "/about/" },
      { label: "미션", href: "/about/#mission" },
      { label: "파트너사", href: "/about/#partners" }
    ]
  },
  {
    title: "정책",
    links: [
      { label: "이용약관", href: "/policy/terms.html" },
      { label: "개인정보처리방침", href: "/policy/privacy.html" }
    ]
  }
];

export const routes = {
  "/": { title: "홈", breadcrumb: [{ label: "홈" }] },
  "/facilities/": { title: "체육시설", breadcrumb: [{ label: "홈", href: "/" }, { label: "체육시설" }] },
  "/programs/": { title: "프로그램", breadcrumb: [{ label: "홈", href: "/" }, { label: "프로그램" }] },
  "/coaches/": { title: "지도자", breadcrumb: [{ label: "홈", href: "/" }, { label: "지도자" }] },
  "/voucher/": { title: "바우처", breadcrumb: [{ label: "홈", href: "/" }, { label: "바우처" }] },
  "/support/": { title: "고객센터", breadcrumb: [{ label: "홈", href: "/" }, { label: "고객센터" }] },
  "/about/": { title: "소개", breadcrumb: [{ label: "홈", href: "/" }, { label: "소개" }] },
  "/admin/": { title: "관리자", breadcrumb: [{ label: "홈", href: "/" }, { label: "관리자" }] }
};

export const adminNav = [
  { label: "대시보드", href: "/admin/" },
  { label: "체육시설", href: "/admin/#facilities" },
  { label: "지도자", href: "/admin/#coaches" },
  { label: "프로그램", href: "/admin/#programs" },
  { label: "공지사항", href: "/admin/#notices" },
  { label: "배너", href: "/admin/#banners" },
  { label: "리뷰", href: "/admin/#reviews" }
];
