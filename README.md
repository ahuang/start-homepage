
# development 
npm install   
npm run dev   
http://localhost:5173/start-homepage/   

# production 
npm install    
npm run deploy (include build)   
https://ahuang.github.io/start-homepage   

## GitHub Gist 配置（可选）

配置后，编辑模式的修改会保存到 Gist，部署到 GitHub Pages 也能持久化。

1. 打开 [gist.github.com](https://gist.github.com) 并登录
2. 新建 Gist，文件名填 `homepage.json`
3. 将 `pages/data/index.json` 内容粘贴进去
4. 创建 public gist，复制 URL 中的 gist ID（如 `abc123def456...`）
5. [新建 Personal Access Token](https://github.com/settings/tokens)，勾选 `gist` 权限
6. 创建 `.env` 文件（参考 `.env.example`）：

```
VITE_GIST_ID=你的gist_id
VITE_GITHUB_TOKEN=你的token
```

7. 重新 `npm run dev` 或 `npm run build`

⚠️ Token 会打包进前端，仅适合个人项目。
