import { useSelector, useDispatch } from "react-redux"
import { getRandomColor } from "../features/themeSlice.js"


export default () => {
  const dispatch = useDispatch()
  const { background, foreground, primary } = useSelector(
    (state) => state.theme
  )

  const handleClick = () => {
    dispatch(getRandomColor())
  }

  return (
    <div
      style={{
        backgroundColor: background,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        style={{
          backgroundColor: foreground,
          color: primary,
          borderColor: foreground,
          fontSize: "2rem",
          lineHeight: "2.5rem",
          padding: "10px",
        }}
        onClick={handleClick}
      >
        Change Theme
      </button>
    </div>
  )
}
