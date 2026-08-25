# Personal Skills

这是一个个人使用的技能收集仓库。

仓库按分组收录可安装技能。

## 安装

| 分组     | 应用场景                    | 技能                      | 安装单个技能                                                  | 安装整个分组                                                                  |
| -------- | --------------------------- | ------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `skills` | 个人自用、维护的通用技能    | `mxs-cli`                 | `npx skills add liyown/SKILL --skill mxs-cli`                 | `npx skills add https://github.com/liyown/SKILL/tree/main/skills --skill '*'` |
| `skills` | DSHX Hub 目录与社区长期运营 | `dshx-hub-ops`            | `npx skills add liyown/SKILL --skill dshx-hub-ops`            | `npx skills add https://github.com/liyown/SKILL/tree/main/skills --skill '*'` |
| `skills` | DSHX 插件开发、诊断与验证   | `dshx-plugin-development` | `npx skills add liyown/SKILL --skill dshx-plugin-development` | `npx skills add https://github.com/liyown/SKILL/tree/main/skills --skill '*'` |

`npx skills` 会在指定分组目录内发现 `SKILL.md`，并将选中的整个技能目录安装到本地技能目录。
