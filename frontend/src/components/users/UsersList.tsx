"use client";

import  { useState } from "react";
import {  useSelector } from "react-redux";
import { DataGrid, GridColDef, GridRowSelectionModel, GridCallbackDetails } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { RootState } from "../../redux/store";
import Loader from "@/loader/Loader";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", minWidth: 150, flex: 1 },
  { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
  { field: "teamLead", headerName: "Team Lead", minWidth: 130, flex: 1 },
  { field: "totalTasks", headerName: "Total Tasks", minWidth: 130, flex: 1 },
  { field: "incompletedTasks", headerName: "Incompleted Tasks", minWidth: 130, flex: 1 },
  { field: "completedTasks", headerName: "Completed Tasks", minWidth: 130, flex: 1 },
  { field: "team", headerName: "Team", minWidth: 130, flex: 1 },
  { field: "role", headerName: "Role", minWidth: 130, flex: 1 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable({ onSelect }: { onSelect: (ids: string[]) => void }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { user: users, loading, error } = useSelector(
    (state: RootState) => state.createUser
  );


  const rows = Array.isArray(users)
  ? users.map((user: any) => {
      const allTasks = user.tasks?.allTasks || 0;
      const completedTasks = user.tasks?.completedTasks || 0;
      const incompletedTasks = user.tasks?.incompleteTasks || 0;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        teamLead: user.teamLead || "N/A",
        totalTasks: allTasks,
        incompletedTasks: incompletedTasks,
        completedTasks: completedTasks,
        team: user.team || "N/A",
        role: user.role,
      };
    })
  : [];





  const handleRowSelection = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    if (!rowSelectionModel || rowSelectionModel.length === 0) {
      onSelect([]);
      setSelectedUser(null);
      return;
    }

    const selectedId = rowSelectionModel[0];
    const user = users.find((u: any) => u._id === selectedId);

    if (user && user._id) {
      setSelectedUser(user);
      onSelect(rowSelectionModel as string[]);
    } else {
      console.error("User _id is missing");
    }
  };

  return (
    <div className="relative z-10">
      <Paper sx={{ height: "auto", width: "100%", p: 1 }}>
        {loading && <Loader />}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={handleRowSelection}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeader": {
              whiteSpace: "normal",
              wordWrap: "break-word",
            },
          }}
        />
      </Paper>
    </div>
  );
}
