<template>
	<div class="editable-cell">
		<input
			type="text"
			ref="inputElement" 
			v-model="type"
			:disabled="disabled" 
			@focus="onFocus"
			@input="onInput"
			@blur="onBlur" 
			@keydown="onKeydown"
		/>
		<div 
			class="event-capture" 
			v-on:click="setEditable(true)" 
			v-bind:class="{disabled: !disabled}"
		/>
		<div class="autocomplete transition autocomplete-list" v-show="showAutocomplete">
			<ul>
				<li v-for="(data, i) in jsonData"
					transition="showAutocomplete"
					:class="isFocused(i)">
					<a href="#"
						@click.prevent="selectList(i)"
						@mousemove="mousemove(i)">
						<span>{{ data[labelAttribute] }}</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	name: 'editable-cell',
	props:{
		value: [String, Number, Object],
		valueAttribute: String,
		labelAttribute: String,
		autocomplete: Boolean,
		acApi: String,
		acParam: String,
		nullable: Boolean,
		format: Function
	},
	data() {
		return {
			disabled: true,
			type: this.value ? (this.labelAttribute ? this.value[this.labelAttribute] : this.value) : '',
			valueObject: this.value,
			showAutocomplete: false,
			jsonData: undefined,
			currentFocus: -1,
			formatedValue: undefined,
			unformatedValue: undefined
		}
	},
	watch:{
		'value': function(newVal, oldVal){
			this.resetText(newVal);
		}
	},
	mounted(){
	},
	methods: {
		setEditable: function(editable) {
			this.disabled = !editable;
			if (editable) {
				this.$nextTick(function() {
					this.$refs.inputElement.focus();
					this.$refs.inputElement.selectionStart = this.value.toString().length;
					this.$refs.inputElement.selectionEnd = this.value.toString().length;
				})
				this.showAutocomplete = true;
			} else {
				this.currentFocus = -1;
				setTimeout(() => {
					this.showAutocomplete = false;
				}, 250);
			}
		},
		onFocus(){
			if(this.format){
				this.type = this.unformatedValue;
			}
			this.onInput();
		},
		onBlur(submit=true){
			if(submit){
				if(!this.autocomplete)
					//emit simple text field to parent
					this.$emit('input', this.type);
				else{
					if(this.nullable && this.type==''){
						this.resetText(null);
						this.$emit('input', null);
					}else if(this.currentFocus < 0)
						this.resetText(this.valueObject);
					else
						this.selectList(this.currentFocus);
				}
			}
			else
				this.resetText(this.valueObject);
			this.setEditable(false);
			if(this.format){
				this.unformatedValue = this.type;
				this.type = this.format(this.type);
			}
		},
		onInput(){
			if(this.autocomplete)
				this.getData(this.type);
			this.type = this.type;
		},
		onKeydown(e) {
			var key = e.keyCode;
			// Disable when disabled
			if (this.disabled) return;
			switch (key) {
				case 40: //down
					this.currentFocus++;
					if(this.jsonData){
						this.currentFocus = this.currentFocus % this.jsonData.length;
					}
					e.preventDefault();
					break;
				case 38: //up
					this.currentFocus--;
					e.preventDefault();
					break;
				case 13: //enter
					this.onBlur(true);
					break;
				case 27: //esc
					this.onBlur(false);
					break;
			}
			console.log(this.currentFocus);
		},
		selectList(i){
			var data = this.jsonData[i];
			this.resetText(data);
			this.$emit('input', data);
		},
		resetText(value){
			setTimeout(() => {
				this.valueObject = value;
				this.showAutocomplete = false;
				this.type = this.labelAttribute ? this.valueObject ? this.valueObject[this.labelAttribute] : '' : this.valueObject;
				this.currentFocus = -1;
			}, 250);
		},
		//AUTOCOMPLETE METHODS
		isFocused(i) {
			return {
				'focused': i == this.currentFocus
			};
		},
		mousemove(i) {
			this.currentFocus = i;
		},
		getData(text) {
			const self = this;
			if (this.acApi != null) {
				var ajax = new XMLHttpRequest();
				ajax.open('GET', `${this.acApi}?${this.acParam}=${text}`, true);
				ajax.send();
				ajax.addEventListener('progress', function(data) {
				});
				ajax.addEventListener('loadend', function(data) {
					var json = JSON.parse(this.responseText);
					self.jsonData = json;
				});
			}
		}
	}
}

</script>

<style scoped>
.editable-cell{
	display: inline-block;
	position:relative;
	width:100%;
}
input, input:focus{
  background-color:transparent;
  border: 0;
  font-size: 1em;
  width:100%;
  color: white;
}
.event-capture{
	position: absolute;
	left:0;
	right:0;
	top:0;
	bottom:0;
}
.event-capture.disabled{
	display: none;
}
.autocomplete ul{
	display: inline-block;
	position: absolute;
	z-index: 100;
	margin: 0;
	list-style-type: none;
}
.autocomplete ul li, .autocomplete ul li a{
	display: block;
	background-color: white;
}
.autocomplete ul li a:hover, .autocomplete ul li.focused a{
	background-color: red;
}
.showAutocomplete-transition{
  opacity: 1;
  height: 50px;
  overflow: hidden;
}

.showAutocomplete-enter{
  opacity: 0.3;
  height: 0;
}
.showAutocomplete-leave{
  display: none;
}
.transition, .autocomplete, .showAutocomplete-transition, .autocomplete ul, .autocomplete ul li a{
  transition:all 0.3s ease-out;
  -moz-transition:all 0.3s ease-out;
  -webkit-transition:all 0.3s ease-out;
  -o-transition:all 0.3s ease-out;
}


</style>
