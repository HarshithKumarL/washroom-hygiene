"use client";

import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  Typography,
  Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";

type RecordRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  date_collected: string;
  sites: string[];
  products: { name: string; quantity: number }[];
};

export default function ReportsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const THEME_COLOR = "#F6821F";

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then(setRecords);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const handleDownload = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one record");
      return;
    }

    const res = await fetch("/api/reports/excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordIds: selectedIds,
        type: "excel", // backend still expects this
      }),
    });

    if (!res.ok) {
      alert("Failed to generate Excel report");
      return;
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "stock-report.xlsx";
    link.click();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Download Excel Report
      </Typography>

      {/* Action */}
      <Box mb={2}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: THEME_COLOR,
            "&:hover": { backgroundColor: "#e06f14" },
          }}
          onClick={handleDownload}
        >
          Download Selected (Excel)
        </Button>
      </Box>

      {/* Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={
                  selectedIds.length === records.length && records.length > 0
                }
                indeterminate={
                  selectedIds.length > 0 && selectedIds.length < records.length
                }
                onChange={selectAll}
                sx={{
                  color: THEME_COLOR,
                  "&.Mui-checked": { color: THEME_COLOR },
                  "&.MuiCheckbox-indeterminate": { color: THEME_COLOR },
                }}
              />
            </TableCell>
            <TableCell>Employee</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Sites</TableCell>
            <TableCell>Products Count</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {records.map((r) => (
            <React.Fragment key={r.id}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    sx={{
                      color: THEME_COLOR,
                      "&.Mui-checked": { color: THEME_COLOR },
                    }}
                  />
                </TableCell>

                <TableCell>
                  {r.employee_id} – {r.employee_name}
                </TableCell>

                <TableCell>
                  {new Date(r.date_collected).toLocaleDateString("en-GB")}
                </TableCell>

                <TableCell>{r.sites.join(", ")}</TableCell>
                <TableCell>{r.products.length}</TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
