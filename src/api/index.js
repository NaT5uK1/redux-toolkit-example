import { color_random as colorRandom } from "../../color-changer/pkg"

export const asyncColorRandom = () => {
  return new Promise((resolve) => {
    resolve(colorRandom())
  })
}

export { color_random as colorRandom } from "../../color-changer/pkg"