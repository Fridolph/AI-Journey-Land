<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const dbStatus = ref<'loading' | 'connected' | 'error'>('loading')
const dbError = ref('')
const demos = ref<any[]>([])
const cards = ref<any[]>([])
const activeTab = ref('demos')
const demoForm = reactive({ id: '', title: '', description: '', learningGoal: '', category: 'AI & Agent', routePath: '', apiNamespace: '', displayMode: 'custom-page', supportsStreaming: true, sourceUrl: '' })
const cardForm = reactive({ id: '', title: '', content: '', summary: '', category: '', difficulty: 'basic', status: 'todo', tags: '' })
const editCardId = ref<string | null>(null)
const editDemoId = ref<string | null>(null)
const cardRecordNote = ref('')
const notice = ref('')
function showNotice(msg: string) { notice.value = msg; setTimeout(() => notice.value = '', 2500) }

async function checkDB() {
  dbStatus.value = 'loading'
  try { await $fetch(`${apiBase.value}/health`); dbStatus.value = 'connected' } catch (e: any) { dbStatus.value = 'error'; dbError.value = e.message }
}
async function loadDemos() {
  const res = await $fetch<any>(`${apiBase.value}/demos`)
  demos.value = (res.data as any[])?.flatMap((g: any) => g.items) ?? []
}
async function saveDemo() {
  if (!demoForm.title || !demoForm.routePath) return showNotice('请填写标题和路由')
  try {
    if (editDemoId.value) await $fetch(`${apiBase.value}/demos/${editDemoId.value}`, { method: 'PATCH', body: demoForm })
    else await $fetch(`${apiBase.value}/demos`, { method: 'POST', body: demoForm })
    showNotice(editDemoId.value ? '更新成功' : '创建成功')
    resetDemoForm(); await loadDemos()
  } catch (e: any) { showNotice(e.message || '操作失败') }
}
function editDemo(d: any) { editDemoId.value = d.id; Object.assign(demoForm, d); activeTab.value = 'demos' }
async function deleteDemo(id: string) { try { await $fetch(`${apiBase.value}/demos/${id}`, { method: 'DELETE' }); await loadDemos(); showNotice('删除成功') } catch (e: any) { showNotice(e.message) } }
function resetDemoForm() { editDemoId.value = null; Object.assign(demoForm, { id: '', title: '', description: '', learningGoal: '', category: 'AI & Agent', routePath: '', apiNamespace: '', displayMode: 'custom-page', supportsStreaming: true, sourceUrl: '' }) }

async function loadCards() { const res = await $fetch<any>(`${apiBase.value}/cards`); cards.value = (res.data as any[]) ?? [] }
async function saveCard() {
  if (!cardForm.title || !cardForm.content) return showNotice('请填写标题和内容')
  try {
    const payload = { ...cardForm, tags: cardForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }
    if (editCardId.value) await $fetch(`${apiBase.value}/cards/${editCardId.value}`, { method: 'PATCH', body: payload })
    else await $fetch(`${apiBase.value}/cards`, { method: 'POST', body: payload })
    showNotice(editCardId.value ? '更新成功' : '创建成功'); resetCardForm(); await loadCards()
  } catch (e: any) { showNotice(e.message || '操作失败') }
}
function editCard(c: any) { editCardId.value = c.id; Object.assign(cardForm, { ...c, tags: (c.tags || []).map((t: any) => t.tag?.name || t.name).join(', ') }) }
async function deleteCard(id: string) { try { await $fetch(`${apiBase.value}/cards/${id}`, { method: 'DELETE' }); await loadCards(); showNotice('删除成功') } catch (e: any) { showNotice(e.message) } }
async function addCardRecord(cardId: string) {
  if (!cardRecordNote.value) return
  try { await $fetch(`${apiBase.value}/cards/${cardId}/records`, { method: 'POST', body: { action: 'note', note: cardRecordNote.value } }); cardRecordNote.value = ''; showNotice('学习记录已添加') } catch (e: any) { showNotice(e.message) }
}
function resetCardForm() { editCardId.value = null; Object.assign(cardForm, { id: '', title: '', content: '', summary: '', category: '', difficulty: 'basic', status: 'todo', tags: '' }) }

