import Vue from 'vue'
import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io';
import VueRouter from 'vue-router';
import store from './vuex/vuex-store.js'

import App from './App.vue'
import OpList from './components/OpList.vue'
import OpDetail from './components/OpDetail.vue'

import config from './config/dev.env.js'

var socketio = SocketIO('http://'+config.bind_host+":"+config.bind_port, {path:config.bind_path});
Vue.use(VueSocketIO, socketio, store);
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
