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

  // Hero showcase: rotating course previews
  const car = document.querySelector("[data-carousel]");
  if (car) {
    const slides = [...car.querySelectorAll("[data-slide]")];
    const dots = [...car.querySelectorAll("[data-dot]")];
    let cur = 0;
    let timer = null;
    const show = (n) => {
      cur = n;
      slides.forEach((s, k) => {
        const on = k === n;
        s.hidden = false;
        s.classList.toggle("opacity-0", !on);
        s.classList.toggle("pointer-events-none", !on);
        s.toggleAttribute("inert", !on);
        s.setAttribute("aria-hidden", String(!on));
        const v = s.querySelector("video");
        if (!v) return;
        if (on) {
          if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
          if (!reduceMotion) v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
      dots.forEach((d, k) => {
        const on = k === n;
        d.setAttribute("aria-current", String(on));
        const bar = d.firstElementChild;
        bar.classList.toggle("w-6", on);
        bar.classList.toggle("bg-rose", on);
        bar.classList.toggle("w-2", !on);
        bar.classList.toggle("bg-ink/20", !on);
      });
    };
    const start = () => {
      if (reduceMotion || timer) return;
      timer = setInterval(() => show((cur + 1) % slides.length), 5500);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };
    show(0);
    dots.forEach((d, k) => d.addEventListener("click", () => { show(k); stop(); start(); }));
    car.addEventListener("pointerenter", stop);
    car.addEventListener("pointerleave", start);
    car.addEventListener("focusin", stop);
    car.addEventListener("focusout", start);
    start();
  }

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

  // Copy email (works even when the visitor has no mail app set up)
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("[data-copy-label]");
    const idle = label.textContent;
    let t;
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand("copy"); } catch (e2) {}
        ta.remove();
      }
      label.textContent = ok ? "Copied!" : text;
      clearTimeout(t);
      t = setTimeout(() => { label.textContent = idle; }, 2200);
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
