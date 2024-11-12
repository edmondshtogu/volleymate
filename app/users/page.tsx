"use client";

import DataTable from "@/components/dataTable/DataTable";
import { GridColDef } from "@mui/x-data-grid/models/colDef/gridColDef";
import Image from "next/image";
import React from "react";
import { userRows } from "@/data/users";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", headerClassName: "bg-slate-400", width: 50 },
  {
    field: "img",
    headerName: "Avatar",
    headerClassName: "bg-slate-400",
    minWidth: 70,
    renderCell: (params) => {
      return (
        <Image
          src={params.row.img || "/volleyball-bot/noavatar.png"}
          width={30}
          height={30}
          alt=""
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
          }}
        />
      );
    },
  },
  {
    field: "fullname",
    type: "string",
    headerName: "Full name",
    headerClassName: "bg-slate-400",
    minWidth: 250,
  },
  {
    field: "username",
    type: "string",
    headerName: "Username",
    headerClassName: "bg-slate-400",
    minWidth: 250,
  },
  {
    field: "email",
    type: "string",
    headerName: "Email",
    headerClassName: "bg-slate-400",
    minWidth: 350,
  },
  {
    field: "verified",
    headerName: "Verified",
    headerClassName: "bg-slate-400",
    minWidth: 150,
    type: "boolean",
  },
];

const Users = () => {
  return (
    <div className="px-[0.313rem] py-5">
      <div className="flex items-center gap-5 mb-5">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <DataTable
        slug="users"
        columns={columns}
        rows={userRows.map((r) => ({
          id: r.id,
          img: r.img,
          fullname: r.info.fullname,
          username: r.info.username,
          email: r.info.email,
          verified: r.info.status === "verified",
        }))}
      />
    </div>
  );
};

export default Users;
