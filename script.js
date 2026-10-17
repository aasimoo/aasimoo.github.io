// =========================================================
// Резюме Азамата Асилова — анимации
// Всё написано на обычном JavaScript, без библиотек.
// =========================================================

// Сообщаем CSS, что JavaScript работает (тогда включается плавное появление)
document.documentElement.classList.add('js');

// Проверяем, что у человека не включено «уменьшить движение»
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// true на телефонах и планшетах, где нет курсора
const touchOnly = window.matchMedia('(hover: none)').matches;
// широкий экран — там окна превращаются в кнопки меню
const wide = window.matchMedia('(min-width: 861px)');
const root = document.documentElement;


// ---------- 1. Плавное появление блоков при прокрутке ----------
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !calm) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target); // показали один раз — больше не следим
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}


// ---------- 2. Наклон карточек вслед за курсором ----------
if (!calm) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 … 1 по горизонтали
      const py = (e.clientY - r.top) / r.height;   // 0 … 1 по вертикали
      const max = r.width > 400 ? 6 : 12;          // большие карточки наклоняем меньше
      el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      el.style.setProperty('--s', '1.03');
      el.classList.add('is-active');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--s', '1');
      el.classList.remove('is-active');
    });
  });
}


// ---------- 3. Свет на кнопках идёт за курсором ----------
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
});


// ---------- 4. Фото: точки «проявляются» в цветное ----------
// На компьютере — при наведении (это делает CSS), на телефоне — по нажатию
const photo = document.getElementById('photo');
if (photo) {
  photo.addEventListener('click', () => {
    if (touchOnly) photo.classList.toggle('on');
  });
}


// ---------- 5. Клавиши Ctrl + Z ----------
const keyCtrl = document.getElementById('keyCtrl');
const keyZ = document.getElementById('keyZ');
const toast = document.getElementById('toast');

// «Нажимаем» клавишу на экране на короткое время
function press(key) {
  key.classList.add('down');
  setTimeout(() => key.classList.remove('down'), 160);
}
// Показываем подпись под клавишами
function undoToast() {
  toast.textContent = '↶ Отменено! Пробуем ещё раз :)';
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}
if (keyCtrl && keyZ) {
  keyCtrl.addEventListener('click', () => press(keyCtrl));
  keyZ.addEventListener('click', () => { press(keyZ); undoToast(); });

  // Настоящая клавиатура: Ctrl+Z (или Cmd+Z на Mac) нажимает клавиши на сайте
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key === 'Meta') press(keyCtrl);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      press(keyCtrl); press(keyZ); undoToast();
    }
  });
}


// ---------- 6. Объёмные пиксельные значки ----------
// Берём одну пиксельную картинку и кладём 7 её копий друг за другом.
// Передняя — цветная, задние — тёмные: получаются «стенки», как у кубиков.
const SVG_NS = 'http://www.w3.org/2000/svg';
document.querySelectorAll('[data-vox]').forEach((el) => {
  const id = el.dataset.vox;
  const layers = 7;
  const step = 2.4; // расстояние между слоями в пикселях
  for (let i = layers - 1; i >= 0; i--) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'vox__l' + (i > 0 ? ' vox__side' : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.style.transform = `translateZ(${-i * step}px)`;
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + id);
    use.setAttribute('width', '100%');
    use.setAttribute('height', '100%');
    svg.appendChild(use);
    el.appendChild(svg);
  }
});


// ---------- 7. Шуточный диалог: кнопка «Да» не соглашается ----------
const noBtn = document.getElementById('noBtn');
if (noBtn) {
  const answers = ['Ну пожалуйста :)', 'Точно-точно?', 'Лучше написать!'];
  let n = 0;
  noBtn.addEventListener('click', () => {
    noBtn.textContent = answers[n % answers.length];
    n += 1;
    noBtn.classList.remove('btn--shake');
    void noBtn.offsetWidth;            // перезапускаем анимацию дрожания
    noBtn.classList.add('btn--shake');
    clearTimeout(noBtn._t);
    noBtn._t = setTimeout(() => { noBtn.textContent = 'Да'; }, 2200);
  });
}


// ---------- 8. Плакат: слово badly «встаёт на место» ----------
const badly = document.getElementById('badly');
const alignNote = document.getElementById('alignNote');
function setFixed(on) {
  badly.classList.toggle('fixed', on);
  alignNote.textContent = on ? '(fixed ✓)' : '(oops.. the alignment)';
}
if (badly) {
  if ('IntersectionObserver' in window) {
    const po = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setFixed(true), 900); // сначала криво, потом «чиним»
        po.disconnect();
      }
    }, { threshold: 0.6 });
    po.observe(badly);
  }
  // Нажатие снова «ломает» и «чинит» слово
  badly.addEventListener('click', () => setFixed(!badly.classList.contains('fixed')));
}


// ---------- 9. Навыки в окне Paint ----------
const tools = document.querySelectorAll('.tool');
const canvas = document.getElementById('canvas');
function pickTool(tool) {
  tools.forEach((t) => t.classList.toggle('is-on', t === tool));
  document.getElementById('paintName').textContent = tool.dataset.name;
  document.getElementById('paintText').textContent = tool.dataset.text;
  document.getElementById('paintIcon').setAttribute('href', '#' + tool.dataset.icon);
  canvas.classList.toggle('is-learn', tool.classList.contains('tool--learn'));
  // перезапускаем «подпрыгивание» иконки
  const icon = canvas.querySelector('.paint__icon');
  icon.style.animation = 'none';
  void icon.offsetWidth;
  icon.style.animation = '';
}
tools.forEach((t) => {
  t.addEventListener('click', () => pickTool(t));
  t.addEventListener('focus', () => pickTool(t));
  t.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') pickTool(t); });
});


