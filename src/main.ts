import { createApp } from 'vue'
import './reset.css'
import './style.css'
import App from './App.vue'
import router from "./router";
import 'uno.css'

createApp(App).use(router).mount('#app')
