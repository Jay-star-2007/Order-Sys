<template>
	<view>
		<view>
		<!-- 顶部 -->
		<view class="top-view">
			<view>{{number_people}}人就餐</view>
			<view class="top-view-flex">
				<image src="/static/tab/fenxiang.svg" mode="widthFix"  class="top-search"></image>
			</view>
		</view>
		
		<!-- 轮播图组件 -->
		<view class="swiper-container">
			<swiper class="swiper" 
					indicator-dots 
					autoplay 
					circular 
					:interval="3000" 
					:duration="1000">
				<swiper-item v-for="(item,index) in swiperList" :key="index">
					<image :src="item.image_src" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</view>
		
		<view class="order-view">
			<view class="commodity">
				<!-- 左 -->
				<view class="order-left">
					<scroll-view scroll-y="true" class="scroll-Hei" :scroll-with-animation="true" :enhanced="true" :show-scrollbar="false">
						<block v-for="(item,index) in itemize" :key="index">
							<view class="itemize-text" :class="{active: index == trigger}" @click="itemIze(index,item.cid)">
								<text>{{item.value}}</text>
								<text v-if="item.sele_quantity > 0">{{item.sele_quantity}}</text>
							</view>
						</block>
					</scroll-view>
				</view> 
				<!-- 右 -->
				<view class="order-right">
					<scroll-view scroll-y="true" class="scroll-Hei"  :scroll-with-animation="true" :enhanced="true" :show-scrollbar="false" :scroll-into-view="scroll_into" @scroll="scroLl">
						<block v-for="(item,index) in goods" :key="index">
						<view :id="item.cid" class="rig-height">
							<view class="classif">{{item.label}}</view>
							<view class="classif-goods" v-for="(itemgood,good_index) in item.dishList" :key="good_index" @click="popup_item(true,index,good_index,item.cid,itemgood)">
								<view class="goods-image"><image :src="baseUrl+'/image/dish/'+itemgood.image" mode="aspectFill"></image></view>
								<view class="goods-Price">
									<view class="goods-name">
										<text class="Bold">{{itemgood.name}}</text>
										<!-- <text class="Thinning">已售 {{itemgood.monthlysale}}</text> -->
									</view>
									<view class="unit-price">
										<text class="Symbol">¥</text>
										<text class="Bold">{{itemgood.unitprice}}</text>
										<text class="Thinning">/{{itemgood.unit}}</text>
									</view>
								</view>
								<view class="quantity">
									<view><image v-if="itemgood.quantity > 0" src="/static/tab/jianhao.png" mode="widthFix" @click.stop="reduce(index,good_index,item.cid,itemgood)"></image></view>
									<view><text v-if="itemgood.quantity > 0">{{itemgood.quantity}}</text></view>
									<view><image src="/static/tab/jia.png" mode="widthFix" @click.stop="plus(index,good_index,item.cid,itemgood)"></image></view>
								</view>
							</view>
						</view>
						</block>
						<view style="height: 400rpx;"></view>
					</scroll-view>
				</view>
			</view>
			<!-- 底部 -->
			<view class="order-bottom" @click="pop_Shopping()" :style="{'padding-bottom': Modelmes ? '68rpx' : ''}">
				<view class="Shopping" style="width: 115rpx;">
					<view class="Shopping-left">
						<image src="/static/tab/gouwuche.png" mode="widthFix"></image>
					</view>
					<view class="Shopping-number" v-if="total_quantity > 0">{{total_quantity}}</view>
				</view>
				<view class="Shopping-title" v-if="total_quantity > 0">已点{{total_quantity}}份菜品</view>
				<view class="place-order" @click.stop="total_quantity == 0 ? false : true && placean_order()">
					<button plain="true" open-type="getUserInfo">选好了</button>
				</view>
			</view>
		</view>
	</view>
	<!-- 购物车 -->
	<Cart v-if="card" :shopping_card="shopping_card"></Cart>
	<!-- 引入单个商品弹出 -->
	<Details v-if="popupitem" :pro_details="pro_details"></Details>
	<!-- 骨架屏 -->
	<Home v-if="exist"></Home>
	
	</view>
</template>

<script>
	import {getBaseUrl, requestUtil} from "../../utils/requestUtil.js"
