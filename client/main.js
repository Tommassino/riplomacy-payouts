import Vue from 'vue'
import VueSocketIO from 'vue-socket.io';
import VueRouter from 'vue-router';
import store from './vuex/vuex-store.js'

import App from './App.vue'
import OpList from './components/OpList.vue'
import OpDetail from './components/OpDetail.vue'

Vue.use(VueSocketIO, 'http://localhost:3000', store);
Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{
			path: '/ops',
			component: OpList
		},
		{
			path: '/op/:opId',
			component: OpDetail
		}
	]
});

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app-container');

//router.start(App, '#app');
