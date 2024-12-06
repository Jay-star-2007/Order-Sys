<template>
<view>
	<view class="welcome">
		<!-- <text>欢迎光临！！！</text>
		<text>这里是 城院小餐馆</text> -->
	</view>
	
	<!-- 方块 -->
	<view class="people-view">
		<view class="hello">客官~~ 您几位？</view>
		<view class="table-num">桌号：{{table_number}}</view>
		<!-- 滑动 -->
		<view class="table-num table-scroll">
			<scroll-view scroll-x="true" class="scroll-view_H" :enable-flex="true">
				<view class="table-block">
					<block v-for="(item,index) in people" :key="index">
					<view @click="choIce(index,item)" :class="{activetext: index === num}">{{item}}</view>
					</block>
				</view>
			</scroll-view>
		</view>
		<!-- 按钮 -->
		<view class="start-diancan" :class="[num > -1 ? 'start-activ' : '']" @click="stArt()">开始点餐</view>
	</view>
</view>
</template>

<script>

export default {
	data() {
		return {
			num:-1,
			people: [1,2,3,4,5,6,7,8,9,10],
			table_number:null,
		}
	},
	methods: {
		// 选择人数
		choIce(index,item){
			this.num = index
			wx.setStorageSync('number_of_diners', item)
		},
		
		// 开始点餐
		stArt(){
			if(this.num <= -1)return false
			wx.reLaunch({
				url:'/pages/home-page/page'
			})
		}
		

	},
	onLoad(e) {
		console.log("e:"+e)
		this.table_number = e.number
		wx.setStorageSync('table_num', e.number)
	}
}
</script>

<style>
page{
	background-image: url('http://localhost/image/qrcode/order-c.png');
	background-attachment: fixed;
	background-repeat: no-repeat;
	/* background-size: cover; */
	background-size: cover;
}
.welcome{
	color: #FFFFFF;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 50rpx;
	padding-bottom: 30rpx;
	font-style: normal;
}
.welcome text{
	display: block;
	font-size: 50rpx;
}
.welcome text:nth-child(1){
	font-family: monospace;
	padding-bottom: 20rpx;
}
/* 方块 */
.people-view{
	background-color: #FFFFFF;
	position: fixed;
	left: 30rpx;
	right: 30rpx;
	bottom: 50rpx;
	height: 550rpx;
	border-radius: 15rpx;
}
.hello{
	height: 80rpx;
	font-size: 35rpx;
	font-weight: bold;
	line-height: 80rpx;
	padding-left: 20rpx;
	/* color: #ff557f; */
}
.table-num{
	font-size: 30rpx;
	padding-left: 20rpx;
}
.table-scroll{
	margin-top: 100rpx;
}
.scroll-view_H{
  white-space: nowrap;
  width: 100%;
  height: 75rpx;
}
.table-block{
	display: flex;
	align-items: center;
}
.table-block view{
	height: 75rpx;
	line-height: 75rpx;
	text-align: center;
	background-color: #f7f8f9;
	margin-right: 25rpx;
	padding: 0 70rpx;
	border-radius: 15rpx;
}
/* 按钮 */
.start-diancan{
	height: 90rpx;
	line-height: 90rpx;
	background-color: #fdcaba;
	color: #ffd5cf;
	text-align: center;
	margin: 130rpx 20rpx 0 20rpx;
	border-radius: 15rpx;
}
/* 点击后加上颜色*/
.activetext{
	background-color: #ff7575 !important;
}
.start-activ{
	/* background-color: #f6c947 !important; */
	color: #000000 !important;
	background:linear-gradient(to right,#ff8f8f,#fdcaba,#ff8f8f,#ff7575) !important;
}
</style>
