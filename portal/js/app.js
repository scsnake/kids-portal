const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
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
            <li v-for="app in filteredApps" :key="app.id" class="app-card" :class="{ 'note-open': noteFor === app.id }">
                <a :href="app.url" class="app-link">
                    <div class="app-icon">{{ app.icon }}</div>
                    <div class="app-body">
                        <div class="app-title-row">
                            <h2 class="app-title">{{ app.title }}</h2>
                            <span class="app-subject">{{ app.subject }}</span>
                            <span
                                v-if="app.private"
                                class="app-private"
                                role="button"
                                tabindex="0"
                                aria-haspopup="dialog"
                                :aria-expanded="noteFor === app.id"
                                @click.prevent.stop="clickNote(app.id)"
                                @keydown.enter.prevent.stop="clickNote(app.id)"
                                @keydown.space.prevent.stop="clickNote(app.id)"
                                @mouseenter="hoverNote(app.id)"
                                @mouseleave="leaveNote"
                            >🔒 家人限定 <span class="info-dot" aria-hidden="true">i</span></span>
                        </div>
                        <p class="app-desc">{{ app.desc }}</p>
                        <div class="app-levels">
                            <span v-for="lv in app.level" :key="lv" class="level-tag">{{ lv }}</span>
                        </div>
                    </div>
                    <div class="app-arrow" aria-hidden="true">→</div>
                </a>
                <div
                    v-if="app.private && noteFor === app.id"
                    class="app-note-pop"
                    role="dialog"
                    aria-label="家人限定說明"
                    @mouseenter="cancelLeave"
                    @mouseleave="leaveNote"
                    @click.stop
                >
                    <p>🔒 點進去要先用 Google 帳號登入，只有已經加入名單的帳號能用。</p>
                    <p>想使用的話，請寫信到 <a :href="'mailto:scsnake@gmail.com?subject=' + encodeURIComponent('申請使用「' + app.title + '」')">scsnake@gmail.com</a>，告訴我你的 Gmail 帳號。</p>
                </div>
            </li>
        </ul>

        <footer class="page-footer">
            <span class="footer-count">{{ filteredApps.length }} / {{ apps.length }} 個</span>
            <p class="footer-owner">製作者 <a href="mailto:scsnake@gmail.com">scsnake@gmail.com</a></p>
            <app-changelog src="changelog.json" lang="zh"></app-changelog>
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

        // The 🔒 tag opens a small hint: on hover where a mouse can hover, and on tap or
        // click everywhere. A click pins it open; a click elsewhere or Esc closes it.
        const noteFor = ref(null);
        let pinned = false;
        let leaveTimer = null;
        const canHover = window.matchMedia('(hover: hover)').matches;
        function clickNote(id) {
            clearTimeout(leaveTimer);
            if (noteFor.value === id && pinned) { noteFor.value = null; pinned = false; return; }
            noteFor.value = id;
            pinned = true;
        }
        function hoverNote(id) {
            if (!canHover) return;
            clearTimeout(leaveTimer);
            if (noteFor.value !== id) { noteFor.value = id; pinned = false; }
        }
        function leaveNote() {
            if (pinned) return;
            leaveTimer = setTimeout(() => { noteFor.value = null; }, 250);
        }
        function cancelLeave() { clearTimeout(leaveTimer); }
        const closeNote = () => { noteFor.value = null; pinned = false; };
        document.addEventListener('click', closeNote);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNote(); });

        function resetFilters() {
            q.value = '';
            subjectFilter.value = '';
        }

        return { apps, loading, q, subjectFilter, subjects, filteredApps, resetFilters, noteFor, clickNote, hoverNote, leaveNote, cancelLeave };
    }
});

// <app-changelog> is a custom element (changelog-widget.js), not a Vue component.
app.config.compilerOptions.isCustomElement = (tag) => tag === 'app-changelog';

app.mount('#app');
