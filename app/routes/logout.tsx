import type { ActionFunctionArgs } from "@remix-run/node";
import { destroyUserSession } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  return destroyUserSession("/");
}

export async function loader() {
  return destroyUserSession("/");
}