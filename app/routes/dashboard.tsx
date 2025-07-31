import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);

  // Redirection automatique selon le type d'utilisateur
  switch (user.user_type) {
    case "admin":
      return redirect("/admin/dashboard");
    case "expert":
      return redirect("/expert/dashboard");
    case "entrepreneur":
      return redirect("/entrepreneur/dashboard");
    default:
      return redirect("/");
  }
}

export default function Dashboard() {
  // Cette page ne devrait jamais s'afficher grâce aux redirections
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirection en cours...</h1>
      </div>
    </div>
  );
}