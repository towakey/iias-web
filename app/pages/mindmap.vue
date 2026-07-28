<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">マインドマップ</h2>
    </header>

    <div class="iias-card iias-form" style="margin-bottom: 1rem;">
      <label class="iias-label">グループ化</label>
      <select v-model="groupBy" class="iias-input" @change="load">
        <option value="tag">タグ</option>
        <option value="month">年月</option>
        <option value="domain">ドメイン</option>
      </select>
    </div>

    <div ref="container" style="width: 100%; height: 600px; overflow: hidden; border: 1px solid #ff8a1c; background: #050505;"></div>
  </div>
</template>

<script setup lang="ts">
import type * as d3Type from 'd3'

const api = useApi()
const container = ref<HTMLElement | null>(null)
const groupBy = ref<'tag' | 'month' | 'domain'>('tag')
const archives = ref<any[]>([])
let simulation: any = null

function getGroup(item: any): string {
  if (groupBy.value === 'domain') {
    try {
      return new URL(item.url || 'http://localhost').hostname.replace(/^www\./, '')
    } catch {
      return 'unknown'
    }
  }
  if (groupBy.value === 'month') {
    const d = new Date(item.recorded_at || item.created_at)
    return isNaN(d.getTime()) ? 'unknown' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const tags = Array.isArray(item.tags) ? item.tags : []
  return tags.length ? tags[0].name : 'untagged'
}

async function load() {
  try {
    const res: any = await api.get('/archives?per_page=200')
    archives.value = res.data || []
    draw()
  } catch (e) {
    archives.value = []
  }
}

async function draw() {
  if (!container.value) return
  const width = container.value.clientWidth || 800
  const height = 600
  container.value.innerHTML = ''
  const d3 = await import('d3') as any as typeof d3Type

  const groups = new Map<string, any[]>()
  for (const a of archives.value) {
    const g = getGroup(a)
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g)!.push(a)
  }

  interface MindNode {
    id: string
    name: string
    url?: string
    group?: boolean
  }
  const nodes: MindNode[] = [{ id: 'root', name: 'IIAS' }]
  const links: { source: string; target: string }[] = []

  groups.forEach((items, group) => {
    const gid = `g:${group}`
    nodes.push({ id: gid, name: group, group: true })
    links.push({ source: 'root', target: gid })
    for (const item of items) {
      const nid = `a:${item.id}`
      nodes.push({ id: nid, name: item.title || '(無題)', url: item.url })
      links.push({ source: gid, target: nid })
    }
  })

  const svg = d3.select(container.value).append('svg')
    .attr('width', width)
    .attr('height', height)

  simulation = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(70))
    .force('charge', d3.forceManyBody().strength(-150))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(20))

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#ff8a1c')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1)

  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .call(d3.drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }) as any)

  node.append('circle')
    .attr('r', (d: any) => d.id === 'root' ? 14 : d.group ? 9 : 5)
    .attr('fill', (d: any) => d.id === 'root' ? '#ff8a1c' : d.group ? '#ff8a1c' : '#050505')
    .attr('stroke', '#ff8a1c')
    .attr('stroke-width', 1)
    .style('cursor', (d: any) => d.url ? 'pointer' : 'default')

  node.append('text')
    .attr('dy', (d: any) => d.id === 'root' ? -16 : d.group ? -12 : 16)
    .attr('text-anchor', 'middle')
    .style('fill', '#ff8a1c')
    .style('font-size', (d: any) => d.id === 'root' ? '16px' : '11px')
    .style('pointer-events', 'none')
    .text((d: any) => d.name)

  node.on('click', (_event: any, d: any) => {
    if (d.url) window.open(d.url, '_blank')
  })

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

onMounted(() => load())
onUnmounted(() => {
  if (simulation) simulation.stop()
})
</script>
