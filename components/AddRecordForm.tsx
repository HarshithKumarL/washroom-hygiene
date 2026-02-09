"use client";

import {
  TextField,
  Autocomplete,
  Chip,
  Container,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";

type Employee = {
  employee_id: string;
  name: string;
};

type Option = {
  id: string;
  name: string;
};

type SelectedProduct = {
  id: string;
  name: string;
  quantity: number | "";
};

export default function AddRecordForm() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [dateCollected, setDateCollected] = useState("");
  const [productsGivenBy, setProductsGivenBy] = useState("");
  const [selectedSites, setSelectedSites] = useState<Option[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const THEME_COLOR = "#F6821F";

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& fieldset": {
        borderColor: "#ccc",
      },
      "&:hover fieldset": {
        borderColor: THEME_COLOR,
      },
      "&.Mui-focused fieldset": {
        borderColor: THEME_COLOR,
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#555",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: THEME_COLOR,
      fontWeight: 500,
    },
    "& .MuiInputLabel-shrink": {
      color: THEME_COLOR,
      fontWeight: 500,
    },
  };

  // Load master data
  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/sites").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([emp, sites, products]) => {
      setEmployees(emp);
      setSites(sites);
      setProducts(products);
    });
  }, []);

  const handleProductsChange = (_: any, values: Option[]) => {
    setSelectedProducts(
      values.map((v) => ({
        id: v.id,
        name: v.name,
        quantity: selectedProducts.find((p) => p.id === v.id)?.quantity || "",
      })),
    );
  };

  const handleQuantityChange = useCallback(
    (productId: string, quantity: number | "") => {
      setSelectedProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity } : p)),
      );
    },
    [],
  );

  // Prevent negative numbers and non-digits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Command+A
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  // Fixed: Proper typing for text input
  const handleQuantityInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    productId: string,
  ) => {
    const value = e.target.value;
    // Only allow empty, 0-9
    if (value === "" || /^\d*$/.test(value)) {
      const numValue = value === "" ? "" : parseInt(value);
      handleQuantityChange(productId, numValue);
    }
  };

  const handleSubmit = async () => {
    const errors = [];

    if (!employee) errors.push("Employee ID is required");
    if (!dateCollected) errors.push("Date Collected is required");
    if (!productsGivenBy.trim()) errors.push("Products Given By is required");
    if (selectedSites.length === 0)
      errors.push("At least one site is required");
    if (selectedProducts.length === 0)
      errors.push("At least one product is required");

    // Validate quantities are numbers
    const invalidProducts = selectedProducts.filter(
      (p) => p.quantity === "" || p.quantity === null,
    );
    if (invalidProducts.length > 0) {
      errors.push("Please enter quantities for all products");
    }

    if (errors.length > 0) {
      alert("Please fill all required fields:\n\n" + errors.join("\n"));
      return;
    }

    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee!.employee_id,
          dateCollected: dateCollected,
          productsGivenBy: productsGivenBy,
          site_ids: selectedSites.map((s) => s.id),
          products: selectedProducts.map((p) => ({
            id: p.id,
            quantity: Number(p.quantity), // Convert to number for API
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.message || "Failed to save record"}`);
        return;
      }

      alert("Record added successfully");

      // Reset form
      setEmployee(null);
      setSelectedSites([]);
      setSelectedProducts([]);
      setDateCollected("");
      setProductsGivenBy("");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Error saving record. Please try again.");
    }
  };

  const isSubmitDisabled =
    !employee ||
    !dateCollected ||
    !productsGivenBy.trim() ||
    selectedSites.length === 0 ||
    selectedProducts.length === 0 ||
    selectedProducts.some((p) => p.quantity === "");

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          backgroundColor: "#ffffff",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: "600",
            marginBottom: "20px",
            marginTop: "0",
            color: "#333",
            textAlign: isXs ? "center" : "left",
          }}
        >
          Add Stock Record
        </h2>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          {/* Employee Row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            <Autocomplete
              options={employees}
              getOptionLabel={(e) => e.employee_id}
              value={employee}
              isOptionEqualToValue={(option, value) =>
                option.employee_id === value?.employee_id
              }
              onChange={(_, v) => setEmployee(v)}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee ID"
                  required
                  sx={textFieldSx}
                />
              )}
            />
            <TextField
              label="Employee Name"
              value={employee?.name || ""}
              disabled
              sx={{ flex: 1, ...textFieldSx }}
            />
          </Box>

          {/* Date and Products Given By Row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            <TextField
              type="date"
              label="Date Collected"
              value={dateCollected}
              onChange={(e) => setDateCollected(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ flex: 1, ...textFieldSx }}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
            />
            <TextField
              label="Products Given By"
              value={productsGivenBy}
              onChange={(e) => setProductsGivenBy(e.target.value)}
              sx={{ flex: 1, ...textFieldSx }}
            />
          </Box>

          {/* Sites */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={sites}
            getOptionLabel={(option) => option.name}
            value={selectedSites}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, v) => setSelectedSites(v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.name}
                    size="small"
                    {...tagProps}
                    sx={{
                      backgroundColor: THEME_COLOR,
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255, 255, 255, 0.85)",
                      },
                      "& .MuiChip-deleteIcon:hover": {
                        color: "#fff",
                      },
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sites *"
                required
                sx={textFieldSx}
              />
            )}
          />

          {/* Products */}
          <Autocomplete
            multiple
            options={products}
            getOptionLabel={(o) => o.name}
            value={selectedProducts}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={handleProductsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.name}
                    size="small"
                    {...tagProps}
                    sx={{
                      backgroundColor: THEME_COLOR,
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255,255,255,0.85)",
                      },
                      "& .MuiChip-deleteIcon:hover": {
                        color: "#fff",
                      },
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Products *"
                required
                sx={textFieldSx}
              />
            )}
          />

          {/* Product Quantities */}
          {selectedProducts.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {selectedProducts.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    flexBasis: {
                      xs: "100%",
                      sm: "calc(50% - 8px)",
                      md: "calc(25% - 12px)",
                    },
                    maxWidth: {
                      xs: "100%",
                      sm: "calc(50% - 8px)",
                      md: "calc(25% - 12px)",
                    },
                  }}
                >
                  <TextField
                    type="text"
                    label={`${p.name} Quantity`}
                    value={p.quantity === 0 ? "" : p.quantity}
                    onChange={(e) =>
                      handleQuantityInput(
                        e as React.ChangeEvent<HTMLInputElement>,
                        p.id,
                      )
                    }
                    onKeyDown={handleKeyDown}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "\\d*",
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      ...textFieldSx,
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Submit Button */}
          <Box
            component="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            sx={{
              backgroundColor: isSubmitDisabled
                ? "#cccccc !important"
                : "#1976d2 !important",
              color: "white",
              border: "none",
              p: 2,
              borderRadius: 1,
              fontSize: "1rem",
              fontWeight: 500,
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              width: "100%",
              transition: "all 0.3s ease",
              mt: 1,
              "&:hover": {
                backgroundColor: isSubmitDisabled
                  ? "#cccccc !important"
                  : "#1565c0 !important",
              },
              textTransform: "none",
            }}
          >
            Save Record
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
