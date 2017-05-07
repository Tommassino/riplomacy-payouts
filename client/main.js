import Vue from 'vue'
import VueSocketIO from 'vue-socket.io';
import VueRouter from 'vue-router';
import store from './vuex/vuex-store.js'

import App from './App.vue'
import OpList from './components/OpList.vue'
import OpDetail from './components/OpDetail.vue'

import config from './config/dev.env.js'

Vue.use(VueSocketIO, 'http://'+config.bind_host+":"+config.bind_port, store);
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
