import { configureStore } from "@reduxjs/toolkit"
import theme from "./features/themeSlice"

const store = configureStore({
  reducer: {
    theme,
  },
})

export default store
