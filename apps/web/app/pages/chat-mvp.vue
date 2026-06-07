<script setup lang="ts">
import type { ApiResponse } from '@ai-journey-land/shared'

interface ChatMvpResponse {
  reply: string
  echoedMessage: string
}

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const message = ref('')
const responseText = ref('')
const responseMeta = ref<ChatMvpResponse | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function sendMessage() {
  const trimmedMessage = message.value.trim()

  if (!trimmedMessage || isSubmitting.value) {
    return
  }

  const payload = { message: trimmedMessage }
  console.log('[chat-mvp] web request payload:', payload)

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<ApiResponse<ChatMvpResponse>>(`${apiBase.value}/chat-mvp`, {
      method: 'POST',
      body: payload,
    })

    console.log('[chat-mvp] web response payload:', response)
    responseMeta.value = response.data
    responseText.value = response.data?.reply ?? ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '请求失败'
    console.error('[chat-mvp] web request failed:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer as="main" class="chat-mvp-page">
    <div class="chat-mvp-shell">
      <div class="chat-mvp-eyebrow">AI Chat MVP #34</div>
      <h1 class="chat-mvp-title">接口握手可见实验线</h1>
      <p class="chat-mvp-description">
        这一步先不接 AI，只验证浏览器输入的一句话如何穿过 Nuxt 与 NestJS，再把响应带回页面。
      </p>

      <UCard :ui="{ body: 'p-5 sm:p-6 grid gap-4' }">
        <UFormField label="输入消息" description="发送前后请观察浏览器 console 与后端 terminal。">
          <UTextarea
            v-model="message"
            :rows="4"
            autoresize
            placeholder="例如：你好，先和我握个手"
          />
        </UFormField>

        <div class="chat-mvp-actions">
          <UButton
            icon="i-lucide-send"
            :loading="isSubmitting"
            :disabled="!message.trim() || isSubmitting"
            @click="sendMessage"
          >
            发送握手请求
          </UButton>
          <UBadge color="neutral" variant="soft">POST /api/chat-mvp</UBadge>
        </div>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="请求失败"
          :description="errorMessage"
        />

        <div class="chat-mvp-result">
          <div class="chat-mvp-result__header">
            <span>页面响应</span>
            <span v-if="responseMeta" class="chat-mvp-result__meta">
              echoed: {{ responseMeta.echoedMessage }}
            </span>
          </div>
          <p class="chat-mvp-result__body">
            {{ responseText || '响应会显示在这里。' }}
          </p>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<style scoped>
.chat-mvp-page {
  padding-block: 2rem 4rem;
}

.chat-mvp-shell {
  max-width: 48rem;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
}

.chat-mvp-eyebrow {
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chat-mvp-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 900;
  line-height: 1.1;
}

.chat-mvp-description {
  color: #64748b;
  line-height: 1.7;
}

.chat-mvp-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.chat-mvp-result {
  display: grid;
  gap: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.8);
  padding: 1rem;
}

.chat-mvp-result__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
}

.chat-mvp-result__meta {
  color: #0f766e;
}

.chat-mvp-result__body {
  min-height: 4rem;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .chat-mvp-page {
    padding-block: 1.25rem 2.5rem;
  }

  .chat-mvp-result__header {
    flex-direction: column;
    gap: 0.35rem;
  }
}
</style>
