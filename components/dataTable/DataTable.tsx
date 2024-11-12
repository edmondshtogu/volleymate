"use client";

import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
    columns: GridColDef[];
    rows: object[];
    slug: string;
};

function DataTable(props: Props) {
    const handleDelete = (id: number) => {};
    const actionColumn: GridColDef = {
      field: "action",
      headerName: "Action",
      headerClassName: "bg-slate-400",
      minWidth: 130,
      resizable: false,
      renderCell: (params) => {
        return (
          <div className="flex gap-4">
            {props.slug !== "orders" ? (
              <Link href={`/${props.slug}/${params.row.id}`}>
                <Image
                  src="/volleyball-bot/view.svg"
                  width={20}
                  height={20}
                  alt=""
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </Link>
            ) : (
              <></>
            )}

            <div onClick={() => handleDelete(params.row.id)}>
              <Image
                src="/volleyball-bot/delete.svg"
                width={20}
                height={20}
                alt=""
              />
            </div>
          </div>
        );
      },
    };

    const [innerWidth, setWidth] = useState(0);
    useEffect(() => {
        const onResize = () => {
            const menu = document.getElementById("menu");
            const nav = document.getElementById("nav");
            const width = nav!.offsetWidth - menu!.offsetWidth - 50;
            setWidth(width > 1450 ? 1450 : width);
        };
        onResize();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
      <div className="w-full">
        <DataGrid
          className="bg-slate-400 p-5"
          style={{ width: `${innerWidth}px` }}
          rows={props.rows}
          columns={[...props.columns, actionColumn]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
          sx={{
            ".MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "&.MuiDataGrid-root": {
              border: "none",
            },
          }}
        />
      </div>
    );
}

export default DataTable;
