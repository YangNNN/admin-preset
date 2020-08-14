module.exports = api => {

  api.extendPackage({
    dependencies: {
      "colorthief": "^2.3.2",
      "core-js": "^3.6.5",
      "nprogress": "^0.2.0",
      "path-to-regexp": "^3.2.0",
      "screenfull": "^5.0.2",
      "vue-amap": "^0.5.10",
      "element-ui": "^2.13.2"
    },
    "devDependencies": {
      "svg-sprite-loader": "^5.0.0",
      "svgo-loader": "^2.2.1"
    }
  });
  
}