const app = getApp()
const {Modelmes} = app.globalData
// 骨架屏
import Home from '../skeleton-view/home.vue'
// 小程序端一次性只返回20条数据；云函数段100条；外部nodejs，java返回10条
// 引入购物车子组件
import Cart from './components/shopping-cart.vue'
// 引入单个商品弹出
import Details from './components/goods-details.vue'
// 订单编号
import {Code} from '../../config/order.js'
// 计算当天的销售额
import {analysis} from '../../config/Date_analysis.js'
const db = wx.cloud.database()
const _ = db.command
const good_collect= db.collection('order-data')
const dishes_data = db.collection('dishes-data')
export default{
	components:{Cart,Details,Home},
	data() {
		return {
			baseUrl:'',
			exist:true,
			Modelmes,
			itemize:[],//类目
			trigger:0,//类目选中的值
			goods:[],//所有菜品
			heightset:[],//存储右边每一个分类菜品的高度
			tophei:0,//滚动时距离顶部的高度
			scroll_into:'',
			card:false,//购物车隐藏
			shopping_card:[],//购物车里的数据
			popupitem:false,//单个商品弹出框隐藏
			pro_details:{},//单个商品弹出框里的数据
			tmplIds:'FANEJh9NPNhJrLpqQx7UhNerntR5GwEsLKK-95tuvNM',//模板id
			number_people:0,//用餐人数
			swiperList: [
				{
					image_src: "http://localhost/image/swiper/s1.jpg"
				},
				{
					image_src: "http://localhost/image/swiper/s2.jpg" 
				},
				{
					image_src: "http://localhost/image/swiper/s3.jpg"
				}
			],
			isAdditional: false, // 是否是加菜
			currentOrderNo: '', // 当前订单号
		}
	},
	methods:{
		// 点击类目加上背景色
		itemIze(index,cid){
			this.trigger = index
			this.scroll_into = cid
			setTimeout(()=>{
				this.scroll_into = ''
			},200)
		},
		// 右边菜品滚动时触发
		scroLl(event){
			// console.log(event.detail.scrollTop)
			let scrollTop = event.detail.scrollTop
			if(scrollTop >= this.tophei){//上拉
				// 当前分类商品的高度小于滚动高度时跳转下一个分类
				if(scrollTop >= this.heightset[this.trigger]){
					this.trigger += 1
				}
			}else{//下拉
				// 当前分类商品的高度大于滚动高度时跳转下一个分类
				if(scrollTop < this.heightset[this.trigger - 1]){
					this.trigger -= 1
				}
			}
			this.tophei = scrollTop
		},
		
		// 单个商品+
		plus(index,good_index,cid,itemgood){
			const {quantity,image,name,unitprice,unit,id} = itemgood
			const QU = quantity + 1
			this.$set(this.goods[index].dishList[good_index],'quantity',QU)
			const arr = {image,name,unitprice,quantity:QU,unit,total_price:unitprice * QU,id,cid,good_index}
			this.shopping_Cart(arr)
		},
		
		// 单个商品-
		reduce(index,good_index,cid,itemgood){
			const {quantity,image,name,unitprice,unit,id} = itemgood
			const QU = quantity - 1
			this.$set(this.goods[index].dishList[good_index],'quantity',QU)
			const arr = {image,name,unitprice,quantity:QU,unit,total_price:unitprice * QU,id,cid,good_index}
			this.shopping_Cart(arr)
		},
		
		// 添加进购物车的商品
		shopping_Cart(arr){
			// 一：购物车没有数据，空数组：
				// 直接添加进数据
			// 二：购物车里有数据
				// 1.没有相同的菜品存在
				// 2.有相同的菜品存在
			if(this.shopping_card.length == 0){
				// 一：购物车没有数据，空数组：
				this.shopping_card.push(arr)
			}else{
				// 二：购物车里有数据
				let itemindex = this.shopping_card.findIndex(item => item.id == arr.id)
				if(itemindex == -1){
					// 没有相同的菜品存在
					this.shopping_card.unshift(arr)
				}else{
					this.$set(this.shopping_card[itemindex],'quantity',arr.quantity)
					this.$set(this.shopping_card[itemindex],'total_price',arr.total_price)
				}
			}
			console.log(this.shopping_card)
			this.qunint_of_goods()
		},
		
		// 计算左边各分类下添加了多少菜品
		qunint_of_goods(){
			let array = this.shopping_card
			let res = {}
			array.forEach(item=>{
				if(res[item.cid]){
					res[item.cid] += item.quantity
				}else{
					res[item.cid] = item.quantity
				}
			})
			let M = []
			for(let k in res){
				M.push({cid:k,value:res[k]})
			}
			M.forEach(item=>{
				let res_index = this.itemize.findIndex(iteming => iteming.cid == item.cid)
				this.$set(this.itemize[res_index],'sele_quantity', item.value)
			})
		},
		
		
		//购物车商品加减数量
		shopping_Cart_add_sub(index,QU,id,cid,good_index,unitprice){
			this.$set(this.shopping_card[index],'quantity',QU)
			this.$set(this.shopping_card[index],'total_price',QU * unitprice)
			// 根据id唯一标识查询商品的数量做到商品加减同步
			const itemcid = this.goods.findIndex(item=> item.cid == cid)
			this.$set(this.goods[itemcid].dishList[good_index],'quantity',QU)
			this.qunint_of_goods()
		},
		
		// 清空已点：被子组件调用
		empty_data(){
			this.shopping_card = []
			this.itemize.forEach(item=>{item.sele_quantity = 0})
			this.goods.forEach(item=>{
				item.dishList.forEach(T=>{
					T.quantity = 0
				})
			})
			this.pop_Shopping(false)
		},
		
		// 弹出或隐藏单个商品弹出框
		popup_item(value = true,index,good_index,cid,itemgood){
			this.popupitem = value
			this.pro_details = {index,good_index,cid,itemgood}
			console.log(this.pro_details)
		},
		// 显示购物车组件
		pop_Shopping(value = true){
			this.card = value
		},

		// 请求数据
		async dishEs(){
			const res=await requestUtil({url:"/category/listAll",method:"get"})
			const res2=await requestUtil({url:"/dish/listAll",method:"get"})
			console.log(res)
			this.itemize = res.categoryListAll//类目
			this.goods = res2.allDish//所有菜品
			this.$nextTick(()=>{
				this.goods_height()
			})
		},
		// 计算右边每个分类菜品的高度
		goods_height(){
			this.heightset = []
			let cate_height = 0
			const query = wx.createSelectorQuery()
			query.selectAll('.rig-height').boundingClientRect()
			query.exec((res)=>{
				res[0].forEach((item)=>{
					cate_height += item.height
					this.heightset.push(cate_height)
				})
				this.exist = false
			})
		},
		
		// 弹出订阅消息弹窗
		placean_order(){
			// 消息弹窗
			wx.requestSubscribeMessage({
			  tmplIds: [this.tmplIds],
			  success:(res)=>{
				  this.sub_database()
			  },
			  fail:(err)=>{
				  this.sub_database()
			  }
			})
		},
		
		
		// 提交订单
		async sub_database(){
			wx.showLoading({title: '正在下单',mask:true})
			let res = this.shopping_card.filter(item => item.total_price != 0)
			let sett_amount = 0
			res.forEach(item => {sett_amount += item.total_price})
			
			let table_number = wx.getStorageSync('table_num')
			let number_of_diners = wx.getStorageSync('number_of_diners')
			
			let order = {
				table_number,
				number_of_diners,
				sett_amount,
				order_no: this.isAdditional ? this.currentOrderNo : Code(),
				transac_status:'unsettled',
				order_receiving:'mis_orders',
				goods_list:res
			}
			
			const url = this.isAdditional ? '/order/addDishes' : '/order/create'
			const res2 = await requestUtil({
				url: url,
				data: order,
				method: "post"
			})
			
			if(res2.code==0){
				wx.redirectTo({
					url: '/pages/order-details/details'
				})
				wx.hideLoading()
			}
		},
		
		
		// 推送订单提醒
			push_message(){
			var pubsub = this.goeasy.pubsub;
			pubsub.publish({
			    channel: "my_channel",//替换为您自己的channel
			    message: "小程序端来的",//替换为您想要发送的消息内容
			    onSuccess:()=>{
			        console.log("消息发布成功。");
			    },
			    onFailed:(error)=> {
			        console.log("消息发送失败，错误编码："+error.code+" 错误信息："+error.content);
			    }
			});
		},
		
		// 我的订单
		my_order(){
			wx.navigateTo({
				url:'/pages/my-order/my-order'
			})
		}
	},
	onLoad(options) {
		// 判断是否是加菜
		if(options.isAdditional === 'true') {
			this.isAdditional = true
			this.currentOrderNo = options.orderNo
		}
		
		// 获取用餐人数
		this.number_people = wx.getStorageSync('number_of_diners')
		this.baseUrl=getBaseUrl()
		this.dishEs()
	},
	computed:{
		// 计算购物车的菜品总数
		total_quantity(){
			// var 
			// let
			// const
			let quantity = 0
			this.shopping_card.forEach(item=>{
				quantity += item.quantity
			})
			return quantity
		}
	}
}
</script>

