import Single from "@/components/single/Single";
import React from "react";
import { userRows } from "@/data/users";

// The User component to display a single user's data
const User = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const user = userRows.find((user) => user.id === Number(id));

  return (
    <div className="w-full">
      {user ? <Single {...user} /> : <p>User not found</p>}
    </div>
  );
};

export default User;
