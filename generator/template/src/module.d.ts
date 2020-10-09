/**
 * @file 声明文件
 * @author yangshangman
 */

/**
 * 菜单
 */
export interface Menus {
 [index: number]: Menu;
 length: number;
}

export interface Menu {
  muUrl: string;
  sort: number;
  hidden: boolean;
  children: Menu[];
}
