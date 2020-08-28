
export function timeSplit(string) {
  return string ? string.split(' ')[0] : '暂无'
}

export function fixed(num) {
  return num.toFixed(2)
}

export function withZero(val) {
  if (!val) {
    return '0.00'
  }
  return (val * 1).toFixed(2)
}
