// Sample data (no backend)
const audits = [
  {
    id: "AUD-1024",
    site: "www.brewhaven-cafe.com",
    date: "2026-09-20",
    status: "Pending",
    step: 0,
  },
  {
    id: "AUD-1019",
    site: "shop.greenleaf-store.in",
    date: "2026-09-12",
    status: "Under Review",
    step: 1,
  },
  {
    id: "AUD-1012",
    site: "app.fitpulse-gym.com",
    date: "2026-09-03",
    status: "Security Testing",
    step: 2,
  },
  {
    id: "AUD-1005",
    site: "www.sharma-legal.in",
    date: "2026-08-18",
    status: "Report Ready",
    step: 4,
  },
];
const badge = {
  Pending: "b-pending",
  "Under Review": "b-review",
  "Security Testing": "b-test",
  "Report Ready": "b-ready",
};
const stages = [
  "Request Submitted",
  "Initial Review",
  "Security Testing",
  "Report Preparation",
  "Report Ready",
];
const $ = (s) => document.querySelector(s);
const page = document.body.dataset.page;
const loggedIn = () => localStorage.getItem("demoUser");

// Navbar + footer
const inApp = [
  "dashboard",
  "audit-request",
  "audit-progress",
  "report",
].includes(page);
const items = inApp
  ? [
      ["dashboard.html", "Dashboard"],
      ["audit-request.html", "Request Audit"],
      ["audit-progress.html", "Track Audit"],
      ["report.html", "Report"],
      ["#logout", "Logout"],
    ]
  : [
      ["index.html", "Home"],
      ["index.html#why", "Why Security"],
      ["index.html#how", "How It Works"],
      ["login.html", "Login"],
      ["register.html", "Get started"],
    ];
document.body.insertAdjacentHTML(
  "afterbegin",
  `<nav class="nav"><div class="wrap"><a class="logo" href="index.html">Shield<span>Check</span></a>
<button class="menu" aria-label="Toggle menu">&#9776;</button><div class="links">${items.map(([h, t]) => `<a href="${h}" class="${h.startsWith(page) ? "on" : ""}">${t}</a>`).join("")}</div></div></nav>`,
);
document.body.insertAdjacentHTML(
  "beforeend",
  `<footer>&copy; 2026 ShieldCheck. College assignment prototype with sample data only.</footer>`,
);
$(".menu").onclick = () => $(".links").classList.toggle("open");
document.querySelectorAll('a[href="#logout"]').forEach(
  (a) =>
    (a.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("demoUser");
      location.href = "index.html";
    }),
);
try {
  if (inApp && !loggedIn()) location.href = "login.html";
} catch (e) {}

// Validation
const rules = {
  email: (v) =>
    /^\S+@\S+\.\S+$/.test(v) || "Enter a valid email like name@example.com.",
  url: (v) =>
    /^https?:\/\/.+\..+/.test(v) ||
    "Enter a full URL starting with http:// or https://.",
  phone: (v) =>
    /^\d{10}$/.test(v.replace(/\D/g, "")) || "Enter a 10-digit phone number.",
  pass: (v) => v.length >= 8 || "Use at least 8 characters.",
};
function validate(form) {
  let ok = true;
  form.querySelectorAll("input,select,textarea").forEach((f) => {
    if (!f.required && !f.dataset.v) return;
    let e = f.parentElement.querySelector(".err");
    if (!e) {
      e = document.createElement("span");
      e.className = "err";
      f.after(e);
    }
    let r = true;
    const v = f.value.trim();
    if (f.required && !v) r = "This field is required.";
    else if (f.dataset.v === "match")
      r =
        v === form.querySelector("#password").value ||
        "Passwords do not match.";
    else if (f.dataset.v && v) r = rules[f.dataset.v](v);
    f.classList.toggle("bad", r !== true);
    e.textContent = r === true ? "" : r;
    if (r !== true) ok = false;
  });
  return ok;
}
document.querySelectorAll("form").forEach((f) =>
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(f)) return;
    if (page === "login") {
      try {
        localStorage.setItem("demoUser", $("#email").value);
      } catch (x) {}
      location.href = "dashboard.html";
    } else {
      if (page === "register") {
        try {
          localStorage.setItem("demoUser", $("#email").value);
        } catch (x) {}
      }
      f.classList.add("hide");
      $("#success").classList.remove("hide");
    }
  }),
);

// Dashboard
if (page === "dashboard") {
  const n = (u) => audits.filter(u).length;
  $("#who").textContent = (loggedIn() || "").split("@")[0] || "there";
  $("#total").textContent = audits.length;
  $("#pend").textContent = n((a) => a.status === "Pending");
  $("#prog").textContent = n((a) =>
    ["Under Review", "Security Testing"].includes(a.status),
  );
  $("#done").textContent = n((a) => a.status === "Report Ready");
  $("#rows").innerHTML = audits
    .map(
      (
        a,
      ) => `<tr><td>#${a.id}</td><td>${a.site}</td><td>${a.date}</td><td><span class="badge ${badge[a.status]}">${a.status}</span></td>
 <td><a class="btn sm" href="${a.status === "Report Ready" ? "report.html" : "audit-progress.html?id=" + a.id}">${a.status === "Report Ready" ? "View report" : "View progress"}</a></td></tr>`,
    )
    .join("");
}

// Audit progress
if (page === "audit-progress") {
  const a =
    audits.find(
      (x) => x.id === new URLSearchParams(location.search).get("id"),
    ) || audits[2];
  $("#biz").textContent = "FitPulse Gym";
  $("#site").textContent = a.site;
  $("#rid").textContent = "#" + a.id;
  $("#sdate").textContent = a.date;
  $("#stat").innerHTML =
    `<span class="badge ${badge[a.status]}">${a.status}</span>`;
  const pct = Math.round((a.step / 4) * 100) || 10;
  setTimeout(() => ($("#fill").style.width = pct + "%"), 100);
  $("#pct").textContent = pct + "% complete";
  $("#tl").innerHTML = stages
    .map(
      (s, i) =>
        `<li class="${i < a.step ? "done" : i === a.step ? "now" : ""}">${s}${i === a.step ? " (current stage)" : ""}</li>`,
    )
    .join("");
}

// Report
if (page === "report") $("#print").onclick = () => window.print();
