"use client";

import { TextField, Autocomplete, Chip } from "@mui/material";
import { useEffect, useState } from "react";

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
  quantity: number;
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
        quantity: selectedProducts.find((p) => p.id === v.id)?.quantity || 1,
      })),
    );
  };

  const handleSubmit = async () => {
    const errors = [];

    if (!employee) {
      errors.push("Employee ID is required");
    }
    if (!dateCollected) {
      errors.push("Date Collected is required");
    }
    if (!productsGivenBy.trim()) {
      errors.push("Products Given By is required");
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
          employee_id: employee?.employee_id,
          dateCollected: dateCollected,
          productsGivenBy: productsGivenBy,
          site_ids: selectedSites.map((s) => s.id),
          products: selectedProducts.map((p) => ({
            id: p.id,
            quantity: p.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.message || "Failed to save record"}`);
        return;
      }

      alert("Record added successfully");

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

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "24px",
        width: "100%",
        minHeight: "100vh",
        borderRadius: "0",
        boxShadow: "none",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "20px",
          marginTop: "0",
          color: "#333",
        }}
      >
        Add Stock Record
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Employee ID and Name Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
          }}
        >
          {/* Employee ID */}
          <div style={{ flex: 1 }}>
            <Autocomplete
              options={employees}
              getOptionLabel={(e) => e.employee_id}
              value={employee}
              isOptionEqualToValue={(option, value) =>
                option.employee_id === value.employee_id
              }
              onChange={(_, v) => setEmployee(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee ID"
                  required
                  sx={textFieldSx}
                />
              )}
            />
          </div>

          {/* Employee Name */}
          <div style={{ flex: 1 }}>
            <TextField
              label="Employee Name"
              value={employee?.name || ""}
              disabled
              fullWidth
              sx={textFieldSx}
            />
          </div>
        </div>

        {/* Date and Products Given By Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
          }}
        >
          {/* Date Collected */}
          <div style={{ flex: 1 }}>
            <TextField
              type="date"
              label="Date Collected"
              value={dateCollected}
              onChange={(e) => setDateCollected(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              sx={textFieldSx}
            />
          </div>

          {/* Products Given By */}
          <div style={{ flex: 1 }}>
            <TextField
              label="Products Given By"
              value={productsGivenBy}
              onChange={(e) => setProductsGivenBy(e.target.value)}
              fullWidth
              sx={textFieldSx}
            />
          </div>
        </div>

        {/* Sites */}
        <div>
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
                    {...tagProps}
                    sx={{
                      backgroundColor: THEME_COLOR,
                      color: "#fff",
                      fontWeight: 500,

                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255, 255, 255, 0.85)", // visible but not harsh
                      },
                      "& .MuiChip-deleteIcon:hover": {
                        color: "#fff", // full white on hover
                      },
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Sites" sx={textFieldSx} />
            )}
          />
        </div>

        {/* Products */}
        <div>
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
                    {...tagProps}
                    sx={{
                      backgroundColor: THEME_COLOR,
                      color: "#fff",
                      fontWeight: 500,
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
              <TextField {...params} label="Products" sx={textFieldSx} />
            )}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              style={{
                flex: "1 1 calc(25% - 16px)", // 4 per row
                minWidth: "180px", // responsive safety
              }}
            >
              <TextField
                type="number"
                label={`${p.name} Quantity`}
                value={p.quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 1) return;

                  setSelectedProducts((prev) =>
                    prev.map((x) =>
                      x.id === p.id ? { ...x, quantity: value } : x,
                    ),
                  );
                }}
                inputProps={{
                  min: 1,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                fullWidth
                sx={{
                  ...textFieldSx,
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    { display: "none" },
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                }}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={
              !employee ||
              !dateCollected ||
              !productsGivenBy.trim() ||
              selectedSites.length === 0 ||
              selectedProducts.length === 0
            }
            style={{
              backgroundColor:
                !employee ||
                !dateCollected ||
                !productsGivenBy.trim() ||
                selectedSites.length === 0 ||
                selectedProducts.length === 0
                  ? "#cccccc"
                  : "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor:
                !employee ||
                !dateCollected ||
                !productsGivenBy.trim() ||
                selectedSites.length === 0 ||
                selectedProducts.length === 0
                  ? "not-allowed"
                  : "pointer",
              width: "100%",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              const isDisabled =
                !employee ||
                !dateCollected ||
                !productsGivenBy.trim() ||
                selectedSites.length === 0 ||
                selectedProducts.length === 0;
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "#1565c0";
              }
            }}
            onMouseOut={(e) => {
              const isDisabled =
                !employee ||
                !dateCollected ||
                !productsGivenBy.trim() ||
                selectedSites.length === 0 ||
                selectedProducts.length === 0;
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "#1976d2";
              }
            }}
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
}
