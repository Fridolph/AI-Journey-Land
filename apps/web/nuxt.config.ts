export default defineNuxtConfig({
  compatibilityDate: '2026-05-08',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  fonts: {
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
      npm: false,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4041/api',
    },
  },
  devServer: {
    port: 4040,
  },
  app: {
    head: {
      title: 'AI-Journey-Land',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'AI 学习成果的工程化展示平台',
        },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  vite: {
    build: {
      rollupOptions: {
        onLog(_level: string, log: { message?: string }) {
          if (log.message?.includes('Sourcemap')) return
        },
      },
    },
  },
})