onMounted(async () => { await checkDB(); await loadDemos(); await loadCards() })
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold mb-6">Admin Dashboard</h1>

    <UCard class="mb-4">
      <div class="flex items-center gap-2 text-base">
        <span class="font-semibold">PostgreSQL</span>
        <UBadge :color="dbStatus === 'connected' ? 'success' : dbStatus === 'loading' ? 'warning' : 'error'">
          {{ dbStatus === 'connected' ? '已连接' : dbStatus === 'loading' ? '检查中...' : '连接失败' }}
        </UBadge>
        <UButton v-if="dbStatus === 'error'" color="neutral" variant="ghost" @click="checkDB">重试</UButton>
        <span v-if="dbError" class="text-red-500 text-sm">{{ dbError }}</span>
      </div>
    </UCard>

    <div class="flex gap-2 mb-4">
      <UButton :color="activeTab === 'demos' ? 'primary' : 'neutral'" variant="soft" @click="activeTab = 'demos'">Demo 管理</UButton>
      <UButton :color="activeTab === 'cards' ? 'primary' : 'neutral'" variant="soft" @click="activeTab = 'cards'">Card 管理</UButton>
    </div>

    <div v-if="activeTab === 'demos'" class="grid gap-4">
      <UCard>
        <template #header><span class="font-extrabold text-base">{{ editDemoId ? '编辑 Demo' : '新增 Demo' }}</span></template>
        <div class="grid gap-2">
          <UInput v-model="demoForm.title" placeholder="标题" />
          <UInput v-model="demoForm.routePath" placeholder="路由路径 /demos/xxx" />
          <UInput v-model="demoForm.description" placeholder="描述" />
          <div class="flex gap-2">
            <UButton color="primary" @click="saveDemo">{{ editDemoId ? '更新' : '创建' }}</UButton>
            <UButton v-if="editDemoId" variant="ghost" @click="resetDemoForm">取消</UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header><span class="font-extrabold text-base">Demo 列表</span></template>
        <div class="grid gap-1">
          <div v-for="d in demos" :key="d.id" class="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted text-sm">
            <span class="truncate flex-1">{{ d.title }} <span class="text-muted text-sm">{{ d.routePath }}</span></span>
            <div class="flex gap-1">
              <UButton icon="i-lucide-pencil" variant="ghost" @click="editDemo(d)" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="deleteDemo(d.id)" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-if="activeTab === 'cards'" class="grid gap-4">
      <UCard>
        <template #header><span class="font-extrabold text-base">{{ editCardId ? '编辑 Card' : '新增 Card' }}</span></template>
        <div class="grid gap-2">
          <UInput v-model="cardForm.title" placeholder="标题" />
          <UTextarea v-model="cardForm.content" placeholder="正文内容" :rows="4" />
          <UInput v-model="cardForm.summary" placeholder="摘要" />
          <UInput v-model="cardForm.category" placeholder="分类" />
          <UInput v-model="cardForm.tags" placeholder="标签（逗号分隔）" />
          <div class="flex gap-2">
            <USelect v-model="cardForm.difficulty" :items="['basic', 'advanced', 'expert']" />
            <USelect v-model="cardForm.status" :items="['todo', 'learning', 'done', 'reviewing']" />
          </div>
          <div class="flex gap-2">
            <UButton color="primary" @click="saveCard">{{ editCardId ? '更新' : '创建' }}</UButton>
            <UButton v-if="editCardId" variant="ghost" @click="resetCardForm">取消</UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header><span class="font-extrabold text-base">Card 列表 ({{ cards.length }})</span></template>
        <div class="grid gap-1">
          <div v-for="c in cards" :key="c.id" class="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted text-sm">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="truncate">{{ c.title }}</span>
              <UBadge variant="soft" :color="c.status === 'done' ? 'success' : c.status === 'learning' ? 'primary' : 'neutral'">{{ c.status }}</UBadge>
              <UBadge variant="subtle">{{ c.difficulty }}</UBadge>
            </div>
            <div class="flex gap-1 items-center">
              <UPopover placement="bottom-end">
                <UButton icon="i-lucide-file-plus" variant="ghost" />
                <template #content>
                  <div class="p-2 grid gap-2">
                    <UInput v-model="cardRecordNote" placeholder="学习笔记" />
                    <UButton color="primary" @click="addCardRecord(c.id)">添加</UButton>
                  </div>
                </template>
              </UPopover>
              <UButton icon="i-lucide-pencil" variant="ghost" @click="editCard(c)" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="deleteCard(c.id)" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-if="notice" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-lg px-4 py-2.5 shadow-lg">{{ notice }}</div>
  </UContainer>
</template>
