import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

let touchTime = 0;
document.addEventListener('touchstart', function(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
});
document.addEventListener('touchend', function(event) {
  //记录当前点击的时间与下一次时间的间隔
  var nowTime = new Date();    
  if (nowTime.getTime()  - touchTime <= 300) {
    event.preventDefault();
  }
  touchTime = nowTime.getTime();
}, false);
