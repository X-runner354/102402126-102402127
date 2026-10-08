# 提交规范与协作流程

本文档约定结对开发过程中的 **Git 提交规范** 与 **协作流程**，保证两人代码可以顺畅合并、历史可追溯。

## 一、分支策略

```
main（主分支，始终保持可运行）
 ├── feat/xxx   功能开发分支
 ├── fix/xxx    缺陷修复分支
 └── docs/xxx   文档分支
```

- `main` 分支只合并经过验证、可正常运行的代码；
- 每位成员从最新 `main` 拉出独立功能分支，开发完成后通过 Pull Request 合并回 `main`；
- 禁止直接在 `main` 上提交。

## 二、Commit Message 规范

采用 **Conventional Commits** 约定，格式为：

```
<type>: <简述>

<可选：详细说明>
```

`type` 取值：

| type | 含义 | 示例 |
| --- | --- | --- |
| feat | 新功能 | `feat: 发布寻物/招领信息` |
| fix | 修复缺陷 | `fix: 修复搜索大小写不敏感` |
| docs | 文档更新 | `docs: 补充 README 目录说明` |
| style | 样式调整（不影响逻辑） | `style: 优化卡片排版` |
| refactor | 重构（不改功能） | `refactor: 拆分状态更新函数` |
| test | 测试相关 | `test: 新增筛选组合用例` |
| chore | 构建/杂项 | `chore: 添加 jest 配置` |

## 三、功能划分与提交时机

要求"每完成一个功能、编译/测试通过后至少 commit 一次"。本项目按以下功能划分提交：

1. `feat: 初始化项目结构与入口页面`
2. `feat: 实现 core.js 核心业务逻辑`
3. `feat: 实现发布信息表单与校验`
4. `feat: 实现搜索与多条件筛选`
5. `feat: 实现详情页与一键复制联系方式`
6. `feat: 实现我的发布与状态更新`
7. `test: 添加 core.js 单元测试（21 用例）`
8. `docs: 编写 README 与提交规范说明`

## 四、Pull Request 协作流程

1. **Fork**：队友 fork 主仓库到自己账号；
2. **拉分支**：`git checkout -b feat/xxx`；
3. **开发**：本地完成功能，`npm test` 全部通过后提交；
4. **Push**：`git push origin feat/xxx`；
5. **发起 PR**：描述改动点与测试结果，请求队友 review；
6. **Review & Merge**：队友确认无冲突、测试通过后合并回 `main`；
7. **同步**：合并后双方 `git pull` 拉取最新 `main`。

## 五、注意事项

- `node_modules/` 已在 `.gitignore` 中忽略，**不要**提交依赖目录；
- 单元测试代码（`test/`）可与源码一并提交，供助教复现；如按要求不提交单元测试，请保持 README 里测试说明与 `package.json` 的 `test` 脚本一致，便于他人自行运行；
- 每次提交前先 `npm test` 确认全部用例通过；
- commit 信息避免「改了点东西」「update」这类无意义描述。