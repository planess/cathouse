import Link from "next/link";





export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex">
        <div className="basis-sm">
            <div>
                <Link href="/admin/migrations">Migrations</Link>
            </div>

            <div>
                <Link href="/admin/roles">Roles</Link>
            </div>
        </div>

        <div>
            {children}
        </div>
    </div>;
}