// ---------- 10. Окна превращаются в кнопки меню + движение фона ----------
// Первый экран «закреплён» (CSS: position: sticky). Пока вы листаете вниз,
// каждое окно плавно уменьшается и едет к своей кнопке в меню.
// Когда окно стало размером с кнопку, оно исчезает, а на его месте проявляется кнопка меню.
const nav = document.getElementById('nav');
const navTabs = [...nav.querySelectorAll('.btab')];
const intro = document.getElementById('top');
const stack = intro.querySelector('.stack');
// для каждой кнопки меню — её окно на первом экране
const wins = navTabs.map((t) => stack.querySelector(`.swin[data-for="${t.dataset.for}"]`));
const bgRows = document.querySelectorAll('.bgwords span');

function clamp01(x) { return Math.min(1, Math.max(0, x)); }
function smooth(x) { return x * x * (3 - 2 * x); } // плавное ускорение и торможение

let bases = [];    // где и какого размера окна в обычном состоянии
let targets = [];  // где стоят кнопки меню

// Замеряем исходные размеры (при загрузке и при изменении окна браузера)
function measure() {
  wins.forEach((w) => { w.style.width = ''; w.style.height = ''; w.style.transform = ''; });
  bases = wins.map((w) => ({
    x: w.offsetLeft, y: w.offsetTop, w: w.offsetWidth, h: w.offsetHeight,
    rot: parseFloat(getComputedStyle(w).getPropertyValue('--rot')) || 0, // наклон окна из CSS
  }));
  targets = navTabs.map((t) => t.getBoundingClientRect()); // меню закреплено, его место не меняется
}

function morphOn() { return wide.matches && !calm; }

function onScroll() {
  const vh = window.innerHeight;

  if (morphOn()) {
    const r = intro.getBoundingClientRect();
    const run = r.height - vh;                       // сколько можно листать, пока экран закреплён
    const p = clamp01((-r.top - vh * 0.08) / (run - vh * 0.08));
    root.style.setProperty('--p', p.toFixed(3));
    intro.classList.toggle('on-top', p < 1);

    const sr = stack.getBoundingClientRect();
    wins.forEach((w, i) => {
      // окна стартуют по очереди, с небольшой задержкой
      const e = smooth(clamp01((p - i * 0.07) / (1 - 0.21)));
      const b = bases[i], t = targets[i];
      const x0 = sr.left + b.x, y0 = sr.top + b.y;
      w.style.width = (b.w + (t.width - b.w) * e).toFixed(1) + 'px';
      w.style.height = (b.h + (t.height - b.h) * e).toFixed(1) + 'px';
      // едем к кнопке и одновременно выпрямляемся
      w.style.transform = `translate(${((t.left - x0) * e).toFixed(1)}px, ${((t.top - y0) * e).toFixed(1)}px) rotate(${(b.rot * (1 - e)).toFixed(2)}deg)`;
      w.style.borderRadius = e > 0.6 ? '10px 10px 0 0' : '';
      w.style.setProperty('--fade', Math.max(0, 1 - e * 3).toFixed(3));

      // в самом конце окно меняется местами с настоящей кнопкой меню
      const swap = clamp01((e - 0.9) / 0.1);
      w.style.opacity = (1 - swap).toFixed(3);
      w.style.visibility = swap >= 1 ? 'hidden' : '';
      navTabs[i].style.opacity = swap.toFixed(3);
    });
  } else {
    root.style.setProperty('--p', '1');
    intro.classList.remove('on-top');
    wins.forEach((w) => {
      ['width', 'height', 'transform', 'borderRadius', 'opacity', 'visibility'].forEach((k) => { w.style[k] = ''; });
      w.style.removeProperty('--fade');
    });
    navTabs.forEach((t) => { t.style.opacity = ''; });
  }

  // --- слова на фоне едут в разные стороны ---
  if (!calm) {
    bgRows.forEach((row) => {
      const sec = row.closest('.section').getBoundingClientRect();
      if (sec.bottom < 0 || sec.top > vh) return; // раздел не виден — не считаем
      const progress = (vh - sec.top) / (vh + sec.height); // 0 … 1, пока раздел проезжает экран
      const dir = Number(row.dataset.dir) || 1;
      row.style.setProperty('--shift', ((progress - 0.5) * 320 * dir).toFixed(1) + 'px');
    });
  }
}

// Включаем или выключаем «закреплённый» режим и всё пересчитываем
function setup() {
  document.body.classList.toggle('fly', morphOn());
  measure();
  onScroll();
}

// Пересчитываем не чаще одного раза за кадр
let ticking = false;
function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', setup);
window.addEventListener('load', setup);
if (document.fonts) document.fonts.ready.then(setup); // после загрузки шрифтов размеры кнопок меняются
setup();


// ---------- 11. Подсвечиваем вкладку текущего раздела ----------
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.dataset.nav;
        navTabs.forEach((t) => t.classList.toggle('active', t.dataset.for === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-nav]').forEach((s) => spy.observe(s));
}
