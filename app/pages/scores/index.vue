<script setup lang="ts">
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
   if (confirm(`Delete session "${name}"?`)) {
      deleteSession(id)
   }
}
</script>

<template>
   <div class="scores-page">
      <header class="scores-page__header">
         <NuxtLink to="/" class="scores-page__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">Scores</h1>
         <NuxtLink to="/scores/new" class="btn-primary scores-page__new">New</NuxtLink>
      </header>

      <div class="scores-page__content">
         <template v-if="isLoaded">
            <ul v-if="sessions.length > 0" class="session-list">
               <li v-for="session in sessions" :key="session.id" class="session-item card-game">
                  <NuxtLink :to="`/scores/${session.id}`" class="session-item__link">
                     <div class="session-item__info">
                        <h2 class="session-item__name">{{ session.name }}</h2>
                        <p class="session-item__meta">
                           {{ session.players.length }} players · Round {{ session.currentRound }}
                        </p>
                        <p class="session-item__date">{{ formatDate(session.updatedAt) }}</p>
                     </div>
                  </NuxtLink>
                  <button class="session-item__delete" @click.prevent="confirmDelete(session.id, session.name)">
                     ×
                  </button>
               </li>
            </ul>

            <div v-else class="scores-page__empty">
               <p>No score sessions yet</p>
               <NuxtLink to="/scores/new" class="btn-primary">Create your first session</NuxtLink>
            </div>
         </template>

         <p v-else class="scores-page__loading">Loading...</p>
      </div>
   </div>
</template>

<style scoped>
.scores-page {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.scores-page__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.scores-page__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.scores-page__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.scores-page__new {
   padding: var(--gap-xs) var(--gap-md);
}

.scores-page__content {
   flex: 1;
   padding: var(--gap-md);
}

.session-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.session-item {
   display: flex;
   align-items: center;
}

.session-item__link {
   flex: 1;
   display: block;
}

.session-item__info {
   display: flex;
   flex-direction: column;
   gap: 2px;
}

.session-item__name {
   font-family: var(--font-display);
   font-size: var(--text-base);
   font-weight: 600;
   color: var(--text-primary);
}

.session-item__meta {
   font-size: var(--text-sm);
   color: var(--text-secondary);
}

.session-item__date {
   font-size: var(--text-xs);
   color: var(--text-secondary);
}

.session-item__delete {
   font-size: var(--text-xl);
   color: var(--text-secondary);
   padding: var(--gap-sm);
}

.session-item__delete:hover {
   color: var(--error);
}

.scores-page__empty {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: var(--gap-md);
   padding: var(--gap-lg);
   text-align: center;
   color: var(--text-secondary);
   min-height: 300px;
}

.scores-page__loading {
   text-align: center;
   color: var(--text-secondary);
   padding: var(--gap-lg);
}
</style>
