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
  { label: "지도자", href: "/coaches/" },
  { label: "소개", href: "/about/" }
];

export const sitemap = [
  {
    title: "서비스",
    links: [
      { label: "체육시설", href: "/facilities/" },
      { label: "지도자", href: "/coaches/" }
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
  "/coaches/": { title: "지도자", breadcrumb: [{ label: "홈", href: "/" }, { label: "지도자" }] },
  "/about/": { title: "소개", breadcrumb: [{ label: "홈", href: "/" }, { label: "소개" }] }
};
