<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const cards = ref<any[]>([])
const form = reactive({ title: '', content: '', summary: '', category: '', difficulty: 'basic', status: 'todo', tags: '' })
const editId = ref<string | null>(null)
const notice = ref('')
function showNotice(msg: string) { notice.value = msg; setTimeout(() => notice.value = '', 2500) }

async function load() { const res = await $fetch<any>(`${apiBase.value}/cards`); cards.value = (res.data as any[]) ?? [] }
async function save() {
  if (!form.title || !form.content) return showNotice('请填写标题和内容')
  try {
    const payload = { ...form, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }
    if (editId.value) await $fetch(`${apiBase.value}/cards/${editId.value}`, { method: 'PATCH', body: payload })
    else await $fetch(`${apiBase.value}/cards`, { method: 'POST', body: payload })
    showNotice(editId.value ? '更新成功' : '创建成功'); reset(); await load()
  } catch (e: any) { showNotice(e.message) }
}
function edit(c: any) { editId.value = c.id; Object.assign(form, { ...c, tags: (c.tags || []).map((t: any) => t.tag?.name || t.name).join(', ') }) }
async function del(id: string) { try { await $fetch(`${apiBase.value}/cards/${id}`, { method: 'DELETE' }); await load(); showNotice('删除成功') } catch (e: any) { showNotice(e.message) } }
function reset() { editId.value = null; Object.assign(form, { title: '', content: '', summary: '', category: '', difficulty: 'basic', status: 'todo', tags: '' }) }

onMounted(load)
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">Card 管理</h2>
    <UCard>
      <template #header><span class="font-bold">{{ editId ? '编辑 Card' : '新增 Card' }}</span></template>
      <div class="grid gap-2">
        <UInput v-model="form.title" placeholder="标题" />
        <UTextarea v-model="form.content" placeholder="正文内容" :rows="4" />
        <UInput v-model="form.summary" placeholder="摘要" />
        <div class="flex gap-2">
          <UInput v-model="form.category" placeholder="分类" class="flex-1" />
          <UInput v-model="form.tags" placeholder="标签,逗号分隔" class="flex-1" />
        </div>
        <div class="flex gap-2">
          <USelect v-model="form.difficulty" :items="['basic', 'advanced', 'expert']" />
          <USelect v-model="form.status" :items="['todo', 'learning', 'done', 'reviewing']" />
        </div>
        <div class="flex gap-2">
          <UButton color="primary" @click="save">{{ editId ? '更新' : '创建' }}</UButton>
          <UButton v-if="editId" variant="ghost" @click="reset">取消</UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header><span class="font-bold">列表 ({{ cards.length }})</span></template>
      <div class="grid gap-1">
        <div v-for="c in cards" :key="c.id" class="flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-gray-100">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="truncate text-sm">{{ c.title }}</span>
            <UBadge variant="soft" :color="c.status === 'done' ? 'success' : c.status === 'learning' ? 'primary' : 'neutral'">{{ c.status }}</UBadge>
            <UBadge variant="subtle" size="xs">{{ c.difficulty }}</UBadge>
          </div>
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" @click="edit(c)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="del(c.id)" />
          </div>
        </div>
      </div>
    </UCard>

    <div v-if="notice" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-lg px-4 py-2.5 shadow-lg">{{ notice }}</div>
  </div>
</template>
