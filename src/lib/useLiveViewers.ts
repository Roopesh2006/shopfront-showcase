import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLiveViewers(productId: string | null) {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 7) + 3);

  useEffect(() => {
    if (!productId) return;
    const fallback = Math.floor(Math.random() * 7) + 3;
    setCount(fallback);

    const channel = supabase.channel(`product-view:${productId}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const real = Object.keys(state).length;
        setCount(Math.max(real, fallback));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return count;
}
