/**
 * @file 模板接口文件
 * @author yangshangman
 */


/**
 * Head
 */
export interface HeadInterface {
  hasTopBar: boolean;
  isSearchExpand: boolean;
  updateConfig(): any;
  initPage(): any;
}

/**
 * 按钮
 */
export interface ButtonInterface {
  text?: string;
  size?: string;
  type?: string;
  icon?: string;
  isShow?: boolean;
  isDisabled?: boolean;
  event?: string;
  [prop: string]: any;
  props?: {
    [prop: string]: any;
  };
}

 /**
 * 列表数据及分页数据
 */
export interface TableData {
  isLoading: boolean; // 是否正在加载
  data: any[]; // 表格当前数据
  currentPage: number; // 当前页码
  pageSize: number; // 每页条数
  pageTotal: number; // 总页数
  sizes: number[];
}

/**
 * 表格实例
 */
export interface TableInstance {
  context: any;
  stickyEl: HTMLDivElement | null;
  stickyBodyEl: HTMLDivElement | null;
  stickyElHeight: number;
  table: TableData;
  updateConfig(): any;
  setTableData(tableData: any): any;
  setScrollLeft(num: number): any;
  search(): any;
  getTableReqParams(): any;
  initPage(): any;
}

/**
 * 操作栏实例
 */
export interface OperateInstance {
  updateConfig(): any;
}

/**
 * 模板内部watches集合
 */
export interface Watches extends Array<any> {
  reflect?: any
}

/**
 * PageModel类
 */
export interface PageManagerInterface {
  context: any; // 组件实例
  useConfig: configInterface;
  containerRef: HTMLDivElement; // 组件根节点
  headManager: HeadInterface;
  searchManager: SearchInterface;
  tableManager: TableInstance;

  reflectionWatches: Watches | null; // 包含 解除监听反射的 数组
  $refs: any; // 组件实例内部组件引用
  [propName: string]: any; // 其它属性
}

/**
 * 搜索接口
 */
export interface SearchInterface {
  exportParams?: any;
  getReqData(): { [prop: string]: any };
  updateConfig(): any;
  initPage(): any;
}

/**
 * 表单接口
 */
export interface FormInstance {
  updateConfig(): any;
  initPage(): any;
}

/**
 * 表单item 接口
 */
export interface FormItemInterface {
  eType?: string;
  label?: string;
  prop?: string;
  col?: { 
    [prop: string]: any; 
  };
  renderFn?: Function;
  prefix?: string | Function;
  suffix?: string | Function;
  props?: {
    [prop: string]: any;
  };
  events?: {
    [prop: string]: Function;
  };
  change?: Function;
  optionsData?: {
    label?: string;
    value?: string;
    list?: any[];
  };
  isDisabled?: boolean;
  isShow?: boolean;
  _reflect?: string;
  _reflectChangeKey?: string;
  [prop: string]: any;
}

export interface TableEls extends Array<TableCellInterface> {
  
}

/**
 * 表格单元渲染
 */
export interface TableCellInterface {
  label?: string;
  prop?: string;
  isShow?: Function;
  renderFn?: Function;
  html?: Function;
  click?: Function;
  children?: TableEls;
}

/**
 * 配置 table operate
 */

export interface configTableOperate {
  isLeft?: boolean
  labelWidth?: string
  els?: ButtonInterface[]
}

/**
 * 配置 接口
 */
export interface configInterface {
  name?: any;
  size?: string;
  url?: string;
  addUrl?: string;
  updUrl?: string;
  delUrl?: string;
  getUrl?: string;
  addMethod?: string;
  updMethod?: string;
  delMethod?: string;
  getMethod?: string;
  delKey?: string;
  [prop: string]: any;
  topBar?: {
    els?: ButtonInterface[];
    [prop: string]: any;
  };
  searchForm?: {
    size?: string;
    labelWidth?: string | number;
    showEls?: number;
    init?: {
      data?: {
        [prop: string]: any;
      }
    },
    els: FormItemInterface[];
    [prop: string]: any;
  };
  table?: {
    operate?: configTableOperate;
    size?: string;
    els?: TableEls;
    [prop: string]: any;
  };
  hasForm?: boolean;
  form?: {
    size?: string;
    labelWidth?: string;
    init?: {
      data?: {
        [prop: string]: any;
      }
    },
    els: FormItemInterface[];
    [prop: string]: any;
  }
}

