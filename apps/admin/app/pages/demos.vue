<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const demos = ref<any[]>([])
const form = reactive({ id: '', title: '', description: '', learningGoal: '', category: 'AI & Agent', routePath: '', apiNamespace: '', displayMode: 'custom-page', supportsStreaming: true, sourceUrl: '' })
const editId = ref<string | null>(null)
const notice = ref('')
function showNotice(msg: string) { notice.value = msg; setTimeout(() => notice.value = '', 2500) }

async function load() {
  const res = await $fetch<any>(`${apiBase.value}/demos`)
  demos.value = (res.data as any[])?.flatMap((g: any) => g.items) ?? []
}
async function save() {
  if (!form.title || !form.routePath) return showNotice('请填写标题和路由')
  try {
    if (editId.value) await $fetch(`${apiBase.value}/demos/${editId.value}`, { method: 'PATCH', body: form })
    else await $fetch(`${apiBase.value}/demos`, { method: 'POST', body: form })
    showNotice(editId.value ? '更新成功' : '创建成功'); reset(); await load()
  } catch (e: any) { showNotice(e.message) }
}
function edit(d: any) { editId.value = d.id; Object.assign(form, d) }
async function del(id: string) { try { await $fetch(`${apiBase.value}/demos/${id}`, { method: 'DELETE' }); await load(); showNotice('删除成功') } catch (e: any) { showNotice(e.message) } }
function reset() { editId.value = null; Object.assign(form, { id: '', title: '', description: '', learningGoal: '', category: 'AI & Agent', routePath: '', apiNamespace: '', displayMode: 'custom-page', supportsStreaming: true, sourceUrl: '' }) }

onMounted(load)
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">Demo 管理</h2>
    <UCard>
      <template #header><span class="font-bold">{{ editId ? '编辑 Demo' : '新增 Demo' }}</span></template>
      <div class="grid gap-2">
        <UInput v-model="form.title" placeholder="标题" />
        <UInput v-model="form.routePath" placeholder="路由 /demos/xxx" />
        <UInput v-model="form.description" placeholder="描述" />
        <UInput v-model="form.learningGoal" placeholder="学习目标" />
        <div class="flex gap-2">
          <USelect v-model="form.category" :items="['AI & Agent', '全栈', '前端示例', '后端示例']" />
          <USelect v-model="form.displayMode" :items="['custom-page', 'generic-runner']" />
        </div>
        <div class="flex gap-2">
          <UButton color="primary" @click="save">{{ editId ? '更新' : '创建' }}</UButton>
          <UButton v-if="editId" variant="ghost" @click="reset">取消</UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header><span class="font-bold">列表 ({{ demos.length }})</span></template>
      <div class="grid gap-1">
        <div v-for="d in demos" :key="d.id" class="flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-gray-100">
          <div class="flex-1 min-w-0">
            <span class="text-sm font-semibold">{{ d.title }}</span>
            <span class="text-sm text-gray-400 ml-2">{{ d.routePath }}</span>
          </div>
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" @click="edit(d)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="del(d.id)" />
          </div>
        </div>
      </div>
    </UCard>

    <div v-if="notice" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-lg px-4 py-2.5 shadow-lg">{{ notice }}</div>
  </div>
</template>
