/**
 * @file 框架页面内部工具方法
 * @author yangshangman
 */

import { Menu, Menus } from '@/module'

/**
 * 找到一个可用的菜单
 * @param menus
 */
export const findAvailableMenu = function(menus: Menus): Menu | null {
  let result = null
  for (let i = 0; i < menus.length; i++) {
    if (!menus[i].hidden) {
      if (!menus[i].children) {
        result = menus[i]
      } else {
        result = findAvailableMenu(menus[i].children)
      }
      if (result && result.muUrl) {
        break
      }
    }
  }
  return result
}