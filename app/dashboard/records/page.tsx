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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  LinearProgress,
  CircularProgress,
  useMediaQuery,
  useTheme,
  TableContainer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

type NotificationState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<RecordRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const fetchRecords = async () => {
    setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append("employee_id", employeeId);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      const res = await fetch(`/api/records?${params.toString()}`);
      const data = await res.json();
      setRecords(data);

      if (employeeId || fromDate || toDate) {
        showNotification(
          `Found ${data.length} record${data.length !== 1 ? "s" : ""}`,
          "info",
        );
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      showNotification("Failed to load records", "error");
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleDeleteClick = (record: RecordRow) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/records/${recordToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete record");
      }

      // Remove from local state
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));

      // Close the expanded row if it was open
      if (openRow === recordToDelete.id) {
        setOpenRow(null);
      }

      // Show success notification
      showNotification(
        `Record for ${recordToDelete.employee_name} deleted successfully`,
        "success",
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to delete record. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const handleResetFilters = () => {
    setEmployeeId("");
    setFromDate("");
    setToDate("");
    fetchRecords();
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

  // Mobile Record Card Component
  const MobileRecordCard = ({ record }: { record: RecordRow }) => {
    const isExpanded = openRow === record.id;

    return (
      <Card
        sx={{
          mb: 2,
          border: "1px solid #e0e0e0",
          boxShadow: 1,
          "&:hover": {
            boxShadow: 3,
            borderColor: FILTER_THEME_COLOR,
          },
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="start"
            mb={2}
          >
            <Box flex={1}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                gutterBottom
              >
                {record.employee_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {record.employee_name}
              </Typography>
            </Box>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(record)}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.08)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Details */}
          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2">
                <strong>Given By:</strong> {record.products_given_by}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
              <Typography variant="body2">
                {formatDate(record.date_collected)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="start" gap={1}>
              <LocationOnIcon
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {Array.isArray(record.sites) && record.sites.length > 0
                  ? record.sites.join(", ")
                  : "No sites"}
              </Typography>
            </Box>
          </Stack>

          {/* Products Accordion */}
          <Accordion
            expanded={isExpanded}
            onChange={() => setOpenRow(isExpanded ? null : record.id)}
            sx={{ mt: 2, boxShadow: 0, "&:before": { display: "none" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                minHeight: 40,
                "&.Mui-expanded": { minHeight: 40 },
                "& .MuiAccordionSummary-content": {
                  margin: "8px 0",
                  "&.Mui-expanded": { margin: "8px 0" },
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <InventoryIcon
                  sx={{ fontSize: 18, color: FILTER_THEME_COLOR }}
                />
                <Typography variant="body2" fontWeight={500}>
                  Products ({record.products?.length || 0})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {Array.isArray(record.products) && record.products.length > 0 ? (
                <Stack spacing={1}>
                  {record.products.map((p, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1,
                        backgroundColor: "#fafafa",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">{p.name}</Typography>
                      <Chip
                        label={p.quantity}
                        size="small"
                        sx={{
                          backgroundColor: FILTER_THEME_COLOR,
                          color: "#fff",
                          fontWeight: 600,
                          minWidth: 50,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  No products
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        fontWeight={600}
      >
        View Records
      </Typography>

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "#ffe0cc",
              "& .MuiLinearProgress-bar": {
                backgroundColor: FILTER_THEME_COLOR,
              },
            }}
          />
        </Box>
      )}

      {/* Filtering Progress */}
      {isFiltering && !isLoading && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            backgroundColor: "#fff3e0",
            borderRadius: 2,
            border: `1px solid ${FILTER_THEME_COLOR}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={20} sx={{ color: FILTER_THEME_COLOR }} />
          <Typography
            variant="body2"
            color={FILTER_THEME_COLOR}
            fontWeight={500}
          >
            Applying filters...
          </Typography>
        </Box>
      )}

      {/* Filters */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        flexWrap="wrap"
        mb={3}
        mt={3}
      >
        <TextField
          label="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          sx={{
            ...filterTextFieldSx,
            flex: { xs: "1 1 100%", sm: "1 1 200px" },
          }}
          size={isMobile ? "small" : "medium"}
        />

        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{
            ...filterTextFieldSx,
            flex: { xs: "1 1 100%", sm: "1 1 200px" },
          }}
          size={isMobile ? "small" : "medium"}
        />

        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{
            ...filterTextFieldSx,
            flex: { xs: "1 1 100%", sm: "1 1 200px" },
          }}
          size={isMobile ? "small" : "medium"}
        />

        <Button
          variant="contained"
          onClick={fetchRecords}
          disabled={isFiltering}
          startIcon={
            isFiltering ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FilterListIcon />
            )
          }
          fullWidth={isMobile}
          sx={{
            height: { xs: "36px", sm: "40px" },
            backgroundColor: FILTER_THEME_COLOR,
            "&:hover": { backgroundColor: "#e06f14" },
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
          }}
        >
          {isFiltering ? "Applying..." : "Apply Filters"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleResetFilters}
          disabled={isFiltering}
          fullWidth={isMobile}
          sx={{
            height: { xs: "36px", sm: "40px" },
            borderColor: FILTER_THEME_COLOR,
            color: FILTER_THEME_COLOR,
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
            "&:hover": {
              borderColor: "#e06f14",
              backgroundColor: "rgba(246, 130, 31, 0.04)",
            },
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Records Count */}
      {!isLoading && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            {records.length} record{records.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>
      )}

      {/* Mobile Card View */}
      {isMobile && !isLoading && (
        <Box>
          {records.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <InventoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1">No records found</Typography>
            </Box>
          ) : (
            records.map((r) => <MobileRecordCard key={r.id} record={r} />)
          )}
        </Box>
      )}

      {/* Desktop/Tablet Table View */}
      {!isMobile && !isLoading && (
        <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
          <Table size={isTablet ? "small" : "medium"} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#fff" }} />
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Employee</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Products Given By</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Date</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Sites</b>
                </TableCell>
                <TableCell align="center" sx={{ backgroundColor: "#fff" }}>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <InventoryIcon
                      sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <React.Fragment key={r.id}>
                    {/* Parent Row */}
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRow(openRow === r.id ? null : r.id)
                          }
                        >
                          {openRow === r.id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {r.employee_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.employee_name}
                        </Typography>
                      </TableCell>

                      <TableCell>{r.products_given_by}</TableCell>

                      <TableCell>{formatDate(r.date_collected)}</TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 250 }}
                        >
                          {Array.isArray(r.sites) && r.sites.length > 0
                            ? r.sites.join(", ")
                            : "-"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(r)}
                          title="Delete Record"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Child Row - Products */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse
                          in={openRow === r.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              m: 2,
                              backgroundColor: "#fafafa",
                              borderRadius: 1,
                              p: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              gutterBottom
                            >
                              Products
                            </Typography>
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
                                  r.products.map((p, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{p.name}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={p.quantity}
                                          size="small"
                                          sx={{
                                            backgroundColor: FILTER_THEME_COLOR,
                                            color: "#fff",
                                            fontWeight: 600,
                                          }}
                                        />
                                      </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            minWidth: isMobile ? "100%" : "400px",
            maxWidth: isMobile ? "100%" : "500px",
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6" component="span">
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to permanently delete this record?
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                borderLeft: "4px solid #F6821F",
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Employee:</strong> {recordToDelete?.employee_id} –{" "}
                {recordToDelete?.employee_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Date:</strong>{" "}
                {recordToDelete
                  ? formatDate(recordToDelete.date_collected)
                  : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Products:</strong>{" "}
                {recordToDelete?.products.length || 0} item(s)
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: "#ffebee",
                borderRadius: 1,
                borderLeft: "4px solid #d32f2f",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#d32f2f", fontWeight: 500 }}
              >
                ⚠️ This action cannot be undone.
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              color: "#666",
              borderColor: "#ddd",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#bbb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
            autoFocus
            fullWidth={isMobile}
            startIcon={
              isDeleting ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{
              minWidth: isMobile ? "100%" : "150px",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
        sx={{
          bottom: { xs: 16, sm: 24 },
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: { xs: "90vw", sm: "auto" },
            boxShadow: 3,
            "& .MuiAlert-icon": {
              fontSize: 24,
            },
            "& .MuiAlert-message": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
