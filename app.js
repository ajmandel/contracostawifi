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


  // Members portal mock interactions
  const app = document.querySelector("[data-members-app]");
  if (app){
    const authPanel = app.querySelector("[data-auth-panel]");
    const membersPanel = app.querySelector("[data-members-panel]");
    const resetToggle = app.querySelector("[data-toggle-reset]");
    const resetForm = app.querySelector("[data-reset-form]");
    const emailLogin = app.querySelector("[data-email-login]");
    const nameNode = app.querySelector("[data-member-name]");
    const logoutBtn = app.querySelector("[data-logout]");
    const oauthBtns = app.querySelectorAll("[data-oauth-provider]");
    const chatBtn = app.querySelector("[data-chat-launch]");

    const logIn = (displayName) => {
      if (nameNode) nameNode.textContent = displayName;
      if (authPanel) authPanel.classList.add("hidden");
      if (membersPanel) membersPanel.classList.remove("hidden");
    };

    oauthBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const provider = btn.getAttribute("data-oauth-provider") || "OAuth";
        logIn(`${provider} member`);
      });
    });

    if (emailLogin){
      emailLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = new FormData(emailLogin);
        const email = (form.get("email") || "Member").toString();
        const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        logIn(name || "Member");
      });
    }

    if (resetToggle && resetForm){
      resetToggle.addEventListener("click", () => {
        resetForm.classList.toggle("hidden");
      });
    }

    if (resetForm){
      resetForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = resetForm.querySelector("input[name='reset_email']");
        const value = email && email.value ? email.value : "your e-mail";
        window.alert(`Password reset link sent to ${value}.`);
        resetForm.classList.add("hidden");
      });
    }

    if (logoutBtn){
      logoutBtn.addEventListener("click", () => {
        if (membersPanel) membersPanel.classList.add("hidden");
        if (authPanel) authPanel.classList.remove("hidden");
      });
    }

    if (chatBtn){
      chatBtn.addEventListener("click", () => {
        window.alert("On-call security expert chat is opening (demo).");
      });
    }
  }

  // UTM capture + persistence (works on static sites)
  try {
    const params = new URLSearchParams(window.location.search || "");
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    let any = false;
    const payload = {};
    keys.forEach(k => {
      const v = params.get(k);
      if (v) { payload[k]=v; any=true; }
    });
    if (any){
      payload["landing_page"] = window.location.href;
      localStorage.setItem("ccwifi_utm", JSON.stringify(payload));
    }
    // Fill hidden fields on contact page
    const stored = localStorage.getItem("ccwifi_utm");
    const data = stored ? JSON.parse(stored) : {};
    const form = document.querySelector("form[action^='https://formspree.io/']");
    if (form){
      keys.concat(["landing_page","referrer"]).forEach(k => {
        const input = form.querySelector(`input[name='${k}']`);
        if (!input) return;
        if (k === "referrer"){
          input.value = document.referrer || "";
          return;
        }
        if (k === "landing_page"){
          input.value = (data[k] || window.location.href);
          return;
        }
        input.value = data[k] || "";
      });
    }
  } catch (e) {}

})();