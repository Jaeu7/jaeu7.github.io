/* JAEU site — 原生脚本，无依赖 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 主题切换 ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("jaeu-theme", theme);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f4f3ed" : "#08090a");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
  }

  /* ---------- 导航滚动态 ---------- */
  var nav = document.getElementById("nav");

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 进入视口的渐显 ---------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    reveals.forEach(function (el) {
      if (el.closest(".hero")) return;
      io.observe(el);
    });

    /* 首屏内容在开场动画之后错峰浮现 */
    var heroReveals = document.querySelectorAll(".hero .reveal");
    if (heroReveals.length) {
      window.setTimeout(function () {
        heroReveals.forEach(function (el) {
          el.classList.add("is-in");
        });
      }, 820);
    }
  }

  /* ---------- 跟随指针的柔光 ---------- */
  var glow = document.querySelector(".cursor-glow");
  var fine = window.matchMedia("(pointer: fine)").matches;

  if (glow && fine && !reduce) {
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 2;
    var cx = gx;
    var cy = gy;
    var active = false;

    window.addEventListener(
      "pointermove",
      function (e) {
        gx = e.clientX;
        gy = e.clientY;
        if (!active) {
          active = true;
          glow.classList.add("is-on");
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      glow.classList.remove("is-on");
      active = false;
    });

    (function loop() {
      cx += (gx - cx) * 0.08;
      cy += (gy - cy) * 0.08;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 复制邮箱 ---------- */
  var copyBtn = document.getElementById("copy-mail");
  var toast = document.getElementById("mail-toast");

  if (copyBtn) {
    var toastTimer = null;

    function showToast(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add("is-on");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("is-on");
      }, 1800);
    }

    copyBtn.addEventListener("click", function () {
      var mail = copyBtn.dataset.mail || "jaeu07@qq.com";

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = mail;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          showToast("已复制到剪贴板");
        } catch (err) {
          showToast("复制失败，请手动选中");
        }
        document.body.removeChild(ta);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(mail).then(function () {
          showToast("已复制到剪贴板");
        }, fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- 文章阅读进度 ---------- */
  var bar = document.querySelector(".progress");

  if (bar) {
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      bar.style.transform = "scaleX(" + p + ")";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- 年份 ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
