import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Stack,
  Typography,
  Button,
  Snackbar,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import ProfitLossTable from "../components/ProfitAndLossTable";
import { apiService, PeriodDate, Category } from "../services/api";

interface Company {
  id: number;
  name: string;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [periodDates, setPeriodDates] = useState<PeriodDate[]>([]);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [loadingPnl, setLoadingPnl] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    console.log(categories);
  }, [categories]);

  // Load period dates on component mount
  useEffect(() => {
    const loadPeriodDates = async () => {
      try {
        setLoading(true);
        setError(null);
        const dates = await apiService.getPeriodDates();
        setPeriodDates(dates);
      } catch (err) {
        setError("Failed to load period dates");
        console.error("Error loading period dates:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPeriodDates();
  }, []);

  // Load P&L data when selected periods change
  useEffect(() => {
    const loadPnlData = async () => {
      if (!selectedPeriodIds) {
        setCategories([]);
        return;
      }

      try {
        setLoadingPnl(true);
        setError(null);

        // Fetch P&L data for the selected period
        const pnlData = await apiService.getPnlData(selectedPeriodIds);
        setCategories(pnlData);
      } catch (err) {
        setError("Failed to load P&L data for the selected periods");
        console.error("Error loading P&L data:", err);
      } finally {
        setLoadingPnl(false);
      }
    };

    loadPnlData();
  }, [selectedPeriodIds]);

  const handleCompanyChange = (event: any) => {
    const companyId = event.target.value;
    setSelectedCompanyId(companyId);
    // Reset period selection when company changes
    setSelectedPeriodIds("");
  };

  const handlePeriodChange = (event: any) => {
    const value = event.target.value;
    setSelectedPeriodIds(value);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await apiService.refreshData();

      if (response.success) {
        setShowSuccessToast(true);
        // Reload period dates after successful refresh
        const dates = await apiService.getPeriodDates();
        setPeriodDates(dates);
        setSelectedPeriodIds("");
      } else {
        setError("Failed to refresh data");
      }
    } catch (err) {
      setError("Failed to refresh data");
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCloseToast = () => {
    setShowSuccessToast(false);
  };

  // Get unique companies from period dates
  const companies: Company[] = Array.from(
    new Map(
      periodDates.map((period) => [period.company.id, period.company])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Filter periods by selected company
  const filteredPeriods = selectedCompanyId
    ? periodDates.filter((period) => period.company.id === selectedCompanyId)
    : periodDates;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header with Refresh Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Profit & Loss Reports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ minWidth: 120 }}
        >
          {refreshing ? <CircularProgress size={20} /> : "Refresh"}
        </Button>
      </Box>

      {/* Company and Period Selectors */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Select Company and Report Period
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel id="company-select-label">Company</InputLabel>
              <Select
                labelId="company-select-label"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                input={<OutlinedInput label="Company" />}
              >
                <MenuItem value="">
                  <em>All Companies</em>
                </MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel id="period-select-label">Period</InputLabel>
              <Select
                labelId="period-select-label"
                value={selectedPeriodIds}
                onChange={handlePeriodChange}
                input={<OutlinedInput label="Period" />}
                disabled={!selectedCompanyId}
              >
                {filteredPeriods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>
                    {period.startDate} → {period.endDate} -{" "}
                    {period.company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* P&L Table */}
      {selectedPeriodIds && (
        <Box>
          {loadingPnl ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <ProfitLossTable
              categories={categories}
              startDate={
                periodDates.find((e) => e.id === selectedPeriodIds)?.startDate
              }
              endDate={
                periodDates.find((e) => e.id === selectedPeriodIds)?.endDate
              }
            />
          )}
        </Box>
      )}

      {!selectedPeriodIds && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography variant="body1" color="text.secondary">
            {!selectedCompanyId
              ? "Please select a company to view available periods"
              : "Please select a period to view P&L data"}
          </Typography>
        </Box>
      )}

      {/* Success Toast */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity="success"
          sx={{ width: "100%" }}
        >
          Data refreshed successfully
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Home;
