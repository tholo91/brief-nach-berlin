import { formatNumber } from "@/lib/formatNumber";
import type { SubtopicCluster } from "@/lib/internalStats/view";

type SubtopicClustersProps = {
  clusters: SubtopicCluster[];
  categoryLabel: (key: string) => string;
  total: number;
};

/** Oberkategorie als Kopfzeile, darunter die häufigsten Unterthemen als Chips. */
export function SubtopicClusters({ clusters, categoryLabel, total }: SubtopicClustersProps) {
  if (!clusters.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {clusters.map((cluster) => {
        const share = total > 0 ? Math.round((cluster.total / total) * 100) : 0;
        return (
          <li key={cluster.category} className="rounded-lg border border-warmgrau/10 bg-creme/60 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-body text-sm font-semibold text-waldgruen-dark">
                {categoryLabel(cluster.category)}
              </p>
              <p className="shrink-0 font-typewriter text-xs tabular-nums text-warmgrau/60">
                {formatNumber(cluster.total)} · {share} %
              </p>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {cluster.labels.map((item) => (
                <li
                  key={item.label}
                  className="inline-flex items-baseline gap-1.5 rounded-full border border-waldgruen/15 bg-white/80 px-2.5 py-0.5 font-body text-xs text-waldgruen-dark"
                >
                  {item.label}
                  <span className="font-typewriter text-[10px] tabular-nums text-warmgrau/55">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
