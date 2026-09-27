import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  site: "",
  date: "",
  title: "",
  source: "",
  product: "",
  batch: "",
  description: "",
  impact: "",
  severity: "",
  severity_reason: "",
};

const deviationSlice = createSlice({
  name: "deviation",

  initialState,

  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;

      state[field] = value;
    },

    updateDeviation: (state, action) => {
      Object.assign(state, action.payload);
    },

    resetDeviation: () => {
      return initialState;
    },
  },
});

export const {
  updateField,
  updateDeviation,
  resetDeviation,
} = deviationSlice.actions;

export default deviationSlice.reducer;