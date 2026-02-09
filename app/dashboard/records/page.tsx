"use client";

import {
  Paper,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import React, { useEffect, useState } from "react";

type ProductRow = {
  name: string;
  quantity: number;
};

type RecordRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  products_given_by: string;
  date_collected: string;
  sites: string[];
  products: ProductRow[];
};

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchRecords = async () => {
    const params = new URLSearchParams();
    if (employeeId) params.append("employee_id", employeeId);
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);

    const res = await fetch(`/api/records?${params.toString()}`);
    const data = await res.json();
    setRecords(data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const FILTER_THEME_COLOR = "#F6821F";

  const filterTextFieldSx = {
    "& .MuiOutlinedInput-root": {
      height: "40px",
      borderRadius: "10px",
      fontSize: "14px",

      "& fieldset": {
        borderColor: "#ccc",
      },
      "&:hover fieldset": {
        borderColor: FILTER_THEME_COLOR,
      },
      "&.Mui-focused fieldset": {
        borderColor: FILTER_THEME_COLOR,
        borderWidth: "2px",
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: "13px",
      top: "-6px",
    },

    "& .MuiInputLabel-shrink": {
      color: FILTER_THEME_COLOR,
      fontWeight: 500,
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        View Records
      </Typography>

      {/* Filters */}
      <Box display="flex" marginTop={5} gap={2} flexWrap="wrap" mb={3}>
        <TextField
          label="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          sx={filterTextFieldSx}
        />

        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={filterTextFieldSx}
        />

        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={filterTextFieldSx}
        />

        <Button
          variant="contained"
          onClick={fetchRecords}
          sx={{ height: "40px", backgroundColor: FILTER_THEME_COLOR }}
        >
          Apply Filters
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            setEmployeeId("");
            setFromDate("");
            setToDate("");
            fetchRecords();
          }}
          sx={{
            height: "40px",
            borderColor: FILTER_THEME_COLOR,
            color: FILTER_THEME_COLOR,
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Parent Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <b>Employee</b>
            </TableCell>
            <TableCell>
              <b>Products Given By</b>
            </TableCell>
            <TableCell>
              <b>Date</b>
            </TableCell>
            <TableCell>
              <b>Sites</b>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {records.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No records found
              </TableCell>
            </TableRow>
          )}

          {records.map((r) => (
            <React.Fragment key={r.id}>
              {/* Parent Row */}
              <TableRow>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setOpenRow(openRow === r.id ? null : r.id)}
                  >
                    {openRow === r.id ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>

                <TableCell>
                  {r.employee_id} – {r.employee_name}
                </TableCell>

                <TableCell>{r.products_given_by}</TableCell>

                <TableCell>{formatDate(r.date_collected)}</TableCell>

                <TableCell>
                  {Array.isArray(r.sites) ? r.sites.join(", ") : "-"}
                </TableCell>
              </TableRow>

              {/* Child Row */}
              <TableRow>
                <TableCell colSpan={5} sx={{ p: 0 }}>
                  <Collapse in={openRow === r.id} timeout="auto" unmountOnExit>
                    <Box sx={{ m: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <b>Product</b>
                            </TableCell>
                            <TableCell>
                              <b>Quantity</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {Array.isArray(r.products) &&
                          r.products.length > 0 ? (
                            r.products.map((p) => (
                              <TableRow key={`${r.id}-${p.name}`}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.quantity}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} align="center">
                                No products
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
