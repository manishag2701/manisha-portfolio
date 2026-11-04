(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Rotating headline word
  const rot = document.querySelector("[data-rotate]");
  if (rot && !reduceMotion) {
    const words = JSON.parse(rot.dataset.rotate);
    let i = 0;
    setInterval(() => {
      rot.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.remove("out");
      }, 350);
    }, 2600);
  }

  // Hero preview video: stay still for reduced-motion users
  document.querySelectorAll("video[data-autoplay]").forEach((v) => {
    if (reduceMotion) v.removeAttribute("autoplay");
    else v.play().catch(() => {});
  });

  // Course cards: load and play the preview only on hover/focus
  document.querySelectorAll("[data-video]").forEach((card) => {
    const v = card.querySelector("video");
    if (!v || reduceMotion) return;
    const start = () => {
      if (!v.src) v.src = v.dataset.src;
      v.play().catch(() => {});
      v.classList.remove("opacity-0");
    };
    const stop = () => {
      v.pause();
      v.classList.add("opacity-0");
    };
    card.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && start());
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", stop);
  });

  // Courses filter
  const filters = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-category]");
  const count = document.querySelector("[data-count]");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.setAttribute("aria-pressed", String(on));
        b.classList.toggle("bg-rose", on);
        b.classList.toggle("border-transparent", on);
        b.classList.toggle("text-ink", on);
      });
      let n = 0;
      items.forEach((el) => {
        const show = f === "all" || el.dataset.category === f;
        el.hidden = !show;
        if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? " course" : " courses");
    });
  });

  // Mobile menu: close on link click, outside click or Escape
  const menu = document.querySelector("details[data-menu]");
  if (menu) {
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) menu.open = false;
    });
    document.addEventListener("click", (e) => {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") menu.open = false;
    });
  }

  root.classList.add("ready");
})();
