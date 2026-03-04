// Small, fast JS: mobile nav, reveal-on-scroll, FAQ accordion, pricing toggle counters.
(function(){
  const burger = document.querySelector("[data-burger]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (burger && panel){
    burger.addEventListener("click", () => {
      const open = panel.getAttribute("data-open") === "true";
      panel.setAttribute("data-open", String(!open));
      panel.style.display = open ? "none" : "block";
      burger.setAttribute("aria-expanded", String(!open));
    });
    // default hidden on load (mobile)
    panel.style.display = "none";
  }

  // Reveal on scroll
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (items.length){
    const io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (e.isIntersecting){
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    }, {threshold: 0.12});
    items.forEach(el => io.observe(el));
  }

  // FAQ accordion
  document.querySelectorAll(".faq .q").forEach(q => {
    q.addEventListener("click", () => {
      const isOpen = q.classList.contains("open");
      // close siblings
      q.parentElement.querySelectorAll(".q.open").forEach(o => o.classList.remove("open"));
      if (!isOpen) q.classList.add("open");
    });
  });

  // Pricing toggle (optional)
  const toggle = document.querySelector("[data-price-toggle]");
  const priceNodes = document.querySelectorAll("[data-price-monthly], [data-price-yearly]");
  if (toggle && priceNodes.length){
    const setMode = (mode) => {
      document.documentElement.setAttribute("data-billing", mode);
      toggle.setAttribute("aria-checked", mode === "yearly" ? "true" : "false");
      const label = document.querySelector("[data-price-label]");
      if (label) label.textContent = mode === "yearly" ? "Billed yearly (save ~15%)" : "Billed monthly";
    };
    setMode("monthly");
    toggle.addEventListener("click", () => {
      const mode = document.documentElement.getAttribute("data-billing") === "monthly" ? "yearly" : "monthly";
      setMode(mode);
      priceNodes.forEach(n => {
        const monthly = n.getAttribute("data-price-monthly");
        const yearly = n.getAttribute("data-price-yearly");
        if (!monthly || !yearly) return;
        n.textContent = (mode === "yearly") ? yearly : monthly;
      });
    });
  }

  // Count-up stats (optional)
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = parseInt(el.getAttribute("data-count") || "0", 10);
    if (!target) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      if (started) return;
      if (entries[0].isIntersecting){
        started = true;
        let cur = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => {
          cur = Math.min(target, cur + step);
          el.textContent = cur.toString();
          if (cur < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, {threshold: 0.5});
    io.observe(el);
  });
})();