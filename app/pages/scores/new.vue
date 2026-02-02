<script setup lang="ts">
import { ArrowLeft, Plus, X, Users, UsersRound, Check } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const { players, addPlayer } = usePlayers()
const { createSession } = useScoreSessions()

const sessionName = ref('')
const selectedPlayerIds = ref<string[]>([])
const newPlayerName = ref('')
const maxRounds = ref<number | null>(null)
const maxScore = ref<number | null>(null)
const isTeamMode = ref(false)
const showPlayerSelector = ref(false)

const canCreate = computed(() => {
    const hasName = sessionName.value.trim() !== ''
    return hasName && selectedPlayerIds.value.length >= 2
})

const selectedPlayers = computed(() =>
    players.value.filter(p => selectedPlayerIds.value.includes(p.id))
)

const availablePlayers = computed(() =>
    players.value.filter(p => !selectedPlayerIds.value.includes(p.id))
)

function togglePlayerSelection(playerId: string): void {
    const index = selectedPlayerIds.value.indexOf(playerId)
    if (index !== -1) {
        selectedPlayerIds.value.splice(index, 1)
    } else {
        selectedPlayerIds.value.push(playerId)
    }
}

function handleAddNewPlayer(): void {
    const name = newPlayerName.value.trim()
    if (name === '') return
    const player = addPlayer(name)
    selectedPlayerIds.value.push(player.id)
    newPlayerName.value = ''
}

function removeSelectedPlayer(playerId: string): void {
    const index = selectedPlayerIds.value.indexOf(playerId)
    if (index !== -1) {
        selectedPlayerIds.value.splice(index, 1)
    }
}

function handleCreate(): void {
    if (selectedPlayerIds.value.length < 2) return

    const playerNames = selectedPlayers.value.map(p => p.name)

    const session = createSession(sessionName.value.trim(), playerNames, {
        maxRounds: maxRounds.value,
        maxScore: maxScore.value,
        isTeamMode: isTeamMode.value,
    })

    router.push(`/scores/${session.id}`)
}

onMounted(() => {
    if (players.value.length > 0) {
        showPlayerSelector.value = true
    }
})
</script>

<template>
    <div class="min-h-dvh bg-background">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-4">
                <NuxtLink
                    to="/scores"
                    data-test-id="back-btn"
                    class="new-session__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    v-motion
                    :initial="{ opacity: 0, x: -10 }"
                    :enter="{ opacity: 1, x: 0 }"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1
                    class="heading font-display text-lg font-bold tracking-tight"
                    v-motion
                    :initial="{ opacity: 0, y: -10 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    {{ t('scores.newSession.title') }}
                </h1>
            </div>
        </header>

        <div class="p-4 space-y-6">
            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            >
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    {{ t('scores.newSession.sessionName') }}
                </label>
                <UiInput
                    v-model="sessionName"
                    data-test-id="session-name-input"
                    :placeholder="t('scores.newSession.sessionNamePlaceholder')"
                />
            </section>

            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }"
            >
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    {{ t('scores.newSession.players') }} ({{ selectedPlayerIds.length }})
                </label>

                <div v-if="selectedPlayers.length > 0" data-test-id="selected-players" class="flex flex-wrap gap-2 mb-3">
                    <UiBadge
                        v-for="player in selectedPlayers"
                        :key="player.id"
                        data-test-class="selected-player"
                        class="selected-player flex items-center gap-1 pr-1"
                        :style="{ backgroundColor: player.color }"
                    >
                        {{ player.name }}
                        <button
                            data-test-class="remove-player-btn"
                            class="ml-1 hover:bg-white/20 rounded-full p-0.5"
                            @click="removeSelectedPlayer(player.id)"
                        >
                            <X class="h-3 w-3" />
                        </button>
                    </UiBadge>
                </div>

                <div class="flex gap-2 mb-3">
                    <UiInput
                        v-model="newPlayerName"
                        data-test-id="new-player-input"
                        class="flex-1"
                        :placeholder="t('scores.newSession.newPlayerPlaceholder')"
                        @keyup.enter="handleAddNewPlayer"
                    />
                    <UiButton data-test-id="add-player-btn" @click="handleAddNewPlayer">
                        <Plus class="h-4 w-4" />
                    </UiButton>
                </div>

                <div v-if="availablePlayers.length > 0">
                    <p class="text-xs text-muted-foreground mb-2">{{ t('scores.newSession.selectExisting') }}</p>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="player in availablePlayers"
                            :key="player.id"
                            class="available-player flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm transition-colors hover:border-primary hover:bg-primary/10"
                            @click="togglePlayerSelection(player.id)"
                        >
                            <span
                                class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                :style="{ backgroundColor: player.color }"
                            >
                                {{ player.name.charAt(0).toUpperCase() }}
                            </span>
                            {{ player.name }}
                        </button>
                    </div>
                </div>

                <p v-if="players.length === 0" class="text-sm text-muted-foreground">
                    {{ t('scores.newSession.noPlayersYet') }}
                </p>
            </section>

            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
            >
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    {{ t('scores.newSession.gameMode') }}
                </label>
                <UiTabs
                    :tabs="[
                        { value: 'individual', label: t('scores.newSession.individual') },
                        { value: 'teams', label: t('scores.newSession.teams') },
                    ]"
                    :model-value="isTeamMode ? 'teams' : 'individual'"
                    test-id="game-mode"
                    @update:model-value="isTeamMode = $event === 'teams'"
                />
            </section>

            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }"
            >
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    {{ t('scores.newSession.endCondition') }}
                </label>
                <div data-test-id="end-conditions" class="grid grid-cols-2 gap-3">
                    <UiCard data-test-id="max-rounds-card" class="end-condition p-3">
                        <span class="text-sm text-muted-foreground block mb-2">
                            {{ t('scores.newSession.maxRounds') }}
                        </span>
                        <UiInput
                            v-model.number="maxRounds"
                            data-test-id="max-rounds-input"
                            type="number"
                            class="text-center"
                            min="1"
                            placeholder="--"
                        />
                    </UiCard>
                    <UiCard data-test-id="max-score-card" class="end-condition p-3">
                        <span class="text-sm text-muted-foreground block mb-2">
                            {{ t('scores.newSession.targetScore') }}
                        </span>
                        <UiInput
                            v-model.number="maxScore"
                            data-test-id="max-score-input"
                            type="number"
                            class="text-center"
                            min="1"
                            placeholder="--"
                        />
                    </UiCard>
                </div>
            </section>

            <UiButton
                data-test-id="create-btn"
                class="create-btn w-full mt-6"
                size="lg"
                :disabled="!canCreate"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
                @click="handleCreate"
            >
                {{ t('scores.newSession.create') }}
            </UiButton>
        </div>
    </div>
</template>
