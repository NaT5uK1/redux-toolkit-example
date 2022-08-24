import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { colorRandom, asyncColorRandom } from "../api/index"

const themeSlice = createSlice({
  name: "theme",
  initialState: colorRandom(),
  reducers: {
    themeChanged: {
      reducer(state, action) {
        for (let i of Reflect.ownKeys(state)) {
          state[i] = action.payload[i]
        }
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRandomColor.fulfilled, (state, action) => {
      for (let i of Reflect.ownKeys(state)) {
        state[i] = action.payload[i]
      }
    })
  },
})

export const getRandomColor = createAsyncThunk(
  "theme/getRandomColor",
  async () => {
    const response = await asyncColorRandom()
    return response
  }
)

export const { themeChanged } = themeSlice.actions

export default themeSlice.reducer
