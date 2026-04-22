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


  // Members portal authentication + workspace interactions
  const app = document.querySelector("[data-members-app]");
  if (app){
    const authPanel = app.querySelector("[data-auth-panel]");
    const membersPanel = app.querySelector("[data-members-panel]");
    const nameNode = app.querySelector("[data-member-name]");
    const logoutBtn = app.querySelector("[data-logout]");
    const oauthBtns = app.querySelectorAll("[data-oauth-provider]");
    const chatBtn = app.querySelector("[data-chat-launch]");
    const loginForm = app.querySelector("[data-email-login]");
    const registerForm = app.querySelector("[data-register-form]");
    const resetRequestForm = app.querySelector("[data-reset-request-form]");
    const resetConfirmForm = app.querySelector("[data-reset-confirm-form]");
    const tabs = app.querySelectorAll("[data-auth-tab]");
    const views = app.querySelectorAll("[data-auth-view]");
    const status = app.querySelector("[data-auth-status]");

    const USERS_KEY = "ccwifi_members_users";
    const SESSION_KEY = "ccwifi_members_session";
    const LOCK_KEY = "ccwifi_members_lock";

    const setStatus = (message) => { if (status) status.textContent = message; };
    const showView = (viewName) => {
      views.forEach(view => view.classList.toggle("hidden", view.getAttribute("data-auth-view") !== viewName));
      tabs.forEach(tab => tab.classList.toggle("active", tab.getAttribute("data-auth-tab") === viewName));
    };

    const getUsers = () => {
      try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
    };
    const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
    const fromBase64 = (value) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
    const hashPassword = async (password, saltBytes) => {
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt:saltBytes, iterations:120000}, key, 256);
      return toBase64(new Uint8Array(bits));
    };

    const logIn = (displayName, email) => {
      if (nameNode) nameNode.textContent = displayName || "Member";
      localStorage.setItem(SESSION_KEY, JSON.stringify({displayName, email, ts: Date.now()}));
      if (authPanel) authPanel.classList.add("hidden");
      if (membersPanel) membersPanel.classList.remove("hidden");
    };

    const lockState = () => {
      const raw = localStorage.getItem(LOCK_KEY);
      if (!raw) return { count: 0, until: 0 };
      try { return JSON.parse(raw); } catch { return { count: 0, until: 0 }; }
    };
    const updateLock = (success) => {
      const now = Date.now();
      const lock = lockState();
      if (success){
        localStorage.setItem(LOCK_KEY, JSON.stringify({count: 0, until: 0}));
        return;
      }
      const count = (lock.count || 0) + 1;
      const until = count >= 5 ? now + 5 * 60 * 1000 : 0;
      localStorage.setItem(LOCK_KEY, JSON.stringify({count, until}));
    };

    tabs.forEach(tab => tab.addEventListener("click", () => showView(tab.getAttribute("data-auth-tab"))));

    oauthBtns.forEach(btn => btn.addEventListener("click", () => {
      const provider = btn.getAttribute("data-oauth-provider") || "OAuth";
      setStatus(`${provider} OAuth is not enabled yet. Use e-mail auth below.`);
    }));

    if (registerForm){
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = new FormData(registerForm);
        const name = (form.get("name") || "").toString().trim();
        const email = (form.get("email") || "").toString().trim().toLowerCase();
        const password = (form.get("password") || "").toString();
        const users = getUsers();
        if (users.some(u => u.email === email)){
          setStatus("That e-mail is already registered. Please sign in.");
          showView("login");
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await hashPassword(password, salt);
        users.push({email, name, passwordHash: hash, salt: toBase64(salt), createdAt: Date.now(), resetTokens: []});
        saveUsers(users);
        setStatus("Account created. You can sign in now.");
        showView("login");
      });
    }

    if (loginForm){
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const lock = lockState();
        const now = Date.now();
        if (lock.until && now < lock.until){
          const wait = Math.ceil((lock.until - now) / 1000);
          setStatus(`Too many attempts. Try again in ${wait}s.`);
          return;
        }
        const form = new FormData(loginForm);
        const email = (form.get("email") || "").toString().trim().toLowerCase();
        const password = (form.get("password") || "").toString();
        const user = getUsers().find(u => u.email === email);
        if (!user){
          updateLock(false);
          setStatus("No account found for that e-mail.");
          return;
        }
        const candidate = await hashPassword(password, fromBase64(user.salt));
        if (candidate !== user.passwordHash){
          updateLock(false);
          setStatus("Incorrect password. Please try again.");
          return;
        }
        updateLock(true);
        setStatus("Signed in successfully.");
        logIn(user.name || "Member", user.email);
      });
    }

    if (resetRequestForm){
      resetRequestForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = new FormData(resetRequestForm);
        const email = (form.get("email") || "").toString().trim().toLowerCase();
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user){
          setStatus("If that account exists, a reset code has been issued.");
          return;
        }
        const token = Math.random().toString(36).slice(2, 10).toUpperCase();
        const expiresAt = Date.now() + 15 * 60 * 1000;
        user.resetTokens = [{token, expiresAt}];
        saveUsers(users);
        setStatus(`Reset code for demo: ${token} (expires in 15 minutes).`);
        showView("reset-confirm");
      });
    }

    if (resetConfirmForm){
      resetConfirmForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = new FormData(resetConfirmForm);
        const token = (form.get("token") || "").toString().trim().toUpperCase();
        const password = (form.get("password") || "").toString();
        const users = getUsers();
        const now = Date.now();
        const user = users.find(u => Array.isArray(u.resetTokens) && u.resetTokens.some(t => t.token === token && t.expiresAt > now));
        if (!user){
          setStatus("Invalid or expired reset code.");
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        user.salt = toBase64(salt);
        user.passwordHash = await hashPassword(password, salt);
        user.resetTokens = [];
        saveUsers(users);
        setStatus("Password updated. Please sign in.");
        showView("login");
      });
    }

    if (logoutBtn){
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        if (membersPanel) membersPanel.classList.add("hidden");
        if (authPanel) authPanel.classList.remove("hidden");
        setStatus("Signed out.");
      });
    }

    if (chatBtn){
      chatBtn.addEventListener("click", () => {
        window.alert("On-call security expert chat is opening (demo).");
      });
    }

    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (session && session.email){
        logIn(session.displayName || "Member", session.email);
      }
    } catch (_) {}
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