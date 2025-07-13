import { isAuthenticated } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import InviteAcceptance from "./InviteAcceptance";
import { getAuthUser } from "@/lib/server/session";

const InvitePage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;
  const loggedIn: boolean = await isAuthenticated();

  if (!loggedIn) {
    redirect(`/login`);
  }

  const currentUser = await getAuthUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Workspace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to join a workspace
          </p>
        </div>
        <InviteAcceptance token={token} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default InvitePage;
