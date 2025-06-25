import { Link } from "@remix-run/react";

type LayoutProps = {
  children: React.ReactNode;
  user: {
    first_name: string;
    last_name: string;
    user_type: "admin" | "expert" | "entrepreneur";
  };
};

export default function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Menu latéral */}
      <aside className="w-64 bg-white border-r p-6 space-y-6 shadow">
        <div className="text-xl font-bold text-blue-800">NUKU</div>
        <div className="text-gray-700">
          <p className="font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm capitalize">{user.user_type}</p>
        </div>

        {/* Menu navigation */}
        <nav className="space-y-2">
          <Link to="/dashboard" className="block text-blue-700 hover:underline">
            Tableau de bord
          </Link>

          {user.user_type === "admin" && (
            <>
              <Link to="/admin/programs" className="block hover:underline">
                Programmes
              </Link>
              <Link to="/admin/validation" className="block hover:underline">
                Validation
              </Link>
              <Link to="/admin/reports" className="block hover:underline">
                Rapports
              </Link>
            </>
          )}

          {user.user_type === "expert" && (
            <>
              <Link to="/expert/modules" className="block hover:underline">
                Mes modules
              </Link>
              <Link to="/expert/feedback" className="block hover:underline">
                Feedback
              </Link>
            </>
          )}

          {user.user_type === "entrepreneur" && (
            <>
              <Link
                to="/entrepreneur/program"
                className="block hover:underline"
              >
                Mon programme
              </Link>
              <Link to="/entrepreneur/calls" className="block hover:underline">
                Appels
              </Link>
            </>
          )}

          <Link
            to="/logout"
            className="block text-red-600 font-medium mt-6 hover:underline"
          >
            Se déconnecter
          </Link>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
