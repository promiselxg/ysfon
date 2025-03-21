import { customMessage } from "@/lib/utils/customMessage";
import { cookies } from "next/headers";

export const POST = async () => {
  try {
    const cookieStore = await cookies();

    cookieStore.set("token", "", { expires: new Date(0) });
    cookieStore.set("refreshToken", "", { expires: new Date(0) });

    return new Response("Logged out", { status: 200 });
  } catch (error) {
    return customMessage("Error logging out", {}, 500);
  }
};
