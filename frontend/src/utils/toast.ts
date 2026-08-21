// Clean notification helper without emojis

export function toast(message: string, type: "success" | "error" | "warning" | "info" = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  
  // Style according to color system
  let typeClasses = "bg-white text-text-primary border-border";
  if (type === "success") {
    typeClasses = "bg-white text-eco-forest border-eco-green/45 bg-eco-green/5";
  } else if (type === "error") {
    typeClasses = "bg-white text-carbon-critical border-carbon-critical/30 bg-carbon-critical/5";
  } else if (type === "warning") {
    typeClasses = "bg-white text-carbon-alert border-carbon-alert/30 bg-carbon-alert/5";
  } else if (type === "info") {
    typeClasses = "bg-white text-air-clean border-air-clean/30 bg-air-clean/5";
  }

  toastEl.className = `px-4 py-3 rounded-lg border text-xs font-semibold shadow-md pointer-events-auto min-w-64 max-w-sm transition-all duration-300 transform translate-y-2 opacity-0 flex items-center justify-between ${typeClasses}`;
  toastEl.innerHTML = `
    <span>${message}</span>
    <button class="text-text-muted hover:text-text-primary ml-4 text-[10px] uppercase font-bold tracking-wider">dismiss</button>
  `;

  // Dismiss button click handler
  const dismissBtn = toastEl.querySelector("button");
  dismissBtn?.addEventListener("click", () => {
    toastEl.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toastEl.remove(), 300);
  });

  container.appendChild(toastEl);

  // Trigger animation after render
  requestAnimationFrame(() => {
    toastEl.classList.remove("opacity-0", "translate-y-2");
    toastEl.classList.add("opacity-100", "translate-y-0");
  });

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toastEl.remove(), 300);
  }, 4000);
}
