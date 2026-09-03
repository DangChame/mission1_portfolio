/* ============================================================
   animate.js — 스크롤 애니메이션

   화면에 들어온 요소만 스르륵 올라오게 한다.

   scroll 이벤트로 위치를 계속 재는 방법도 있지만,
   그러면 스크롤 한 번에 수십 번씩 계산을 하게 된다.
   Intersection Observer는 브라우저에게
   "이 요소가 화면에 들어오면 알려줘" 하고 맡겨두는 방식이라 훨씬 가볍다.
   ============================================================ */

// 애니메이션을 걸 요소들. HTML에 클래스를 적지 않고 여기서 정한다.
// 자바스크립트가 꺼져 있으면 reveal 클래스가 안 붙으므로
// 내용이 투명한 채로 남지 않고 그냥 다 보인다.
const revealTargets = document.querySelectorAll(
  '.section__title, .about, .skill, .form, .hero__inner'
);

revealTargets.forEach((element) => {
  element.classList.add('reveal');
});

/* Intersection Observer를 만든다.
   첫 번째 인자는 "화면에 들어오면 실행할 함수",
   두 번째 인자는 설정이다.

   threshold: 0.2 는 "요소의 20%가 보이면 들어온 것으로 친다"는 뜻이다.
   0으로 하면 끄트머리만 걸쳐도 시작해서 너무 빠르고,
   1로 하면 요소 전체가 다 보여야 해서 긴 요소는 영영 시작하지 않는다. */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // isIntersecting은 지금 화면 안에 들어와 있는지 여부다
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');

      // 한 번 나타난 요소는 더 볼 필요가 없으므로 감시를 끊는다.
      // 안 끊으면 위아래로 스크롤할 때마다 계속 호출된다.
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: REVEAL_THRESHOLD,
});

// 각 요소를 감시 목록에 넣는다
revealTargets.forEach((element) => {
  revealObserver.observe(element);
});
