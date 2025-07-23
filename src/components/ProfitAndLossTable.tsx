// src/components/ProfitLossTable.tsx
import React, { useState, Fragment, useEffect } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Category, LineItem } from "../services/api";

interface ProfitLossTableProps {
  categories: Category[];
  startDate?: string;
  endDate?: string;
}

const LineItemRow: React.FC<{ lineItem: LineItem }> = ({ lineItem }) => {
  return (
    <TableRow>
      <TableCell />
      <TableCell>{lineItem.originalName}</TableCell>
      <TableCell align="right">
        ${parseFloat(lineItem.value).toFixed(2)}
      </TableCell>
    </TableRow>
  );
};

const CategoryRow: React.FC<{ category: Category }> = ({ category }) => {
  const [open, setOpen] = useState(false);
  const total = parseFloat(category.value);

  return (
    <Fragment>
      <TableRow>
        <TableCell width={48}>
          {category.lineItems.length > 0 && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Typography fontWeight="bold" sx={{ textTransform: "capitalize" }}>
            {category.name.replace(/_/g, " ")}
          </Typography>
        </TableCell>
        <TableCell align="right">${total.toFixed(2)}</TableCell>
      </TableRow>

      {category.lineItems.length > 0 && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box m={1}>
                <Table size="small" aria-label={`${category.name}-details`}>
                  <TableBody>
                    {category.lineItems.map((lineItem) => (
                      <LineItemRow key={lineItem.id} lineItem={lineItem} />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

const ProfitLossTable: React.FC<ProfitLossTableProps> = ({
  categories,
  startDate,
  endDate,
}) => {
  if (!categories || categories.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography>No P&L data available.</Typography>
      </Box>
    );
  }

  // Group categories by type
  const incomeCategories = categories.filter(
    (cat) => cat.categoryType === "income"
  );
  const expenseCategories = categories.filter(
    (cat) => cat.categoryType === "expense"
  );
  const profitCategories = categories.filter(
    (cat) => cat.categoryType === "profit"
  );

  // Calculate totals
  const totalIncome = incomeCategories.reduce(
    (sum, cat) => sum + parseFloat(cat.value),
    0
  );
  const totalExpenses = expenseCategories.reduce(
    (sum, cat) => sum + parseFloat(cat.value),
    0
  );
  const netIncome = totalIncome - totalExpenses;

  return (
    <Stack spacing={2}>
      <Typography variant="h5" gutterBottom>
        Profit & Loss Report
      </Typography>

      {startDate && endDate && (
        <Typography variant="subtitle1" color="text.secondary">
          Period: {startDate} → {endDate}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="profit-loss table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Category</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Income Section */}
            {incomeCategories.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      Income
                    </Typography>
                  </TableCell>
                </TableRow>
                {incomeCategories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <Typography fontWeight="bold">Total Income</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="primary.main">
                      ${totalIncome.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Expenses Section */}
            {expenseCategories.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "error.main" }}
                    >
                      Expenses
                    </Typography>
                  </TableCell>
                </TableRow>
                {expenseCategories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <Typography fontWeight="bold">Total Expenses</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="error.main">
                      ${totalExpenses.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Profit Categories */}
            {profitCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}

            {/* Net Income Summary */}
            <TableRow>
              <TableCell />
              <TableCell>
                <Typography variant="h6" fontWeight="bold">
                  Net Income
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={netIncome >= 0 ? "success.main" : "error.main"}
                >
                  ${netIncome.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ProfitLossTable;
