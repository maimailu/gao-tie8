/* ============================================================
   首頁（.hero）葉子漂落動態
   - 自給自足：不需要改 CSS，載入這支檔案就會自己加上樣式與葉子
   - 葉子在背景與右下植物「之上」、文字「之下」，不會擋到標題與文案
   - 只用 transform / opacity 做動畫（順暢、省效能）
   - 首頁捲出畫面時自動暫停；分頁在背景時瀏覽器也會自動降速
   - 系統開啟「減少動態效果」時不顯示（與頁面原有的植物搖擺一致）
   要調整感覺，只改下面 CONFIG 即可
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    count: { desktop: 18, mobile: 10 },   // 葉子數量（寬度 < 700px 用 mobile）
    size: { min: 18, max: 40 },          // 葉子寬度 px（手機會自動縮小）
    fall: { min: 11, max: 20 },          // 飄落一趟的秒數（越大越慢）
    sway: { min: 40, max: 110 },         // 左右擺盪幅度 px
    drift: { min: -60, max: 120 },       // 往右下飄的偏移 px（風向）
    opacity: { min: 0.55, max: 0.95 },   // 葉子透明度
    colors: [                            // [葉色, 葉脈色]，配合頁面的青綠與黃色
      ['#ffffff', '#9fd6cf'],
      ['#e4f7e8', '#8cc9ae'],
      ['#bfe8cc', '#6fb897'],
      ['#f7df38', '#c9a800'],
      ['#dff08e', '#9db83a']
    ]
  };

  var hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- 樣式 ---------- */
  var css = [
    '.hero-leaves{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;perspective:700px;opacity:0;transition:opacity 1.6s ease}',
    '.hero-leaves.is-on{opacity:1}',
    '.hero-leaf{position:absolute;top:0;left:var(--x);width:var(--s);height:calc(var(--s)*1.5);will-change:transform,opacity;',
    '  animation:hero-leaf-fall var(--fd) linear var(--dl) infinite}',
    '.hero-leaf i{display:block;width:100%;height:100%;background:var(--img) center/contain no-repeat;transform-origin:50% 30%;',
    '  animation:hero-leaf-sway var(--sd) ease-in-out var(--sdl) infinite alternate}',
    '.hero-leaves.is-paused .hero-leaf,.hero-leaves.is-paused .hero-leaf i{animation-play-state:paused}',
    '@keyframes hero-leaf-fall{',
    '  0%{transform:translate3d(0,-60px,0);opacity:0}',
    '  8%{opacity:var(--o)}',
    '  88%{opacity:var(--o)}',
    '  100%{transform:translate3d(var(--dr),var(--fall),0);opacity:0}}',
    '@keyframes hero-leaf-sway{',
    '  0%{transform:translateX(calc(var(--sw)*-1)) rotateZ(calc(var(--r)*-1)) rotateY(0deg)}',
    '  100%{transform:translateX(var(--sw)) rotateZ(var(--r)) rotateY(160deg)}}'
  ].join('\n');
  var st = document.createElement('style');
  st.setAttribute('data-hero-leaves', '');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 葉子圖（SVG，轉成 data URI）---------- */
  function leafImage(fill, vein) {
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'>" +
      "<path d='M20 2C35 15 39 35 20 58C1 35 5 15 20 2Z' fill='" + fill + "'/>" +
      "<path d='M20 9V56M20 26L12 19M20 36L10 27M20 26L28 19M20 36L30 27' stroke='" + vein + "' stroke-width='1.3' fill='none' stroke-linecap='round'/>" +
      '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  var imgs = CONFIG.colors.map(function (c) { return leafImage(c[0], c[1]); });

  /* ---------- 產生葉子 ---------- */
  var layer = document.createElement('div');
  layer.className = 'hero-leaves';
  layer.setAttribute('aria-hidden', 'true');
  hero.appendChild(layer); // 放在 .hero 最後：蓋過植物圖，但 z-index 低於文字（.hero-left = 2）

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function build() {
    layer.innerHTML = '';
    var mobile = hero.clientWidth < 700;
    var n = mobile ? CONFIG.count.mobile : CONFIG.count.desktop;
    var k = mobile ? 0.75 : 1; // 手機葉子小一點、擺幅小一點
    for (var i = 0; i < n; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'hero-leaf';
      var fd = rnd(CONFIG.fall.min, CONFIG.fall.max);
      var s = leaf.style;
      s.setProperty('--x', rnd(-5, 100).toFixed(1) + '%');
      s.setProperty('--s', (rnd(CONFIG.size.min, CONFIG.size.max) * k).toFixed(1) + 'px');
      s.setProperty('--fd', fd.toFixed(1) + 's');
      s.setProperty('--dl', (-rnd(0, fd)).toFixed(1) + 's'); // 負的延遲：一開始就分散在畫面各處
      s.setProperty('--dr', (rnd(CONFIG.drift.min, CONFIG.drift.max) * k).toFixed(0) + 'px');
      s.setProperty('--sw', (rnd(CONFIG.sway.min, CONFIG.sway.max) * k).toFixed(0) + 'px');
      s.setProperty('--r', rnd(25, 80).toFixed(0) + 'deg');
      s.setProperty('--sd', rnd(2.6, 5.2).toFixed(1) + 's');
      s.setProperty('--sdl', (-rnd(0, 4)).toFixed(1) + 's');
      s.setProperty('--o', rnd(CONFIG.opacity.min, CONFIG.opacity.max).toFixed(2));
      s.setProperty('--img', imgs[i % imgs.length]);
      leaf.appendChild(document.createElement('i'));
      layer.appendChild(leaf);
    }
    layer.style.setProperty('--fall', (hero.offsetHeight + 80) + 'px');
  }
  build();
  requestAnimationFrame(function () { layer.classList.add('is-on'); });

  /* ---------- 視窗大小改變：重算數量與落下距離 ---------- */
  var lastMobile = hero.clientWidth < 700, t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      var m = hero.clientWidth < 700;
      if (m !== lastMobile) { lastMobile = m; build(); }
      else layer.style.setProperty('--fall', (hero.offsetHeight + 80) + 'px');
    }, 200);
  });

  /* ---------- 首頁離開畫面就暫停 ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      layer.classList.toggle('is-paused', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }
})();
