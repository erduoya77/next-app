export const config = {
  site: {
    title: 'erduoya',
    description: '破破烂烂、缝缝补补',
    author: 'erduoya',
    contentPath: 'content',
    postsPerPage: 10,
  },

  directories: [
    {
      name: '搜索',
      path: '/search',
      type: 'link',
      icon: '🔍', // 主菜单图标
    },
    {
      name: '时间轴',
      path: '/timeline',
      type: 'link',
      icon: '⏳',
    },
    {
      name: '碎碎念',
      path: '/memos',
      type: 'link',
      icon: '💭',
    },
    {
      name: '照片墙',
      path: '/gallery',
      type: 'link',
      icon: '🎞️',
    },
    {
      name: '关于',
      path: '/about',
      type: 'link',
      icon: 'ℹ️',
    },
    {
      name: '工具',
      path: '/tools',
      type: 'menu',
      icon: '🛠️',
      children: [
        {
          name: '云盘',
          path: 'https://pan.erduoya.top/d/a00f8f0a429a4114bede/',
          type: 'link',
          icon: '☁️', // 子菜单图标
        },
        {
          name: '监控',
          path: 'https://stats.uptimerobot.com/8x97TZ6H3G',
          type: 'link',
          icon: '📊',
        },
        {
          name: '图床',
          path: 'https://imgse.com/',
          type: 'link',
          icon: '🖼️',
        },
      ],
    },
  ],

  metadata: {
    required: ['title', 'date'],
    optional: ['backImg', 'category', 'tags'],
    defaults: {
      category: 'Uncategorized',
      backImg: '',
      tags: [],
    },
  },

  social: {
    // github: 'https://github.com/erduoya',
    email: 'erduoya77@163.com',
  },

  footer: {
    copyright: '© 2024 个人博客',
    beian: '鄂ICP备20230013号',
  },
};