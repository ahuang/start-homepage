
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

export default {
  base: process.env.NODE_ENV === 'development'? '/': '/start-homepage/',
  publicPath: '/start-homepage/',
  plugins: [
    'umi-plugin-gh-pages',
  ],
}
