/* ============================================================
   projects.js — GitHub API로 저장소 목록을 가져와 카드로 그린다

   상태 흐름 ③  API 호출 → state.projects.status 변경 → Projects 섹션 변경
   상태 흐름 ④  필터 버튼 클릭 → state.filter 변경 → 보이는 카드 목록 변경

   status는 네 가지뿐이고, 그리는 함수는 status를 보고
   무엇을 보여줄지 하나만 고른다. 이 구조 덕분에
   "로딩 중인데 에러도 같이 보이는" 이상한 화면이 나올 수 없다.
   ============================================================ */

const projectList = document.querySelector('#projectList');
const projectFilters = document.querySelector('#projectFilters');

const API_URL =
  'https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=100';

/* ------------------------------------------------------------
   글자를 그대로 보여주기 위한 함수

   아래에서 innerHTML을 쓰는데, innerHTML은 넣은 글자를 HTML로 해석한다.
   저장소 설명에 < 나 > 가 들어 있으면 태그로 오해해서 화면이 깨진다.
   그래서 그런 글자를 안전한 형태로 바꿔준다.
   ------------------------------------------------------------ */
function escapeHtml(text) {
  const box = document.createElement('div');
  box.textContent = text;      // textContent는 해석하지 않고 글자 그대로 넣는다
  return box.innerHTML;        // 다시 꺼내면 안전하게 바뀌어 있다
}

/* ------------------------------------------------------------
   그리는 함수 1 — 필터 버튼
   ------------------------------------------------------------ */
function renderFilters() {
  // 성공했을 때만 필터를 보여준다
  if (state.projects.status !== 'success') {
    projectFilters.innerHTML = '';
    return;
  }

  // map으로 언어만 뽑고, filter로 값이 없는 것(null)을 걸러낸다.
  const languages = state.projects.items
    .map((repo) => repo.language)
    .filter((language) => language !== null);

  // Set은 같은 값을 한 번만 담는 상자다. 중복 언어를 없애려고 쓴다.
  // ... 는 Set을 다시 배열로 펼치는 문법이다.
  const uniqueLanguages = [...new Set(languages)].sort();

  const options = ['all', ...uniqueLanguages];

  // 템플릿 리터럴(백틱 문자열)로 HTML을 만든다.
  // ${ } 안에는 자바스크립트 값을 그대로 넣을 수 있다.
  projectFilters.innerHTML = options
    .map((option) => {
      const isActive = option === state.filter ? ' active' : '';
      const label = option === 'all' ? '전체' : option;
      return `<button class="filter${isActive}" data-language="${option}">${label}</button>`;
    })
    .join('');   // join으로 배열을 하나의 문자열로 잇는다
}

/* ------------------------------------------------------------
   그리는 함수 2 — 카드 한 장
   구조분해 할당으로 필요한 값만 꺼낸다.
   repo.name, repo.description ... 을 매번 쓰지 않아도 된다.
   ------------------------------------------------------------ */
function projectCard(repo) {
  const {
    name,
    description,
    html_url: url,        // html_url 이라는 이름을 url로 바꿔 받는다
    language,
    stargazers_count: stars,
    forks_count: forks,
  } = repo;

  const safeName = escapeHtml(name);
  const safeDesc = escapeHtml(description || '설명이 없는 저장소입니다.');
  const langTag = language
    ? `<span class="project__lang">${escapeHtml(language)}</span>`
    : '';

  return `
    <article class="card project">
      <div class="project__top">
        <h3 class="project__name">
          <a href="${url}" target="_blank" rel="noopener noreferrer">${safeName}</a>
        </h3>
        ${langTag}
      </div>
      <p class="project__desc">${safeDesc}</p>
      <div class="project__meta">
        <span>★ ${stars}</span>
        <span>Fork ${forks}</span>
      </div>
    </article>
  `;
}

/* ------------------------------------------------------------
   그리는 함수 3 — Projects 섹션 전체
   status 하나만 보고 무엇을 그릴지 정한다.
   ------------------------------------------------------------ */
