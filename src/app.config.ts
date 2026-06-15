export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/publish/index',
    'pages/search/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/chat/index',
    'pages/subscription/index',
    'pages/report/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A90E2',
    navigationBarTitleText: '校园失物招领',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#4A90E2',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
