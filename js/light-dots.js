/* ============================================================
   空拍圖「高鐵綻8期」光柱：光點往上漂動
   - 光點從光柱底部的亮點出發，沿著光柱慢慢往上飄、左右輕輕擺動，
     飄到「高鐵綻8期」字樣附近時淡出，然後從底部重新出發
   - 只用 transform / opacity 做動畫（順暢、省效能）
   - 空拍圖捲出畫面時自動暫停；系統開啟「減少動態效果」時不顯示
   - 電腦版與手機版（可左右滑動的那張）各自生成，位置都用「圖片百分比」，
     所以圖片縮放、手機版圖片比較大時，光點都會跟著對準光柱
   要調整位置或感覺，只改下面 CONFIG 即可
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    /* 光柱位置（用空拍圖 pic/env-pic.jpg 的像素量出來的，單位：圖片寬／高的 %）
       換了別張空拍圖或光柱位置變了，改這三個數字 */
    beamX: 41.15,       // 光柱中心離圖片左邊 %
    startY: 62.5,       // 光點出發的高度（光柱底部亮點）離圖片上邊 %
    endY: 33,           // 光點飄到的最高處（字樣下方）離圖片上邊 %

    count: 24,          // 光點數量
    spread: 0.8,        // 出發時離光柱中心的左右範圍（圖片寬的 %，±）
    size: { min: 5, max: 12 },      // 光點大小 px
    rise: { min: 6, max: 11 },      // 飄一趟的秒數（越大越慢）
    sway: { min: 5, max: 16 },      // 左右擺動幅度 px
    opacity: { min: 0.75, max: 1 }
  };

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var wraps = document.querySelectorAll('.env-glow-wrap');
  if (!wraps.length) return;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  wraps.forEach(function (wrap) {
    var layer = wrap.querySelector('.env-glow');
    var img = wrap.querySelector('img');
    if (!layer || !img) return;

    /* 產生光點：延遲用負數，一進頁面就已經散在光柱各處 */
    for (var i = 0; i < CONFIG.count; i++) {
      var d = document.createElement('i');
      var dur = rnd(CONFIG.rise.min, CONFIG.rise.max);
      var s = d.style;
      s.setProperty('--x', (CONFIG.beamX + rnd(-CONFIG.spread, CONFIG.spread)).toFixed(2) + '%');
      s.setProperty('--y', (CONFIG.startY + rnd(-0.8, 0.8)).toFixed(2) + '%');
      s.setProperty('--s', rnd(CONFIG.size.min, CONFIG.size.max).toFixed(1) + 'px');
      s.setProperty('--d', dur.toFixed(2) + 's');
      s.setProperty('--dl', (-rnd(0, dur)).toFixed(2) + 's');
      s.setProperty('--sw', (rnd(CONFIG.sway.min, CONFIG.sway.max) * (Math.random() < 0.5 ? -1 : 1)).toFixed(1) + 'px');
      s.setProperty('--o', rnd(CONFIG.opacity.min, CONFIG.opacity.max).toFixed(2));
      layer.appendChild(d);
    }

    /* 圖片實際高度（px）→ 設成 --rise：光點要往上飄多遠 */
    function measure() {
      var h = wrap.getBoundingClientRect().height || img.getBoundingClientRect().height;
      if (h) layer.style.setProperty('--rise', (h * (CONFIG.startY - CONFIG.endY) / 100).toFixed(1) + 'px');
    }
    measure();
    if (img.complete === false) img.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(wrap);
    else window.addEventListener('resize', measure);

    /* 捲出畫面就暫停 */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          layer.classList.toggle('is-paused', !en.isIntersecting);
        });
      }, { threshold: 0 }).observe(wrap);
    }
  });
})();
