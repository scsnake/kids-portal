const { createApp, ref, computed, onMounted } = Vue;

createApp({
    template: `
    <div class="page">
        <header class="page-header">
            <h1>Kids Portal</h1>
            <p class="subtitle">選一個練習開始 ・ 共 {{ apps.length }} 個</p>
        </header>

        <div class="toolbar">
            <div class="search-wrap">
                <span class="search-icon">🔍</span>
                <input
                    v-model="q"
                    type="text"
                    class="search-input"
                    placeholder="搜尋 app、科目、程度…"
                    autofocus
                />
                <button v-if="q" class="search-clear" @click="q=''" title="清除">×</button>
            </div>
            <div class="chip-row">
                <button
                    v-for="s in subjects"
                    :key="s"
                    class="chip"
                    :class="{active: subjectFilter === s}"
                    @click="subjectFilter = subjectFilter === s ? '' : s"
                >{{ s }}</button>
            </div>
        </div>

        <div v-if="loading" class="state">載入中…</div>
        <div v-else-if="filteredApps.length === 0" class="state">
            <div class="state-icon">🔍</div>
            <p>找不到符合條件的 app</p>
            <button class="btn-plain" @click="resetFilters">清除篩選</button>
        </div>

        <ul v-else class="app-list">
            <li v-for="app in filteredApps" :key="app.id" class="app-card">
                <a :href="app.url" class="app-link">
                    <div class="app-icon">{{ app.icon }}</div>
                    <div class="app-body">
                        <div class="app-title-row">
                            <h2 class="app-title">{{ app.title }}</h2>
                            <span class="app-subject">{{ app.subject }}</span>
                        </div>
                        <p class="app-desc">{{ app.desc }}</p>
                        <div class="app-levels">
                            <span v-for="lv in app.level" :key="lv" class="level-tag">{{ lv }}</span>
                        </div>
                    </div>
                    <div class="app-arrow" aria-hidden="true">→</div>
                </a>
            </li>
        </ul>

        <footer class="page-footer">
            <span class="footer-count">{{ filteredApps.length }} / {{ apps.length }} 個</span>
        </footer>
    </div>
    `,
    setup() {
        const apps = ref([]);
        const loading = ref(true);
        const q = ref('');
        const subjectFilter = ref('');

        onMounted(async () => {
            try {
                const res = await fetch('apps.json?t=' + Date.now());
                const data = await res.json();
                apps.value = Array.isArray(data.apps) ? data.apps : [];
            } catch (e) {
                console.error('Failed to load apps.json:', e);
            } finally {
                loading.value = false;
            }
        });

        const subjects = computed(() => {
            const set = new Set();
            for (const a of apps.value) if (a.subject) set.add(a.subject);
            return [...set];
        });

        const filteredApps = computed(() => {
            const needle = q.value.trim().toLowerCase();
            return apps.value.filter(a => {
                if (subjectFilter.value && a.subject !== subjectFilter.value) return false;
                if (!needle) return true;
                const hay = [a.title, a.desc, a.subject, ...(a.level || [])].join(' ').toLowerCase();
                return hay.includes(needle);
            });
        });

        function resetFilters() {
            q.value = '';
            subjectFilter.value = '';
        }

        return { apps, loading, q, subjectFilter, subjects, filteredApps, resetFilters };
    }
}).mount('#app');
