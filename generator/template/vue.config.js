'use strict'
const path = require('path')
const config = require('./src/config')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = config.project.name || ''

const port = process.env.port || process.env.npm_config_port || 9527 // dev port

// 如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false, // 是否lint检查
  productionSourceMap: false, // 取消map加快构建
  devServer: {
    port: port, // 端口号
    open: true, // 打开浏览器
    hot: true,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  configureWebpack: {
    name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    externals: {
      'js-cookie': 'Cookies',
      'clipboard': 'ClipboardJS',
      'fuse.js': 'Fuse'
    }
  },
  chainWebpack(config) {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/frame/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/frame/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .end()
  }
}
