<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

interface Card { id: string; title: string; summary?: string; content: string; category?: string; difficulty: string; status: string; createdAt: string; updatedAt: string }

const cards = ref<Card[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
const filters = reactive({ keyword: '', status: '', difficulty: '', category: '' })
const form = reactive({ title: '', summary: '', content: '', category: '', difficulty: 'basic', status: 'todo' })
const editId = ref<string | null>(null)
const notice = ref('')
function showNotice(msg: string) { notice.value = msg; setTimeout(() => notice.value = '', 2500) }

async function load() {
  const params = new URLSearchParams({ page: String(pagination.value.page), pageSize: '10' })
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.status) params.set('status', filters.status)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.category) params.set('category', filters.category)
  try {
    const res = await $fetch<any>(`${apiBase.value}/cards?${params}`)
    cards.value = res.data?.items ?? []
    if (res.data?.pagination) pagination.value = res.data.pagination
  } catch (e: any) { showNotice(e.message || '加载失败') }
}

async function search() { pagination.value.page = 1; await load() }

async function onSubmit() {
  if (!form.title || !form.content) return showNotice('标题和内容必填')
  try {
    if (editId.value) {
      await $fetch(`${apiBase.value}/cards/${editId.value}`, { method: 'PATCH', body: { ...form } })
    } else {
      await $fetch(`${apiBase.value}/cards`, { method: 'POST', body: { ...form } })
    }
    showNotice(editId.value ? '更新成功' : '创建成功'); resetForm(); await load()
  } catch (e: any) { showNotice(e.message) }
}

function edit(c: Card) { editId.value = c.id; Object.assign(form, c) }
async function del(id: string) { try { await $fetch(`${apiBase.value}/cards/${id}`, { method: 'DELETE' }); await load(); showNotice('删除成功') } catch (e: any) { showNotice(e.message) } }
function resetForm() { editId.value = null; Object.assign(form, { title: '', summary: '', content: '', category: '', difficulty: 'basic', status: 'todo' }) }
function goPage(p: number) { pagination.value.page = p; load() }

onMounted(load)
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">Cards 管理</h2>

    <UCard>
      <div class="flex items-center gap-3 flex-wrap">
        <UInput v-model="filters.keyword" placeholder="搜索标题/摘要/内容" class="w-48" @keydown.enter="search()" />
        <USelect v-model="filters.status" :items="['', 'todo', 'learning', 'done', 'reviewing']" placeholder="状态" class="w-32" @update:model-value="search()" />
        <USelect v-model="filters.difficulty" :items="['', 'basic', 'advanced', 'expert']" placeholder="难度" class="w-32" @update:model-value="search()" />
        <UInput v-model="filters.category" placeholder="分类" class="w-32" @keydown.enter="search()" />
        <UButton icon="i-lucide-search" color="primary" @click="search()">搜索</UButton>
      </div>
    </UCard>

    <UCard>
      <template #header><span class="font-bold">{{ editId ? '编辑 Card' : '新增 Card' }}</span></template>
      <div class="grid gap-3">
        <div class="grid grid-cols-2 gap-2">
          <UInput v-model="form.title" placeholder="标题 *" />
          <UInput v-model="form.summary" placeholder="摘要" />
        </div>
        <UTextarea v-model="form.content" placeholder="正文内容 *" :rows="4" />
        <div class="flex gap-2">
          <UInput v-model="form.category" placeholder="分类" class="flex-1" />
          <USelect v-model="form.difficulty" :items="['basic', 'advanced', 'expert']" />
          <USelect v-model="form.status" :items="['todo', 'learning', 'done', 'reviewing']" />
        </div>
        <div class="flex gap-2">
          <UButton color="primary" @click="onSubmit()">{{ editId ? '更新' : '创建' }}</UButton>
          <UButton v-if="editId" variant="ghost" @click="resetForm()">取消</UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header><span class="font-bold">Card 列表 ({{ pagination.total }})</span></template>
      <div class="grid gap-1">
        <div v-for="c in cards" :key="c.id" class="flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-gray-100">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="font-semibold text-sm truncate">{{ c.title }}</span>
            <span class="text-sm text-gray-400">/</span>
            <span class="text-sm text-gray-400 truncate">{{ c.summary || '(无摘要)' }}</span>
            <UBadge variant="soft" size="xs" :color="c.status === 'done' ? 'success' : c.status === 'learning' ? 'primary' : 'neutral'">{{ c.status }}</UBadge>
            <UBadge variant="subtle" size="xs">{{ c.difficulty }}</UBadge>
            <span class="text-sm text-gray-400 ml-auto">{{ c.category }}</span>
          </div>
          <div class="flex gap-0.5 shrink-0">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="edit(c)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="del(c.id)" />
          </div>
        </div>
      </div>
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
        <UButton :disabled="pagination.page <= 1" variant="ghost" size="xs" @click="goPage(pagination.page - 1)">上一页</UButton>
        <span class="text-sm text-gray-500">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <UButton :disabled="pagination.page >= pagination.totalPages" variant="ghost" size="xs" @click="goPage(pagination.page + 1)">下一页</UButton>
      </div>
    </UCard>

    <Teleport to="body">
      <div v-if="notice" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-lg px-4 py-2.5 shadow-lg transition-all">{{ notice }}</div>
    </Teleport>
  </div>
</template>
