export function scrollToAnliegen() {
  const el = document.getElementById("anliegen");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    const textarea = el.querySelector<HTMLElement>("textarea");
    textarea?.focus({ preventScroll: true });
  }, 300);
}
