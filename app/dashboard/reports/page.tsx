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
  Snackbar,
  Alert,
  CircularProgress,
  TableContainer,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import React, { useEffect, useState } from "react";

type RecordRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  date_collected: string;
  sites: string[];
  products: { name: string; quantity: number }[];
};

type NotificationState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

export default function ReportsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  const THEME_COLOR = "#F6821F";

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching records:", error);
        showNotification("Failed to load records", "error");
        setIsLoading(false);
      });
  }, []);

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
      showNotification("Please select at least one record", "warning");
      return;
    }

    setIsDownloading(true);

    try {
      const res = await fetch("/api/reports/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordIds: selectedIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate Excel report");
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `stock-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();

      // Clean up
      window.URL.revokeObjectURL(link.href);

      showNotification(
        `Excel report downloaded successfully (${selectedIds.length} record${selectedIds.length > 1 ? "s" : ""})`,
        "success",
      );

      // Optionally clear selection after successful download
      // setSelectedIds([]);
    } catch (error) {
      console.error("Error downloading report:", error);
      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to generate report. Please try again.",
        "error",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Mobile card view component
  const MobileRecordCard = ({ record }: { record: RecordRow }) => {
    const isSelected = selectedIds.includes(record.id);

    return (
      <Card
        sx={{
          mb: 2,
          border: isSelected ? `2px solid ${THEME_COLOR}` : "1px solid #e0e0e0",
          backgroundColor: isSelected ? "#fef5ed" : "#fff",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: 2,
            borderColor: THEME_COLOR,
          },
        }}
        onClick={() => toggleSelect(record.id)}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="start"
            mb={2}
          >
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                {record.employee_id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {record.employee_name}
              </Typography>
            </Box>
            <Checkbox
              checked={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(record.id);
              }}
              sx={{
                color: THEME_COLOR,
                "&.Mui-checked": { color: THEME_COLOR },
              }}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2">
                {new Date(record.date_collected).toLocaleDateString("en-GB")}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {record.sites.join(", ") || "No sites"}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <InventoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Chip
                label={`${record.products.length} product${record.products.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  backgroundColor: THEME_COLOR,
                  color: "#fff",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Stack>
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
        Download Excel Report
      </Typography>

      {/* Loading Progress Bar */}
      {isLoading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            sx={{
              backgroundColor: "#ffe0cc",
              "& .MuiLinearProgress-bar": { backgroundColor: THEME_COLOR },
            }}
          />
        </Box>
      )}

      {/* Download Progress Indicator */}
      {isDownloading && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: "#fff3e0",
            borderRadius: 2,
            border: `1px solid ${THEME_COLOR}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={24} sx={{ color: THEME_COLOR }} />
          <Box flex={1}>
            <Typography variant="body2" fontWeight={600} color={THEME_COLOR}>
              Generating Excel Report...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please wait while we prepare your download
            </Typography>
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
      >
        <Button
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          disabled={isDownloading || selectedIds.length === 0 || isLoading}
          fullWidth={isMobile}
          sx={{
            backgroundColor: THEME_COLOR,
            "&:hover": { backgroundColor: "#e06f14" },
            "&.Mui-disabled": {
              backgroundColor: "#ccc",
              color: "#666",
            },
            py: 1.2,
            px: 3,
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
          onClick={handleDownload}
        >
          {isDownloading
            ? "Generating..."
            : isMobile
              ? `Download (${selectedIds.length})`
              : `Download Selected (${selectedIds.length})`}
        </Button>

        {selectedIds.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              backgroundColor: "#f5f5f5",
              px: 2,
              py: 1,
              borderRadius: 1,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <CheckCircleIcon sx={{ color: THEME_COLOR, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {selectedIds.length} of {records.length} selected
            </Typography>
          </Box>
        )}

        {!isMobile && selectedIds.length > 0 && (
          <Button
            variant="text"
            size="small"
            onClick={() => setSelectedIds([])}
            sx={{ color: "text.secondary", ml: "auto" }}
          >
            Clear Selection
          </Button>
        )}
      </Box>

      {/* Mobile Card View */}
      {isMobile && !isLoading && (
        <Box>
          {records.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
              }}
            >
              <InventoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1">No records available</Typography>
            </Box>
          ) : (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {records.length} record{records.length !== 1 ? "s" : ""} found
                </Typography>
                <Button
                  size="small"
                  onClick={selectAll}
                  sx={{ color: THEME_COLOR }}
                >
                  {selectedIds.length === records.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </Box>
              {records.map((r) => (
                <MobileRecordCard key={r.id} record={r} />
              ))}
            </>
          )}
        </Box>
      )}

      {/* Desktop/Tablet Table View */}
      {!isMobile && !isLoading && (
        <TableContainer
          sx={{ maxHeight: "calc(100vh - 300px)", overflowX: "auto" }}
        >
          <Table size={isTablet ? "small" : "medium"} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ backgroundColor: "#fff" }}>
                  <Checkbox
                    checked={
                      selectedIds.length === records.length &&
                      records.length > 0
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < records.length
                    }
                    onChange={selectAll}
                    sx={{
                      color: THEME_COLOR,
                      "&.Mui-checked": { color: THEME_COLOR },
                      "&.MuiCheckbox-indeterminate": { color: THEME_COLOR },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Employee</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Date</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Sites</b>
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fff" }}>
                  <b>Products</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <InventoryIcon
                      sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      No records available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    selected={selectedIds.includes(r.id)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#fef5ed !important",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#fef5ed !important",
                      },
                    }}
                    onClick={() => toggleSelect(r.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: THEME_COLOR,
                          "&.Mui-checked": { color: THEME_COLOR },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {r.employee_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.employee_name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {new Date(r.date_collected).toLocaleDateString("en-GB")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                        {r.sites.join(", ") || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={r.products.length}
                        size="small"
                        sx={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: 500,
                          minWidth: 40,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
