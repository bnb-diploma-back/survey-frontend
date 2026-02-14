import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import LikertTestPage from '../views/LikertTestPage.vue'
import SurveyResultPage from '../views/SurveyResultPage.vue'
import ObtainResultPage from '../views/ObtainResultPage.vue'
import DeclinedPage from '../views/DeclinedPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/declined', name: 'declined', component: DeclinedPage },
    { path: '/survey', name: 'survey', component: LikertTestPage },
    { path: '/survey/:id', name: 'survey-result', component: SurveyResultPage },
    { path: '/result', name: 'obtain-result', component: ObtainResultPage }
  ]
})

export default router
