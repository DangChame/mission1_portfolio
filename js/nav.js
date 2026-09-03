/* ============================================================
   nav.js — 네비게이션과 스크롤 관련 동작 네 가지
     a. 햄버거 메뉴 토글
     b. 부드러운 스크롤
     c. 맨 위로 가기 버튼 (300px)
     d. 스크롤 시 네비게이션 배경색 변경 (60px)

   상태 흐름 ②  스크롤 → state.scrolled / state.showToTop 변경 → 화면 변경
   ============================================================ */

const header = document.querySelector('#header');
const navToggle = document.querySelector('#navToggle');
const navMenu = document.querySelector('#navMenu');
const toTopButton = document.querySelector('#toTop');

// querySelectorAll은 조건에 맞는 요소를 "전부" 찾아 목록으로 준다.
// 하나만 찾는 querySelector와 다르다.
const navLinks = document.querySelectorAll('.nav__link');

/* ============================================================
   a. 햄버거 메뉴
   ============================================================ */

function renderMenu() {
  // classList.toggle(이름, 조건) 은 조건이 true면 붙이고 false면 뗀다.
  // if문 없이 상태를 그대로 화면에 반영할 수 있다.
  navMenu.classList.toggle('active', state.menuOpen);
  navToggle.classList.toggle('active', state.menuOpen);

  navToggle.setAttribute('aria-expanded', String(state.menuOpen));
  navToggle.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
}

function setMenuOpen(open) {
  state.menuOpen = open;
  renderMenu();
}

navToggle.addEventListener('click', () => {
  setMenuOpen(!state.menuOpen);   // 열려 있으면 닫고, 닫혀 있으면 연다
});

/* ============================================================
   b. 부드러운 스크롤
   실제로 부드럽게 움직이는 건 CSS의 scroll-behavior: smooth 가 한다.
   여기서는 앵커 링크를 누르면 열려 있던 모바일 메뉴를 닫아준다.
   메뉴가 화면을 덮은 채로 이동하면 도착한 자리가 안 보이기 때문이다.
   ============================================================ */

// forEach는 배열(비슷한 것)을 하나씩 돌면서 같은 일을 시킨다.
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

/* ============================================================
   c + d. 스크롤 위치에 따른 변화
   scroll 이벤트는 손가락 한 번 굴릴 때 수십 번 발생한다.
   그래서 여기서는 무거운 일을 하지 않고 상태만 갱신한다.
   ============================================================ */

function renderScroll() {
  // d. 60px 넘게 내려왔으면 헤더에 배경색을 준다
  header.classList.toggle('header--scrolled', state.scrolled);

  // c. 300px 넘게 내려왔으면 맨 위로 버튼을 보여준다
  toTopButton.classList.toggle('visible', state.showToTop);
}

function updateScrollState() {
  // window.scrollY = 지금 위에서부터 몇 px 내려왔는가
  const y = window.scrollY;

  const nextScrolled = y > SCROLL_NAV;
  const nextShowToTop = y > SCROLL_TOP;

  // 값이 그대로면 다시 그릴 필요가 없다.
  // 이 조건이 없으면 스크롤 한 번에 수십 번씩 헛일을 한다.
  if (nextScrolled === state.scrolled && nextShowToTop === state.showToTop) {
    return;
  }

  state.scrolled = nextScrolled;
  state.showToTop = nextShowToTop;
  renderScroll();
}

window.addEventListener('scroll', updateScrollState);

/* 맨 위로 가기 */
toTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* 페이지를 새로고침하면 브라우저가 스크롤 위치를 기억하고 있을 수 있다.
   그래서 처음 한 번은 직접 확인해서 상태를 맞춰준다. */
updateScrollState();
renderMenu();
