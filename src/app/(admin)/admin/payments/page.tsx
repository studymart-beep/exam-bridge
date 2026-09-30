import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  adminListPayments,
  getReceiptSignedUrl,
} from "@/lib/data/admin/payments";
import PaymentActions from "@/components/admin/PaymentActions";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await adminListPayments();
  const pending = payments.filter((p) => p.status === "pending").length;

  const withUrls = await Promise.all(
    payments.map(async (p) => {
      let receiptHref = p.receipt_url;
      if (p.receipt_url && !p.receipt_url.startsWith("http")) {
        const signed = await getReceiptSignedUrl(p.receipt_url);
        if (signed) receiptHref = signed;
      }
      return { ...p, receiptHref };
    })
  );

  return (
    <div>
      <AdminHeader title="Payments" subtitle={`${pending} pending`} />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-3">
        {withUrls.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">Nothing here yet.</p>
          </Card>
        ) : (
          withUrls.map((p) => (
            <Card key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{p.student_name || p.receipt_name || "Student"}</p>
                <p className="text-xs text-text-muted">
                  {p.student_email} · ₦{Number(p.amount).toLocaleString()} · {p.method}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(p.created_at).toLocaleString()}
                </p>
                {p.receiptHref && (
                  <a
                    href={p.receiptHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View receipt
                  </a>
                )}
              </div>
              <Badge
                variant={
                  p.status === "approved"
                    ? "success"
                    : p.status === "rejected"
                      ? "error"
                      : "warning"
                }
              >
                {p.status}
              </Badge>
              {p.status === "pending" && <PaymentActions paymentId={p.id} />}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
