export type SectionLink = { id: string; label: string };

/** Sprungleiste, bleibt oben kleben und scrollt auf dem Handy horizontal. */
export function SectionNav({ links }: { links: SectionLink[] }) {
  return (
    <nav
      aria-label="Abschnitte"
      className="sticky top-0 z-30 -mx-5 border-b border-warmgrau/10 bg-creme/90 px-5 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((link) => (
          <li key={link.id} className="shrink-0">
            <a
              href={`#${link.id}`}
              className="block rounded-full px-3 py-1.5 font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] text-warmgrau/65 transition-colors hover:bg-white hover:text-waldgruen-dark focus:outline-none focus:ring-2 focus:ring-waldgruen/30"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
