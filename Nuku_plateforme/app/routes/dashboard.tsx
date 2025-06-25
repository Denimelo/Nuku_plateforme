import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { requireUser } from "~/utils/auth.server";

export const loader = async ({ request }: { request: Request }) => {
  const user = await requireUser(request);
  return json({ user });
};

export default function DashboardPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Layout user={user}>
      <h1 className="text-3xl font-bold mb-4">
        Bienvenue, {user.first_name} {user.last_name}
      </h1>
      <p className="text-gray-700">Type de compte : {user.user_type}</p>
    </Layout>
  );
}
