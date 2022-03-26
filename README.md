1. npm init
2. npm install lerna
3. lerna init
4. lerna create 创建 package
5. lerna add 添加依赖
   lerna add axios packages/\*\*
6. lerna link 相互依赖 link
7. lerna exec --<command> -- 在每个 package 中执行 例： lerna exec -- rm -rf node_modules
   lerna exec --scope package-name(包名) -- 在每个 package 中执行 例： lerna exec --scope @tracy-cli-dev/core -- rm -rf node_modules
8. lerna run 在每个包下面执行 npm 脚本 例：lerna run build
   lerna run --scope 在指定包下面执行 npm 脚本 例：lerna run --scope @tracy-cli-dev/core build
9. lerna diff

// npm link --force 强制 link
// 一定要 #!/usr/bin/env node
