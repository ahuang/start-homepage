
# development 
npm install   
npm run dev   
http://localhost:5173/start-homepage/   

# production 
npm install    
npm run deploy (include build)   
https://ahuang.github.io/start-homepage   


# 创建gist 
配置后，编辑模式的修改会保存到 Gist，部署到 GitHub Pages 也能持久化。
创建gist
1. 打开 https://gist.github.com 并登录
2. 新建 Gist，文件名填 `homepage.json`  创建secret类型
3. 将 `pages/data/index.json` 内容粘贴进去
4. 创建 public gist，复制 URL 中的 gist ID（如 `abc123def456...`）
5. 创建 `.env` 文件（参考 `.env.example`）：
6. 重新 `npm run dev` 或 `npm run build`

gist id@pwd:homepage

# 创建github 
https://github.com/settings/tokens 
personal access tokens -> Tokens(classic) -> Generate new token -> Generate new token(classic) -> 
1. Note: homage (随意)
2. 勾选 gist 
3. Generate token  
4. 跳转页面会生成token，本地保存好。 

github token@pwd:homepage



