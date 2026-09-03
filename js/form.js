/* ============================================================
   form.js — 문의 폼 검증

   상태 흐름 ⑤  폼 입력/제출 → state.form.errors 변경 → 에러 메시지 표시·숨김
   ============================================================ */

const contactForm = document.querySelector('#contactForm');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const formSuccess = document.querySelector('#formSuccess');

/* 이메일 형식을 확인하는 정규식.
   @ 앞뒤에 공백이 아닌 글자가 있고, 뒤쪽에 점이 하나 있는지만 본다.
   완벽한 검사는 아니지만 오타를 걸러내는 데는 충분하다. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* 입력창과 에러 문구 자리를 짝지어 둔다.
   이렇게 묶어두면 아래에서 forEach 한 번으로 셋 다 처리할 수 있다. */
const fields = [
  { key: 'name', input: nameInput, error: document.querySelector('#nameError') },
  { key: 'email', input: emailInput, error: document.querySelector('#emailError') },
  { key: 'message', input: messageInput, error: document.querySelector('#messageError') },
];

/* ------------------------------------------------------------
   검사하는 함수 — 화면은 건드리지 않고 결과만 만들어 돌려준다
   ------------------------------------------------------------ */
function validate() {
  const errors = {};

  // trim()은 앞뒤 공백을 지운다. 공백만 넣고 제출하는 걸 막는다.
  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const messageValue = messageInput.value.trim();

  if (nameValue === '') {
    errors.name = '이름을 입력해주세요.';
  }

  if (emailValue === '') {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(emailValue)) {
    errors.email = '이메일 형식이 올바르지 않습니다.';
  }

  if (messageValue === '') {
    errors.message = '메시지를 입력해주세요.';
  }

  return errors;
}

/* ------------------------------------------------------------
   그리는 함수 — state.form을 보고 화면을 맞춘다
   ------------------------------------------------------------ */
function renderForm() {
  const { errors, success } = state.form;

  fields.forEach((field) => {
    const message = errors[field.key];

    // 에러 문구는 입력창 바로 아래에 둔다.
    // 여기서는 innerHTML이 아니라 textContent를 쓴다.
    // 글자만 넣으면 되고, 사용자가 친 값이 섞일 수도 있어서 더 안전하다.
    field.error.textContent = message ? message : '';

    // 문제가 있는 입력창은 테두리를 빨갛게
    field.input.classList.toggle('invalid', Boolean(message));

    // 색은 눈으로만 보인다. 스크린리더에게도 알려주려면 속성이 필요하다.
    // aria-invalid="true" 는 "이 칸의 값이 잘못됐다"는 뜻이다.
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  });

  formSuccess.textContent = success;
}

/* ------------------------------------------------------------
   상태를 바꾸는 함수
   ------------------------------------------------------------ */
function setFormState(errors, success) {
  state.form.errors = errors;
  state.form.success = success;
  renderForm();
}

/* ------------------------------------------------------------
   제출
   ------------------------------------------------------------ */
contactForm.addEventListener('submit', (event) => {
  // 폼은 기본적으로 제출하면 페이지를 새로고침한다.
  // 그러면 지금까지의 화면 상태가 전부 날아가므로 막는다.
  event.preventDefault();

  const errors = validate();

  // Object.keys는 객체의 키를 배열로 준다. 길이가 0이면 에러가 없다는 뜻이다.
  if (Object.keys(errors).length > 0) {
    setFormState(errors, '');

    // 문제가 있는 첫 번째 칸으로 커서를 옮겨준다.
    // find는 조건에 맞는 첫 번째 항목 하나만 찾아준다.
    const firstBad = fields.find((field) => errors[field.key]);
    firstBad.input.focus();
    return;
  }

  // 통과했을 때
  setFormState({}, '메시지가 전송되었습니다. 곧 답장드리겠습니다.');
  contactForm.reset();   // 입력창을 비운다
});

/* ------------------------------------------------------------
   입력하는 도중 처리

   제출할 때만 검사하면, 에러를 고치고 있는 동안에도
   빨간 글씨가 그대로 남아 있어서 답답하다.
   그래서 input 이벤트로 글자를 칠 때마다 그 칸만 다시 확인한다.
   ------------------------------------------------------------ */
fields.forEach((field) => {
  field.input.addEventListener('input', () => {
    // 아직 한 번도 제출하지 않았으면 잔소리하지 않는다
    if (Object.keys(state.form.errors).length === 0) {
      return;
    }

    const errors = validate();
    setFormState(errors, '');
  });
});
