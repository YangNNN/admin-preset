/**
 * @file 获取element-ui的style标签，重新设置当前主题
 * @author yangshangman
 */
import Cookie from 'js-cookie';

const ORIGINAL_THEME = '#409EFF' // default color

interface themeOptions {
  theme: string;
}

class Theme {
  theme!: string;
  constructor(options: themeOptions) {
    this.theme = options.theme;
  }

  updateTheme(newTheme: string) {
    if (newTheme === this.theme) {
      return
    }
    const themeCluster = this.getThemeCluster(newTheme.replace('#', ''))
    const originalCluster = this.getThemeCluster(this.theme.replace('#', ''))

    const styleElements: any[] = this.getTargetStyleElements()

    styleElements.forEach(style => {
      const { innerText } = style
      if (typeof innerText !== 'string') return
      style.innerText = this.updateStyle(innerText, originalCluster, themeCluster)
    })

    this.theme = newTheme
    Cookie.set('theme', newTheme)
  }

  updateStyle(stylesheet: string, oldCluster: string[], newCluster: string[]) {
    let newStyle = stylesheet
    oldCluster.forEach((color, index) => {
      newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
    })
    return newStyle
  }

  getTargetStyleElements() {
    const styles: any[] = [].slice.call(document.querySelectorAll('style'))
      .filter((style: any) => {
        const text = style.innerText
        return new RegExp(this.theme, 'i').test(text) && !/Chalk Variables/.test(text)
      })
    return styles
  }

  getThemeCluster(theme: string) {
    const tintColor = (color: string, tint: number) => {
      let red: number| string = parseInt(color.slice(0, 2), 16)
      let green: number| string = parseInt(color.slice(2, 4), 16)
      let blue: number| string = parseInt(color.slice(4, 6), 16)

      if (tint === 0) { // when primary color is in its rgb space
        return [red, green, blue].join(',')
      } else {
        red += Math.round(tint * (255 - red))
        green += Math.round(tint * (255 - green))
        blue += Math.round(tint * (255 - blue))

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }
    }

    const shadeColor = (color: string, shade: number) => {
      let red: number| string = parseInt(color.slice(0, 2), 16)
      let green: number| string = parseInt(color.slice(2, 4), 16)
      let blue: number| string = parseInt(color.slice(4, 6), 16)

      red = Math.round((1 - shade) * red)
      green = Math.round((1 - shade) * green)
      blue = Math.round((1 - shade) * blue)

      red = red.toString(16)
      green = green.toString(16)
      blue = blue.toString(16)

      return `#${red}${green}${blue}`
    }

    const clusters = [theme]
    for (let i = 0; i <= 9; i++) {
      clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
    }
    clusters.push(shadeColor(theme, 0.1))
    return clusters
  }


}

const theme = new Theme({ 
  theme: ORIGINAL_THEME
})

export default theme
