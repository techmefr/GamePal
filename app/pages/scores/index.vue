<script setup lang="ts">
import { ArrowLeft, Plus, Trash2, Users, Clock } from 'lucide-vue-next'

const { t } = useI18n()
const { sessions, isLoaded, deleteSession } = useScoreSessions()

function formatDate(dateString: string): string {
   const date = new Date(dateString)
   return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
   })
}

function confirmDelete(id: string, name: string): void {
   if (confirm(t('scores.deleteConfirm', { name }))) {
      deleteSession(id)
   }
}
</script>

<template>
   <div class="min-h-dvh bg-background">
      <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center gap-4 px-4 py-4">
            <NuxtLink
               to="/"
               class="scores-page__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, x: -10 }"
               :enter="{ opacity: 1, x: 0 }"
            >
               <ArrowLeft class="h-5 w-5" />
            </NuxtLink>
            <h1
               class="heading flex-1 font-display text-lg font-bold tracking-tight"
               v-motion
               :initial="{ opacity: 0, y: -10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
               {{ t('scores.title') }}
            </h1>
            <NuxtLink
               to="/scores/new"
               v-motion
               :initial="{ opacity: 0, scale: 0.8 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 150 } }"
            >
               <UiButton size="sm" class="scores-page__new">
                  <Plus class="h-4 w-4 mr-1" />
                  {{ t('scores.new') }}
               </UiButton>
            </NuxtLink>
         </div>
      </header>

      <div class="p-4">
         <template v-if="isLoaded">
            <ul v-if="sessions.length > 0" class="space-y-3">
               <li
                  v-for="(session, index) in sessions"
                  :key="session.id"
                  v-motion
                  :initial="{ opacity: 0, y: 20 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: 150 + index * 50 } }"
               >
                  <UiCard hoverable class="session-item p-4">
                     <div class="flex items-center gap-3">
                        <NuxtLink :to="`/scores/${session.id}`" class="flex-1">
                           <h2 class="font-display font-semibold text-foreground mb-1">
                              {{ session.name }}
                           </h2>
                           <div class="flex items-center gap-3 text-sm text-muted-foreground">
                              <span class="flex items-center gap-1">
                                 <Users class="h-3.5 w-3.5" />
                                 {{ session.players.length }} {{ t('scores.players') }}
                              </span>
                              <span class="flex items-center gap-1">
                                 <Clock class="h-3.5 w-3.5" />
                                 {{ t('scores.round') }} {{ session.currentRound }}
                              </span>
                           </div>
                           <p class="text-xs text-muted-foreground mt-1">
                              {{ formatDate(session.updatedAt) }}
                           </p>
                        </NuxtLink>
                        <button
                           class="session-item__delete p-2 text-muted-foreground hover:text-destructive transition-colors"
                           @click.prevent="confirmDelete(session.id, session.name)"
                        >
                           <Trash2 class="h-5 w-5" />
                        </button>
                     </div>
                  </UiCard>
               </li>
            </ul>

            <div
               v-else
               class="scores-empty flex flex-col items-center justify-center gap-4 py-16 text-center"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            >
               <p class="text-muted-foreground">{{ t('scores.noSessions') }}</p>
               <NuxtLink to="/scores/new">
                  <UiButton>{{ t('scores.createFirst') }}</UiButton>
               </NuxtLink>
            </div>
         </template>

         <p
            v-else
            class="text-center text-muted-foreground py-12"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1 }"
         >
            {{ t('common.loading') }}
         </p>
      </div>
   </div>
</template>
