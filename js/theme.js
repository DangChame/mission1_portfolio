/* ============================================================
   theme.js — 다크 모드
   상태 흐름 ①  토글 클릭 → state.theme 변경 → 화면 전체 색 변경

   색을 하나씩 바꾸지 않는다.
   html 태그의 data-theme 속성만 바꾸면
   style.css의 [data-theme="dark"] 블록이 켜지면서 변수값이 통째로 바뀐다.
   ============================================================ */

const themeButton = document.querySelector('#themeToggle');
const themeIcon = document.querySelector('#themeIcon');

const THEME_KEY = 'portfolio-theme';   // 로컬스토리지에 저장할 때 쓸 이름

/* ---- 그리는 함수: state를 보고 화면을 맞춘다 ---- */
function renderTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  // 지금이 밝은 화면이면 "달"을, 어두운 화면이면 "해"를 보여준다
  themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  themeButton.setAttribute(
    'aria-label',
    state.theme === 'dark' ? '라이트 모드 전환' : '다크 모드 전환'
  );
}

/* ---- 상태를 바꾸는 함수 ---- */
function setTheme(nextTheme) {
  state.theme = nextTheme;

  // 로컬스토리지는 브라우저에 문자열을 저장해두는 공간이다.
  // 새로고침해도 남기 때문에 설정이 유지된다.
  localStorage.setItem(THEME_KEY, nextTheme);

  renderTheme();
}

/* ---- 이벤트 연결 ----
   HTML에 onclick="..." 을 쓰지 않고 여기서 addEventListener로 붙인다.
   화면(HTML)과 동작(JS)을 섞지 않기 위해서다. */
themeButton.addEventListener('click', () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
});

/* ---- 페이지가 열릴 때 한 번 실행 ---- */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved === 'light' || saved === 'dark') {
    // 전에 고른 값이 있으면 그걸 쓴다
    setTheme(saved);
    return;
  }

  // 저장된 값이 없으면 운영체제 설정을 따라간다. (보너스 과제 4)
  // matchMedia는 CSS 미디어 쿼리를 자바스크립트에서 물어보는 함수다.
  const prefersDark =
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  setTheme(prefersDark ? 'dark' : 'light');
}

initTheme();
