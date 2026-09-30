import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { adminListStudents } from "@/lib/data/admin/users";
import UsersClient from "@/components/admin/UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const students = await adminListStudents();

  return (
    <div>
      <AdminHeader title="Students" subtitle={`${students.length} students`} />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto">
        {students.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-text-muted">Nothing here yet. Students appear after they register.</p>
          </Card>
        ) : (
          <UsersClient students={students} />
        )}
      </div>
    </div>
  );
}
