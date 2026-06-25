import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { setReportStatus } from "@/lib/actions/moderation";

export const metadata: Metadata = { title: "Reports · Admin" };

type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  reporter: { username: string | null; display_name: string | null } | null;
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, status, created_at, reporter:profiles!reports_reporter_id_fkey(username, display_name)")
    .order("created_at", { ascending: false });
  const reports = (data ?? []) as unknown as Report[];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Reports</h1>
      <p className="mt-1 text-muted-foreground">User-submitted reports for moderation.</p>

      {reports.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No reports.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.target_type}</span>
                    <span className="block max-w-40 truncate text-xs text-muted-foreground">{r.target_id}</span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">{r.reason || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.reporter?.display_name || r.reporter?.username || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === "open"
                          ? "rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={setReportStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="resolved" />
                        <button className="text-xs text-primary hover:underline">Resolve</button>
                      </form>
                      <span className="text-border">·</span>
                      <form action={setReportStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="dismissed" />
                        <button className="text-xs text-muted-foreground hover:underline">Dismiss</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