function renderProjects() {
  const { status, items, error } = state.projects;

  if (status === 'loading') {
    projectList.innerHTML = `
      <div class="status">
        <div class="spinner"></div>
        <p>로딩 중...</p>
      </div>
    `;
    return;
  }

  if (status === 'error') {
    projectList.innerHTML = `
      <div class="status">
        <p class="status__title">프로젝트를 불러올 수 없습니다</p>
        <p>${escapeHtml(error)}</p>
        <button class="button button--primary button--small status__retry"
                id="retryButton">다시 시도</button>
      </div>
    `;
    // 방금 만든 버튼이라 지금 찾아서 이벤트를 붙여야 한다
    document.querySelector('#retryButton')
      .addEventListener('click', loadProjects);
    return;
  }

  if (status === 'empty') {
    projectList.innerHTML = `
      <div class="status">
        <p class="status__title">표시할 프로젝트가 없습니다</p>
        <p>공개된 저장소가 아직 없습니다.</p>
      </div>
    `;
    return;
  }

  /* status === 'success' */

  // 필터가 'all'이면 전부, 아니면 언어가 같은 것만 남긴다
  const visible = state.filter === 'all'
    ? items
    : items.filter((repo) => repo.language === state.filter);

  if (visible.length === 0) {
    projectList.innerHTML = `
      <div class="status">
        <p class="status__title">표시할 프로젝트가 없습니다</p>
        <p>${escapeHtml(state.filter)} 로 만든 저장소가 없습니다.</p>
      </div>
    `;
    return;
  }

  projectList.innerHTML = visible.map(projectCard).join('');
}

/* ------------------------------------------------------------
   상태를 바꾸는 함수들
   ------------------------------------------------------------ */
function setProjects(nextProjects) {
  state.projects = nextProjects;
  renderFilters();
  renderProjects();
}

function setFilter(language) {
  state.filter = language;
  renderFilters();     // 눌린 버튼에 표시를 해야 하니 필터도 다시 그린다
  renderProjects();
}

/* ------------------------------------------------------------
   데이터 가져오기

   async를 붙이면 그 함수 안에서 await를 쓸 수 있다.
   await는 "이 줄이 끝날 때까지 기다렸다가 다음 줄로 가라"는 뜻이다.
   기다리는 동안 브라우저는 멈추지 않고 다른 일을 한다.
   ------------------------------------------------------------ */
async function loadProjects() {
  // 요청을 시작하기 전에 먼저 로딩 상태로 바꾼다.
  // 이래야 사용자가 "누른 게 먹혔나?" 하고 헷갈리지 않는다.
  setProjects({ status: 'loading', items: [], error: '' });

  try {
    const response = await fetch(API_URL);

    // fetch는 404나 403을 받아도 실패로 치지 않는다. 응답을 받긴 받았으니까.
    // 그래서 response.ok를 직접 확인해야 한다.
    if (!response.ok) {
      // 인증 없이 부르면 시간당 60회 제한이 있고, 넘으면 403이 온다
      if (response.status === 403) {
        throw new Error('요청 한도를 넘었습니다. 잠시 뒤에 다시 시도해주세요.');
      }
      if (response.status === 404) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      throw new Error('서버가 ' + response.status + ' 응답을 보냈습니다.');
    }

    const repos = await response.json();   // 받아온 JSON을 객체로 바꾼다

    // 포크한 저장소는 내가 만든 게 아니므로 뺀다
    const myRepos = repos.filter((repo) => repo.fork === false);

    if (myRepos.length === 0) {
      setProjects({ status: 'empty', items: [], error: '' });
      return;
    }

    setProjects({ status: 'success', items: myRepos, error: '' });

  } catch (error) {
    // 네트워크가 끊겼거나 위에서 throw한 경우 여기로 온다
    setProjects({ status: 'error', items: [], error: error.message });
  }
}

/* ------------------------------------------------------------
   필터 버튼 클릭 처리

   버튼은 데이터를 받아온 뒤에 만들어지므로,
   지금 버튼 하나하나에 이벤트를 붙일 수 없다.
   대신 버튼들을 담고 있는 상자에 한 번만 붙여두고,
   클릭이 올라오면 어디서 왔는지 확인한다. (이벤트 위임)
   ------------------------------------------------------------ */
projectFilters.addEventListener('click', (event) => {
  // event.target은 실제로 눌린 요소다
  if (!event.target.classList.contains('filter')) {
    return;   // 버튼이 아닌 빈 곳을 눌렀으면 아무것도 안 한다
  }
  // data-language 속성에 넣어둔 값을 꺼낸다
  setFilter(event.target.dataset.language);
});

/* 페이지가 열리면 바로 불러온다 */
loadProjects();
