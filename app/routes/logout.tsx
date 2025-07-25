import { redirect } from "@remix-run/node";
import { authTokenCookie } from "~/utils/session.server";

export const loader = async () => {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize("", {
        maxAge: 0, // Supprime le cookie
      }),
    },
  });
};

export default function LogoutPage() {
  return null;
}
