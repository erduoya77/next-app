# 项目组件结构说明

本项目使用了组织良好的组件结构，遵循关注点分离原则，将组件按照功能和用途进行分类。

## 组件目录结构

```
app/components/
  ├── layout/         # 页面布局相关组件
  │   ├── Sidebar.jsx # 侧边栏组件
  │   └── ...
  │
  ├── posts/          # 文章相关组件
  │   ├── PostCard.jsx  # 文章卡片
  │   ├── PostGrid.jsx  # 文章网格
  │   └── ...
  │
  ├── memos/          # 备忘录相关组件
  │   ├── MemoItem.jsx    # 单条备忘录
  │   ├── MemoFilter.jsx  # 备忘录过滤
  │   ├── MemoResources.jsx # 备忘录资源
  │   ├── MemoLoadMore.jsx  # 加载更多
  │   └── MemosClient.jsx   # 备忘录客户端
  │
  ├── ui/             # 通用 UI 组件
  │   ├── Button.jsx        # 按钮组件
  │   ├── Card.jsx          # 卡片组件
  │   ├── ErrorBoundary.jsx # 错误边界
  │   ├── Loading.jsx       # 加载组件
  │   ├── ImagePreview.jsx  # 图片预览
  │   └── ...
  │
  └── _old/           # 旧组件备份（待清理）
```

## 服务目录结构

```
app/services/
  ├── ErrorService.js  # 错误处理服务
  ├── MemosService.js  # 备忘录 API 服务
  └── ...
```

## 样式目录结构

```
app/styles/
  ├── globals.css     # 全局样式
  ├── theme.css       # 主题变量
  └── ...
```

## 组件设计原则

1. **组件分类**: 按功能和用途分类组件
2. **组件封装**: 每个组件都有明确的职责
3. **性能优化**: 使用 `React.memo`, `useMemo` 和 `useCallback` 优化渲染性能
4. **动态导入**: 对大型组件使用 `dynamic import` 优化初始加载
5. **错误处理**: 使用 `ErrorBoundary` 捕获和处理组件错误
6. **统一设计**: 使用统一的设计语言和样式变量

## UI 组件库

项目使用了一组自定义 UI 组件:

- `Button`: 按钮组件，支持多种变体和状态
- `Card`: 卡片容器组件
- `Loading`: 加载指示器
- `ErrorBoundary`: 错误边界组件
- `ImagePreview`: 图片预览组件

## 主题支持

项目支持亮色/暗色主题:

1. 使用 `next-themes` 管理主题切换
2. 定义了 CSS 变量实现主题样式
3. 在 `theme.css` 中集中管理主题变量

## 最佳实践

- 组件使用函数式组件和 React Hooks
- 使用 TypeScript 增强类型安全（TODO）
- 实现响应式设计，支持多种设备
- 采用懒加载和代码分割优化性能
- 使用组件记忆化减少不必要的渲染 