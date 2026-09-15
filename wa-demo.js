(function () {
  const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

  const SCRIPT = [
    { type: "date", text: "היום" },
    { type: "msg", role: "customer", text: "היי, איפה ההזמנה שלי?", time: "16:40" },
    { type: "pause", ms: 520 },
    { type: "typing", ms: 980 },
    { type: "msg", role: "bot", text: "בשמחה 😊 אפשר את מספר ההזמנה?", time: "16:40" },
    { type: "pause", ms: 560 },
    { type: "msg", role: "customer", text: "#58421", time: "16:41", dir: "ltr" },
    {
      type: "action",
      loading: "בודק את ההזמנה במערכת...",
      done: "ההזמנה נמצאה במערכת",
      ms: 1200
    },
    { type: "pause", ms: 380 },
    { type: "typing", ms: 820 },
    {
      type: "msg",
      role: "bot",
      time: "16:41",
      html: "מצאתי 😊 ההזמנה יצאה למשלוח ותגיע היום בין <span dir=\"ltr\">16:00–18:00</span>."
    },
    { type: "pause", ms: 1800 },
    { type: "msg", role: "customer", text: "אפשר לשנות את מועד המשלוח למחר?", time: "16:42" },
    { type: "pause", ms: 420 },
    { type: "typing", ms: 760 },
    {
      type: "action",
      loading: "משנה את מועד המשלוח...",
      done: "מועד האספקה עודכן",
      ms: 1050
    },
    { type: "pause", ms: 320 },
    { type: "typing", ms: 700 },
    { type: "msg", role: "bot", text: "בטח. עדכנתי את המשלוח למחר ✅", time: "16:42" },
    { type: "pause", ms: 2400 }
  ];

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia(REDUCE_QUERY).matches);
  }

  function AnimatedWhatsAppDemo(root) {
    this.root = root;
    this.thread = root.querySelector("[data-wa-thread]");
    this.pauseBtn = root.querySelector("[data-wa-pause]");
    this.timers = [];
    this.rafs = [];
    this.runId = 0;
    this.userPaused = false;
    this.offscreen = false;
    this.destroyed = false;
    this.running = false;
    this.reduce = prefersReducedMotion();
    this.onMq = this.onMq.bind(this);
    this.onPauseClick = this.onPauseClick.bind(this);

    if (!this.thread) return;

    this.mq = window.matchMedia(REDUCE_QUERY);
    if (this.mq.addEventListener) this.mq.addEventListener("change", this.onMq);
    else if (this.mq.addListener) this.mq.addListener(this.onMq);

    if (this.pauseBtn) this.pauseBtn.addEventListener("click", this.onPauseClick);

    this.io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      this.offscreen = !entry.isIntersecting;
    }, { threshold: 0.35 });
    this.io.observe(root);

    this.syncMotionMode(true);
  }

  AnimatedWhatsAppDemo.prototype.onMq = function (event) {
    this.reduce = event.matches;
    this.syncMotionMode(false);
  };

  AnimatedWhatsAppDemo.prototype.onPauseClick = function () {
    this.userPaused = !this.userPaused;
    this.syncPauseButton();
  };

  AnimatedWhatsAppDemo.prototype.syncPauseButton = function () {
    if (!this.pauseBtn) return;
    const paused = this.userPaused || this.reduce;
    this.pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
    this.pauseBtn.setAttribute("aria-label", paused ? "הפעלת ההדגמה" : "השהיית ההדגמה");
    this.pauseBtn.hidden = this.reduce;
    this.root.classList.toggle("is-paused", this.userPaused && !this.reduce);
  };

  AnimatedWhatsAppDemo.prototype.syncMotionMode = function (initial) {
    this.stopLoop();
    this.syncPauseButton();
    if (this.reduce) {
      this.renderComplete();
      return;
    }
    this.clearThread();
    if (initial || !this.offscreen) this.playLoop();
  };

  AnimatedWhatsAppDemo.prototype.blocked = function () {
    return this.userPaused || this.offscreen || this.destroyed;
  };

  AnimatedWhatsAppDemo.prototype.sleep = function (ms) {
    const demo = this;
    return new Promise(function (resolve) {
      const timer = {
        resolve: resolve,
        id: window.setTimeout(function () {
          demo.timers = demo.timers.filter(function (item) { return item !== timer; });
          resolve();
        }, ms)
      };
      demo.timers.push(timer);
    });
  };

  AnimatedWhatsAppDemo.prototype.wait = async function (ms) {
    let remaining = ms;
    while (remaining > 0 && !this.destroyed) {
      if (this.blocked()) {
        await this.sleep(80);
        continue;
      }
      const slice = Math.min(remaining, 80);
      await this.sleep(slice);
      if (!this.blocked()) remaining -= slice;
    }
  };

  AnimatedWhatsAppDemo.prototype.clearTimers = function () {
    this.timers.forEach(function (timer) {
      window.clearTimeout(timer.id);
      timer.resolve();
    });
    this.timers = [];
    this.rafs.forEach(function (id) { window.cancelAnimationFrame(id); });
    this.rafs = [];
  };

  AnimatedWhatsAppDemo.prototype.stopLoop = function () {
    this.running = false;
    this.runId += 1;
    this.clearTimers();
  };

  AnimatedWhatsAppDemo.prototype.clearThread = function () {
    this.thread.replaceChildren();
  };

  AnimatedWhatsAppDemo.prototype.scrollToBottom = function () {
    this.thread.scrollTop = this.thread.scrollHeight;
  };

  AnimatedWhatsAppDemo.prototype.reveal = function (el) {
    this.thread.appendChild(el);
    if (this.reduce) {
      el.classList.add("is-visible");
      this.scrollToBottom();
      return;
    }
    void el.getBoundingClientRect();
    el.classList.add("is-visible");
    this.scrollToBottom();
  };

  AnimatedWhatsAppDemo.prototype.setBubbleBody = function (body, step) {
    if (step.html) body.innerHTML = step.html;
    else body.textContent = step.text;
    if (step.dir) body.setAttribute("dir", step.dir);
  };

  AnimatedWhatsAppDemo.prototype.createMessage = function (step) {
    const article = document.createElement("article");
    article.className = "wa-msg wa-msg-" + step.role + " wa-enter";
    const bubble = document.createElement("div");
    bubble.className = "wa-bubble";
    const body = document.createElement("p");
    body.className = "wa-bubble-text";
    this.setBubbleBody(body, step);
    const time = document.createElement("span");
    time.className = "wa-time";
    time.textContent = step.time;
    time.setAttribute("dir", "ltr");
    bubble.appendChild(body);
    bubble.appendChild(time);
    article.appendChild(bubble);
    return article;
  };

  AnimatedWhatsAppDemo.prototype.createDate = function (text) {
    const el = document.createElement("p");
    el.className = "wa-date wa-enter";
    el.textContent = text;
    return el;
  };

  AnimatedWhatsAppDemo.prototype.createTyping = function () {
    const el = document.createElement("div");
    el.className = "wa-msg wa-msg-bot wa-typing wa-enter";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="wa-bubble"><span></span><span></span><span></span></div>';
    return el;
  };

  AnimatedWhatsAppDemo.prototype.createAction = function (step, done) {
    const el = document.createElement("p");
    el.className = "wa-action wa-enter" + (done ? " is-done" : "");
    el.innerHTML =
      '<span class="wa-action-icon" aria-hidden="true"></span>' +
      '<span class="wa-action-label"></span>';
    el.querySelector(".wa-action-label").textContent = done ? step.done : step.loading;
    return el;
  };

  AnimatedWhatsAppDemo.prototype.renderComplete = function () {
    this.clearThread();
    SCRIPT.forEach((step) => {
      if (step.type === "date") this.thread.appendChild(this.createDate(step.text));
      if (step.type === "msg") this.thread.appendChild(this.createMessage(step));
      if (step.type === "action") this.thread.appendChild(this.createAction(step, true));
    });
    Array.prototype.forEach.call(this.thread.children, function (child) {
      child.classList.add("is-visible");
    });
    this.scrollToBottom();
  };

  AnimatedWhatsAppDemo.prototype.isActive = function (runId) {
    return this.running && this.runId === runId && !this.destroyed && !this.reduce;
  };

  AnimatedWhatsAppDemo.prototype.playStep = async function (step, runId) {
    if (step.type === "pause") {
      await this.wait(step.ms);
      return;
    }
    if (step.type === "date") {
      this.reveal(this.createDate(step.text));
      await this.wait(160);
      return;
    }
    if (step.type === "msg") {
      this.reveal(this.createMessage(step));
      return;
    }
    if (step.type === "typing") {
      const typing = this.createTyping();
      this.reveal(typing);
      await this.wait(step.ms);
      if (!this.isActive(runId)) return;
      typing.classList.remove("is-visible");
      typing.classList.add("is-leaving");
      await this.wait(180);
      if (!this.isActive(runId)) return;
      typing.remove();
      return;
    }
    if (step.type === "action") {
      const action = this.createAction(step, false);
      this.reveal(action);
      await this.wait(step.ms);
      if (!this.isActive(runId)) return;
      action.classList.add("is-done");
      action.querySelector(".wa-action-label").textContent = step.done;
      this.scrollToBottom();
    }
  };

  AnimatedWhatsAppDemo.prototype.fadeReset = async function (runId) {
    this.thread.classList.add("is-resetting");
    await this.wait(480);
    if (!this.isActive(runId)) return;
    this.clearThread();
    this.thread.classList.remove("is-resetting");
    await this.wait(220);
  };

  AnimatedWhatsAppDemo.prototype.playLoop = async function () {
    if (this.reduce) return;
    const runId = this.runId + 1;
    this.runId = runId;
    this.running = true;
    while (this.isActive(runId)) {
      for (let i = 0; i < SCRIPT.length; i += 1) {
        if (!this.isActive(runId)) return;
        await this.playStep(SCRIPT[i], runId);
      }
      if (!this.isActive(runId)) return;
      await this.fadeReset(runId);
    }
  };

  AnimatedWhatsAppDemo.prototype.destroy = function () {
    this.destroyed = true;
    this.stopLoop();
    if (this.mq) {
      if (this.mq.removeEventListener) this.mq.removeEventListener("change", this.onMq);
      else if (this.mq.removeListener) this.mq.removeListener(this.onMq);
    }
    if (this.pauseBtn) this.pauseBtn.removeEventListener("click", this.onPauseClick);
    if (this.io) this.io.disconnect();
  };

  const root = document.getElementById("waDemo");
  if (root) window.__waDemo = new AnimatedWhatsAppDemo(root);
})();