<style scoped>
.top-view{
	background:linear-gradient(to bottom, #ffbdbd,#ffbdbd,#ffbdbd,#ffbdbd, #ffbdbd);
	height: 120rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
}
.top-view image{
	display: block;
	width: 35rpx;
	height: 35rpx;
}
.top-view-flex{
	display: flex;
	align-items: center;
}
.top-search{padding-right: 50rpx;}
/* 点餐界面 */
.order-view{
	padding-top: 440rpx;
	height: 100vh;
	box-sizing: border-box;
}
.commodity{
	display: flex;
	height: 100%;
	left: 0;
	right: 0;
}
.order-left{
	background-color: #ffffff;
	width: 150rpx;
	height: 100%;
	overflow-y: auto;
}
.itemize-text{
	font-size: 27rpx;
	padding: 30rpx 10rpx;
	display: flex;
	align-items: center;
	color: #797979;
}
.itemize-text text:nth-child(1){flex: 1;}
.itemize-text text:nth-child(2){
	background-color: #eb5941;
	border-radius: 50%;
	font-size: 20rpx;
	color: #FFFFFF;
	width: 30rpx;
	height: 30rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 2rpx;
}
.scroll-Hei{
	height: calc(100% - 120rpx); /* 只减去底部购物车的高度 */
	/* white-space: nowrap; */
}
.order-right{
	background-color: #FFFFFF;
	flex: 1;
	overflow-y: auto;
}
.classif{
	font-size: 27rpx;
	padding: 30rpx 20rpx;
	color: #797979;
}
/* 分类商品 */
.classif-goods{
	display: flex;
	justify-content: space-between;
	padding: 0 20rpx;
	height: 150rpx;
	font-size: 30rpx;
	margin-bottom: 45rpx;
}

.goods-image image{
	display: block;
	width: 150rpx;
	height: 150rpx;
	border-radius: 10rpx;
}
.goods-Price{
	flex: 1;
	position: relative;
	padding: 0 20rpx;
}
.goods-Price text{display: block;}
.goods-name{
	display: flex;
	flex-direction: column;
	position: relative;
	top: 0;
}
.goods-name text:nth-child(1){padding-bottom: 9rpx;}
.unit-price{
	position: absolute;
	bottom: 0;
	display: flex;
	align-items: baseline;
}
.Bold{font-weight: bold;}
.Symbol{font-size: 20rpx;}
.Thinning{font-size: 25rpx;
color: #cccccc;
}
.quantity image{width: 50rpx; height: 50rpx;}
.quantity view{
	width: 50rpx;
	height: 50rpx;
	text-align: center;
    line-height: 50rpx;
}
.quantity{
	display: flex;
	align-items: center;
	align-self: flex-end;
	width: 200rpx;
	justify-content: space-between;
}
.order-bottom{
	background-color: #fefefe;
	height: 120rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	box-shadow: 0rpx -1.9rpx 1rpx 1rpx #f9f9f9;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20rpx;
	z-index: 9;
}
.Shopping image{width: 75rpx; height: 75rpx; display: block;}
.Shopping-left{width: 75rpx; height: 75rpx;}
.Shopping{
	display: flex;
	align-items: center;
	/* height: 120rpx; */
}
.Shopping-number{
	align-self: flex-start;
	background: #eb5941;
	color: #ffff;
	width: 40rpx;
	border-radius: 50rpx;
	text-align: center;
	font-size: 20rpx;
	/* margin-top: 15rpx; */
}
.Shopping-title{
	flex: 1;
	padding: 0 25rpx;
	color: #999999;
	/* height: 120rpx;
	line-height: 120rpx; */
}
.place-order button{
	border: none;
	background:linear-gradient(to right,#ff8f8f,#ff8f8f,#ff8f8f,#ff8f8f);
	width: 200rpx;
	height: 75rpx;
	line-height: 75rpx;
	border-radius: 50rpx;
	font-weight: bold;
	z-index: 9;
}
/* 点击分类列表加上背景色 */
.active{
	background-color: #FFFFFF;
	color: #000000 !important;
}
/* 轮播图样式 */
.swiper-container {
	position: fixed;
	top: 120rpx;
	left: 0;
	right: 0;
	padding: 20rpx;
	background: #fff;
	z-index: 1;
}
.swiper {
	width: 100%;
	height: 300rpx;
	border-radius: 15rpx;
	overflow: hidden;
}
.swiper image {
	width: 100%;
	height: 100%;
}
</style>
