"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-waldgruen px-4 py-2 font-body text-base font-semibold text-white hover:bg-waldgruen-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark"
    >
      Seite drucken
    </button>
  );
}
