export function toHexColor(color: number): string {
  return `#${(color & 0xffffff).toString(16).padStart(6, '0')}`
}

export function toRgbaColor(color: number, alpha: number): string {
  const red = (color >> 16) & 0xff
  const green = (color >> 8) & 0xff
  const blue = color & 0xff

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function toDataUrl(icon: string): string | null {
  if (!icon) return null
  return `data:image/png;base64,${icon}`
}
