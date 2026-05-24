import { useLiveViewers } from "@/lib/useLiveViewers";

export function LiveViewers({ productId }: { productId: string }) {
  const count = useLiveViewers(productId);
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
      </span>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
        {count} {count === 1 ? "person is" : "people are"} viewing this right now
      </span>
    </div>
  );
}
