require('es6-promise').polyfill();
import Vue from 'vue'
import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io';
import VueRouter from 'vue-router';
import store from './vuex/vuex-store.js'
import dateFormat from 'dateformat';

import App from './App.vue'
import OpList from './components/OpList.vue'
import OpDetail from './components/OpDetail.vue'
import Payouts from './components/Payouts.vue'

import config from './config/dev.env.js'

var socketio = SocketIO('http://' + config.bind_host + ":" + config.bind_port, {
	path: config.bind_path + "/socket.io"
});
Vue.use(VueSocketIO, socketio, store);
Vue.use(VueRouter);

const router = new VueRouter({
	routes: [{
		path: '/ops',
		component: OpList
	}, {
		path: '/op/:opId',
		component: OpDetail
	}, {
		path: '/payouts',
		component: Payouts
	}]
});

Vue.filter('iskString', function(value) {
	return value ? value.toFixed(0).replace(/./g, function(c, i, a) {
		return i && c !== "." && ((a.length - i) % 3 === 0) ? ' ' + c : c;
	})+' ISK' : 0+' ISK';
})

Vue.filter('ageTime', function(value) {
	var diff = Math.ceil((new Date() - new Date(value))/1000)
	var days = Math.floor(diff / (60 * 60 * 24));
	diff -= days * (60 * 60 * 24)
	var hours = Math.floor(diff / (60 * 60));
	diff -= hours * (60 * 60)
	var minutes = Math.floor(diff / 60);
	var seconds = diff - minutes * 60

	if(days>7){
		return dateFormat(value,'mediumDate')
	}else{
		var dateStrings = []
		if(days>0)
			dateStrings.push(days+" days")
		if(hours>0)
			dateStrings.push(hours+" hours")
		if(minutes>0)
			dateStrings.push(minutes+" minutes")
		return dateStrings.join(", ")+" ago"
	}
})

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app-container');

//router.start(App, '#app');