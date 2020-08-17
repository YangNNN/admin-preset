import ColorThief from 'colorthief'

const rgbToHex = (r, g, b) => [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

export const getColor = (img, hex = true) => {
  try {
    const colorThief = new ColorThief()
    const colors = colorThief.getColor(img)
    return hex ? rgbToHex(...colors) : `rgb(${colors.join(',')})`
  } catch (error) {
    return ''
  }
}
