<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const STATUS_OPTIONS = ['todo', 'doing', 'done']
const DIFFICULTY_OPTIONS = ['basic', 'medium', 'advanced']

interface Card { id: string; title: string; summary?: string; content: string; category?: string; difficulty: string; status: string; createdAt: string; updatedAt: string }

const cards = ref<Card[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
const filters = reactive({ keyword: '', status: 'all', difficulty: 'all', category: '' })
const form = reactive({ title: '', summary: '', content: '', category: '', difficulty: 'basic', status: 'todo' })
const editId = ref<string | null>(null)
const notice = ref('')
function showNotice(msg: string) { notice.value = msg; setTimeout(() => notice.value = '', 2500) }

async function load() {
  const params = new URLSearchParams({ page: String(pagination.value.page), pageSize: '10' })
  if (filters.keyword) params.set('keyword', filters.keyword)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.difficulty && filters.difficulty !== 'all') params.set('difficulty', filters.difficulty)
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
    const body = { ...form, summary: form.summary || undefined, category: form.category || undefined }
    if (editId.value) {
      await $fetch(`${apiBase.value}/cards/${editId.value}`, { method: 'PATCH', body })
    } else { await $fetch(`${apiBase.value}/cards`, { method: 'POST', body }) }
    showNotice(editId.value ? '已更新' : '已创建'); resetForm(); await load()
  } catch (e: any) { showNotice(e.message) }
}

function edit(c: Card) { editId.value = c.id; Object.assign(form, c); window.scrollTo({ top: 0, behavior: 'smooth' }) }
async function del(id: string) { try { await $fetch(`${apiBase.value}/cards/${id}`, { method: 'DELETE' }); await load(); showNotice('已删除') } catch (e: any) { showNotice(e.message) } }
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
        <USelect v-model="filters.status" :items="[{ label: '全部状态', value: 'all' }, ...STATUS_OPTIONS.map(v => ({ label: v, value: v }))]" placeholder="状态" class="w-28" @update:model-value="search()" />
        <USelect v-model="filters.difficulty" :items="[{ label: '全部难度', value: 'all' }, ...DIFFICULTY_OPTIONS.map(v => ({ label: v, value: v }))]" placeholder="难度" class="w-28" @update:model-value="search()" />
        <UInput v-model="filters.category" placeholder="分类" class="w-28" @keydown.enter="search()" />
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
          <USelect v-model="form.difficulty" :items="DIFFICULTY_OPTIONS" />
          <USelect v-model="form.status" :items="STATUS_OPTIONS" />
        </div>
        <div class="flex gap-2">
          <UButton color="primary" @click="onSubmit()">{{ editId ? '更新' : '创建' }}</UButton>
          <UButton v-if="editId" variant="ghost" @click="resetForm()">取消</UButton>
        </div>
      </div>
    </UCard>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-default">
        <span class="font-bold text-sm">Card 列表 ({{ pagination.total }})</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-default bg-gray-50">
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500 w-12">#</th>
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500">标题</th>
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500 w-20">分类</th>
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500 w-16">难度</th>
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500 w-16">状态</th>
              <th class="text-left px-4 py-2.5 font-semibold text-gray-500 w-24">创建时间</th>
              <th class="text-right px-4 py-2.5 font-semibold text-gray-500 w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in cards" :key="c.id" class="border-b border-default hover:bg-gray-50">
              <td class="px-4 py-2.5 text-gray-400">{{ (pagination.page - 1) * pagination.pageSize + i + 1 }}</td>
              <td class="px-4 py-2.5">
                <p class="font-semibold truncate max-w-48">{{ c.title }}</p>
                <p class="text-xs text-gray-400 truncate max-w-48 mt-0.5">{{ c.summary || '(无摘要)' }}</p>
              </td>
              <td class="px-4 py-2.5 text-gray-500">{{ c.category || '-' }}</td>
              <td class="px-4 py-2.5">
                <UBadge variant="soft" size="xs" :color="c.difficulty === 'advanced' ? 'error' : c.difficulty === 'medium' ? 'warning' : 'success'">{{ c.difficulty }}</UBadge>
              </td>
              <td class="px-4 py-2.5">
                <UBadge variant="soft" size="xs" :color="c.status === 'done' ? 'success' : c.status === 'doing' ? 'primary' : 'neutral'">{{ c.status }}</UBadge>
              </td>
              <td class="px-4 py-2.5 text-gray-400 whitespace-nowrap text-xs">{{ new Date(c.createdAt).toLocaleDateString('zh-CN') }}</td>
              <td class="px-4 py-2.5 text-right">
                <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="edit(c)" />
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="del(c.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 py-3 border-t border-default">
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
